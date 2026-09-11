import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createExperiment } from "./actions";

export default async function NewExperimentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">ClickWard</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create a new experiment</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Fill in the details below. Two default variants will be created for you to edit.
          </p>
        </div>

        {params?.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm">
            {params.error}
          </div>
        )}

        <form action={createExperiment} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Experiment Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Checkout CTA Test"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="What are you testing and why?"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm resize-none"
            />
          </div>

          {/* Goal */}
          <div>
            <label htmlFor="goal" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Goal <span className="text-red-500">*</span>
            </label>
            <select
              id="goal"
              name="goal"
              required
              defaultValue="Click"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm bg-white"
            >
              <option value="Click">Click (Default)</option>
              <option value="Signup">Signup</option>
              <option value="Purchase">Purchase</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Target Selector */}
          <div>
            <label htmlFor="targetSelector" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Target Selector <span className="text-slate-400 font-normal">(CSS Selector)</span>
            </label>
            <input
              id="targetSelector"
              name="targetSelector"
              type="text"
              defaultValue="#hero-cta"
              placeholder="e.g. #hero-cta or .btn-primary"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">The CSS selector of the button or link element you want ClickWard to modify (e.g. #hero-cta).</p>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              Two variants — <strong>Control</strong> and <strong>Variant B</strong> — will be created automatically. You can edit their content after creation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 text-center py-2.5 px-4 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Create Experiment
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
