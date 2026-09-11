import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import prisma from "@/utils/prisma";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const experiments = await prisma.experiment.findMany({
    where: { userId: user.id },
    include: { _count: { select: { variants: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">ClickWard</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back 👋</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage your experiments and track performance.</p>
          </div>
          <Link
            href="/dashboard/experiments/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Experiment
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Experiments", value: experiments.length },
            { label: "Active", value: experiments.filter((e) => e.status === "Active").length },
            { label: "Completed", value: experiments.filter((e) => e.status === "Completed").length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-100 px-5 py-4 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Experiment List */}
        {experiments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No experiments yet</h2>
            <p className="text-slate-500 text-sm mb-6">Create your first experiment and start testing product ideas.</p>
            <Link
              href="/dashboard/experiments/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Experiment
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {experiments.map((exp) => (
              <Link
                key={exp.id}
                href={`/dashboard/experiments/${exp.id}`}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-semibold text-slate-900 text-base truncate group-hover:text-blue-600 transition-colors">
                        {exp.name}
                      </h2>
                      <span
                        className={`badge flex-shrink-0 ${
                          exp.status === "Active"
                            ? "badge-active"
                            : exp.status === "Completed"
                            ? "badge-completed"
                            : "badge-draft"
                        }`}
                      >
                        {exp.status === "Active" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                        )}
                        {exp.status}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-slate-500 text-sm truncate">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-6 ml-6 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-slate-700">{exp._count.variants}</div>
                      <div className="text-xs text-slate-400">Variants</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-slate-700">
                        {new Date(exp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="text-xs text-slate-400">Created</div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
