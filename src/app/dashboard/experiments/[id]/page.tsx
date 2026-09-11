import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/utils/prisma";
import {
  updateVariant,
  activateExperiment,
  completeExperiment,
  updateTargetSelector,
  createVariantAction,
  promoteVariantAction,
  clearSimulationAction,
} from "./actions";
import AiGenerator from "./ai-generator";
import InstallationChecker from "./installation-checker";
import WinnerBanner from "./winner-banner";
import SimulationControls from "./simulation-controls";
import { ArrowLeft, Play, CheckCircle2, BarChart3, Layers, Trophy, Sparkles } from "lucide-react";

export default async function ExperimentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: 'all' | 'real' | 'simulated' }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { filter = 'all' } = await searchParams;

  const experiment = await prisma.experiment.findFirst({
    where: { id, userId: user.id },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });

  if (!experiment) notFound();

  // Query events based on filter (All, Real, Simulated)
  const eventWhere: any = { experimentId: experiment.id };
  if (filter === 'real') {
    eventWhere.isSimulated = false;
  } else if (filter === 'simulated') {
    eventWhere.isSimulated = true;
  }

  const eventsGrouped = await prisma.event.groupBy({
    by: ["variantId", "eventType"],
    where: eventWhere,
    _count: { id: true },
  });

  // Map events to variants
  const variantMetricsMap: Record<string, { impressions: number; conversions: number }> = {};
  for (const group of eventsGrouped) {
    if (!variantMetricsMap[group.variantId]) {
      variantMetricsMap[group.variantId] = { impressions: 0, conversions: 0 };
    }
    if (group.eventType === "impression") {
      variantMetricsMap[group.variantId].impressions = group._count.id;
    } else if (group.eventType === "conversion") {
      variantMetricsMap[group.variantId].conversions = group._count.id;
    }
  }

  // Calculate totals and metrics
  const variantStats = experiment.variants.map((v) => {
    const eventImp = variantMetricsMap[v.id]?.impressions || 0;
    const eventConv = variantMetricsMap[v.id]?.conversions || 0;

    // Use event records, fallback to legacy counter if filter === 'all' and no events
    const impressions = filter === 'all' ? Math.max(v.visits, eventImp) : eventImp;
    const conversions = filter === 'all' ? Math.max(v.conversions, eventConv) : eventConv;
    const convRate = impressions > 0 ? (conversions / impressions) * 100 : 0;
    return {
      ...v,
      impressions,
      conversions,
      convRate,
    };
  });

  const totalImpressions = variantStats.reduce((sum, v) => sum + v.impressions, 0);

  // Identify control variant
  const controlVariant = variantStats.find((v) => v.name.toLowerCase().includes('control')) || variantStats[0];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const goalColors: Record<string, string> = {
    Click: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Signup: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Purchase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Custom: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
                C
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Click<span className="text-indigo-400">Ward</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {(experiment.status === "Draft" || experiment.status === "Paused") && (
              <form action={activateExperiment}>
                <input type="hidden" name="experimentId" value={experiment.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Activate Experiment
                </button>
              </form>
            )}

            {(experiment.status === "Active" || experiment.status === "Running" || experiment.status === "Collecting Data" || experiment.status === "Winner Candidate") && (
              <form action={completeExperiment}>
                <input type="hidden" name="experimentId" value={experiment.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Mark as Completed
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* Experiment Meta Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {experiment.name}
                </h1>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                    experiment.status === "Active" || experiment.status === "Running" || experiment.status === "Collecting Data"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : experiment.status === "Winner Candidate"
                      ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                      : experiment.status === "Completed"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {(experiment.status === "Active" || experiment.status === "Running" || experiment.status === "Collecting Data") && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  )}
                  {experiment.status}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    goalColors[experiment.goal] || "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  Goal: {experiment.goal}
                </span>
              </div>

              {experiment.description && (
                <p className="text-slate-400 text-sm mt-2">{experiment.description}</p>
              )}
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Target Selector: <code className="text-indigo-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-bold">{experiment.targetSelector || '#clickward-demo-cta'}</code>
            </div>
          </div>
        </div>

        {/* Winner Banner (Candidate Detection & 1-Click Winner Promotion) */}
        <WinnerBanner
          experimentId={experiment.id}
          experimentStatus={experiment.status}
          winningVariantId={experiment.winningVariantId}
          variants={variantStats}
          onPromoteVariantAction={promoteVariantAction}
        />

        {/* Installation & Verification Checklist Component */}
        <InstallationChecker
          experimentId={experiment.id}
          targetSelector={experiment.targetSelector || "#clickward-demo-cta"}
          appUrl={appUrl}
        />

        {/* Traffic Simulator Controls & View Filter */}
        <SimulationControls
          experimentId={experiment.id}
          variants={experiment.variants.map((v) => ({ id: v.id, name: v.name, ctaText: v.ctaText }))}
          activeFilter={filter}
          onClearSimulationAction={clearSimulationAction}
        />

        {/* Analytics Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Variant Performance & Analytics</h2>
            </div>
            <span className="text-xs text-slate-400">
              Filtered Impressions: <strong className="text-white font-mono">{totalImpressions}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variantStats.map((variant) => {
              const isControl = variant.id === controlVariant?.id;
              const isWinningPromoted = experiment.winningVariantId === variant.id;
              
              // Calculate relative improvement vs control
              let relImprovement = 0;
              if (!isControl && controlVariant && controlVariant.convRate > 0) {
                relImprovement = ((variant.convRate - controlVariant.convRate) / controlVariant.convRate) * 100;
              }

              return (
                <div
                  key={variant.id}
                  className={`bg-slate-900/80 border rounded-2xl p-6 relative overflow-hidden transition-all ${
                    isWinningPromoted
                      ? "border-emerald-500/60 shadow-lg shadow-emerald-500/10"
                      : "border-slate-800"
                  }`}
                >
                  {isWinningPromoted && (
                    <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      100% Promoted Winner
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">{variant.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          CTA: &quot;{variant.ctaText}&quot;
                        </p>
                      </div>

                      {!isControl && relImprovement !== 0 && (
                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border font-mono ${
                            relImprovement > 0
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          {relImprovement > 0 ? "+" : ""}{relImprovement.toFixed(1)}% vs Control
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-center">
                      <div>
                        <p className="text-2xl font-extrabold text-white font-mono">{variant.impressions}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Impressions</p>
                      </div>

                      <div>
                        <p className="text-2xl font-extrabold text-white font-mono">{variant.conversions}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Conversions</p>
                      </div>

                      <div>
                        <p
                          className={`text-2xl font-extrabold font-mono ${
                            isWinningPromoted ? "text-emerald-400" : "text-indigo-400"
                          }`}
                        >
                          {variant.convRate.toFixed(1)}%
                        </p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Conv. Rate</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                        <span>Traffic Allocation ({variant.allocation}%)</span>
                        <span>{variant.convRate.toFixed(1)}% CVR</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWinningPromoted ? "bg-emerald-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${Math.min(variant.convRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Variant Generator Modal/Panel */}
        {experiment.status !== "Completed" && (
          <AiGenerator
            experimentId={experiment.id}
            experimentName={experiment.name}
            experimentDescription={experiment.description}
            experimentGoal={experiment.goal}
            controlVariant={controlVariant ? {
              headline: controlVariant.headline,
              description: controlVariant.description,
              ctaText: controlVariant.ctaText,
            } : undefined}
            onSaveVariantAction={createVariantAction}
          />
        )}

        {/* Configured Variants Editor List */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Configured Variants ({experiment.variants.length})</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiment.variants.map((variant, idx) => (
              <div
                key={variant.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm"
              >
                <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                        idx === 0
                          ? "bg-indigo-600"
                          : idx === 1
                          ? "bg-purple-600"
                          : "bg-emerald-600"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-bold text-slate-200 text-sm">{variant.name}</span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Allocation: {variant.allocation}%
                  </span>
                </div>

                <form action={updateVariant} className="p-6 space-y-4">
                  <input type="hidden" name="variantId" value={variant.id} />
                  <input type="hidden" name="experimentId" value={experiment.id} />

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Variant Name</label>
                    <input
                      name="name"
                      defaultValue={variant.name}
                      disabled={experiment.status === "Completed"}
                      className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Headline</label>
                    <input
                      name="headline"
                      defaultValue={variant.headline}
                      disabled={experiment.status === "Completed"}
                      className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                    <textarea
                      name="description"
                      defaultValue={variant.description}
                      rows={2}
                      disabled={experiment.status === "Completed"}
                      className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      CTA Button Text (Modifies Text Content)
                    </label>
                    <input
                      name="ctaText"
                      defaultValue={variant.ctaText}
                      disabled={experiment.status === "Completed"}
                      className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Target Link / Href URL (Optional Href Modification)
                    </label>
                    <input
                      name="targetHref"
                      defaultValue={variant.targetHref || ""}
                      placeholder="e.g. https://your-site.com/special-offer"
                      disabled={experiment.status === "Completed"}
                      className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Traffic Allocation %
                      </label>
                      <input
                        type="number"
                        name="allocation"
                        min={0}
                        max={100}
                        defaultValue={variant.allocation}
                        disabled={experiment.status === "Completed"}
                        className="w-28 px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Visibility Status
                      </label>
                      <select
                        name="targetVisible"
                        defaultValue={variant.targetVisible ? "true" : "false"}
                        disabled={experiment.status === "Completed"}
                        className="px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="true">Visible</option>
                        <option value="false">Hidden (display: none)</option>
                      </select>
                    </div>
                  </div>

                  {experiment.status !== "Completed" && (
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-bold text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-all mt-2"
                    >
                      Save Changes to Variant
                    </button>
                  )}
                </form>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
