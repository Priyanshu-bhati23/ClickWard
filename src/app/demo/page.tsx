import Link from 'next/link'
import { Sparkles, ArrowRight, Zap, RefreshCw, CheckCircle, Code, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'ClickWard - Live Interactive Demo Page',
  description: 'Test ClickWard A/B testing JavaScript snippet live in action.',
}

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ expId?: string }>
}) {
  const { expId } = await searchParams
  const activeExpId = expId || ''

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Click<span className="text-indigo-400">Ward</span> <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">Live Demo Site</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/experiments/new"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create Experiment
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Mock Customer Website Hero Section */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-sm relative shadow-2xl overflow-hidden space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-slate-400 font-mono ml-2">https://customer-website.com</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Vercel Deployed Website
            </span>
          </div>

          <div className="space-y-6 py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" /> High-Converting Customer Landing Page
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Build products customers love
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed">
              ClickWard dynamically modifies target elements on live Vercel deployments, assigns visitors deterministically, and tracks conversion events without needing website redeployment.
            </p>

            {/* Target CTA Element for ClickWard Experimentation SDK */}
            <div className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  id="hero-cta"
                  href="/demo?action=cta_clicked"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </a>

                <button
                  id="clickward-demo-cta"
                  data-clickward-cta="true"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>Secondary CTA Button</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                <span>Default Target Selectors:</span>
                <code className="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">#hero-cta</code>
                <span>or</span>
                <code className="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">#clickward-demo-cta</code>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-white">99.9%</p>
                <p className="text-xs text-slate-400">SDK Uptime SLA</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">0 Deployment</p>
                <p className="text-xs text-slate-400">For Winner Promotion</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">&lt; 3ms</p>
                <p className="text-xs text-slate-400">SDK Execution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Demo Instructions & Tester Console */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Live SDK Simulator Console</h2>
                <p className="text-xs text-slate-400">Simulate how ClickWard replaces elements on live Vercel sites</p>
              </div>
            </div>

            <form action="/demo" method="GET" className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Paste Active Experiment ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="expId"
                  defaultValue={activeExpId}
                  placeholder="e.g. 8f2a1b94-..."
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Inject
                </button>
              </div>
            </form>

            {activeExpId ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-emerald-200">
                  ClickWard SDK active for Experiment <code className="font-mono font-bold text-white">{activeExpId.slice(0, 8)}...</code>.
                  Target CTA elements on the left are dynamically updated!
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-400">
                💡 Pass <code className="text-indigo-300 font-mono">?expId=YOUR_EXPERIMENT_ID</code> in the URL or paste your ID above to test live element modification.
              </div>
            )}

            {/* Steps Guide */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">End-to-End Testing Guide:</h3>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                <li>Create an experiment in <Link href="/dashboard" className="text-indigo-400 underline">Dashboard</Link>.</li>
                <li>Set Target Selector to <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded font-mono">#hero-cta</code> or <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded font-mono">#clickward-demo-cta</code>.</li>
                <li>Use <strong>Groq AI</strong> to generate conversion variants.</li>
                <li>Activate experiment & copy script snippet.</li>
                <li>Load this page with your Experiment ID or paste snippet into HTML.</li>
                <li>Click the CTA button to trigger a conversion event!</li>
                <li>Promote the winning variant and observe 100% traffic allocation without redeployment!</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href="/demo"
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Demo Page
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Dynamically inject ClickWard SDK script if expId is present */}
      {activeExpId && (
        <script
          async
          src={`/sdk.js`}
          data-experiment={activeExpId}
        />
      )}
    </div>
  )
}
