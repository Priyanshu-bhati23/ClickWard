"use client";

import { useState } from "react";

interface Variant {
  id: string;
  name: string;
  headline: string;
  description: string;
  ctaText: string;
}

export default function PublicExperimentClient({
  variant,
  experimentId,
}: {
  variant: Variant;
  experimentId: string;
}) {
  const [converted, setConverted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCTA() {
    if (converted || loading) return;
    setLoading(true);
    try {
      await fetch(`/api/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id }),
      });
    } catch (e) {
      // silent fail
    } finally {
      setConverted(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full">
        {!converted ? (
          <div className="text-center animate-fade-up">
            {/* Brand */}
            <div className="inline-flex items-center gap-2 mb-10">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-slate-700">ClickWard</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              {variant.headline}
            </h1>
            <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed mb-10">
              {variant.description}
            </p>

            <button
              onClick={handleCTA}
              disabled={loading}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold text-lg px-10 py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {variant.ctaText}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>

            <p className="mt-6 text-xs text-slate-400">This is an A/B experiment powered by ClickWard.</p>
          </div>
        ) : (
          <div className="text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">You're in! 🎉</h2>
            <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">
              Thanks for clicking. Your interaction has been recorded.
            </p>
            <p className="text-xs text-slate-400">Powered by ClickWard — Product Experimentation</p>
          </div>
        )}
      </div>
    </div>
  );
}
