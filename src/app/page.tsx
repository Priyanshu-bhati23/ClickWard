import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">ClickWard</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-5 py-2 rounded-lg shadow-sm"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mesh-bg flex-1 flex items-center justify-center pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pill badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse inline-block"></span>
            Lightweight A/B Testing for Modern Teams
          </div>

          <h1 className="animate-fade-up animate-delay-100 text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
            Test product changes.{" "}
            <span className="gradient-text">Know what works.</span>
          </h1>

          <p className="animate-fade-up animate-delay-200 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
            ClickWard helps teams run simple A/B experiments and understand
            which product experience performs better — without the complexity.
          </p>

          <div className="animate-fade-up animate-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
            >
              Create Experiment
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5"
            >
              View Demo
            </Link>
          </div>

          {/* Social proof */}
          <p className="animate-fade-up animate-delay-400 mt-8 text-xs text-slate-400 font-medium">
            No credit card required · Free to get started
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-slate-100 bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "2 min", label: "To create an experiment" },
            { value: "50/50", label: "Automatic variant split" },
            { value: "Real-time", label: "Conversion tracking" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Everything you need to run experiments
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Built for simplicity. No bloat, no complexity — just clean,
              fast experimentation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                ),
                color: "bg-blue-50",
                title: "Create experiments",
                desc: "Define your experiment in seconds. Name it, set your goal, and you're ready to test.",
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                color: "bg-purple-50",
                title: "Compare variants",
                desc: "Create A and B variants with different headlines, descriptions, and CTAs. Edit anytime.",
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                color: "bg-emerald-50",
                title: "Track results",
                desc: "See visits, conversions, and conversion rates for each variant updated in real-time.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 hover:-translate-y-1 bg-white"
              >
                <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 mesh-bg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              How ClickWard works
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { step: "01", title: "Create your experiment", desc: "Give it a name, write a description, and choose what you're optimizing for (clicks, signups, purchases)." },
              { step: "02", title: "Define your variants", desc: "Write two versions of your product copy — the control and the challenger. Edit headlines, descriptions, and CTAs." },
              { step: "03", title: "Share the experiment link", desc: "Activate your experiment to get a public shareable URL. Anyone who opens it gets randomly assigned to a variant." },
              { step: "04", title: "Review the results", desc: "See real-time visits, conversions, and conversion rates side-by-side. Know which variant wins." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex gap-5">
                <div className="text-3xl font-black text-slate-100 select-none flex-shrink-0">{item.step}</div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to start testing?
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Create your first experiment in minutes. No setup required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Create Experiment — It's free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm">ClickWard</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ClickWard. Lightweight product experimentation.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
