'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Code2, Target } from 'lucide-react'

interface SnippetBoxProps {
  experimentId: string
  targetSelector: string
  appUrl: string
  onSaveTargetSelector: (formData: FormData) => Promise<void>
}

export default function SnippetBox({
  experimentId,
  targetSelector,
  appUrl,
  onSaveTargetSelector,
}: SnippetBoxProps) {
  const [copied, setCopied] = useState(false)
  const [selector, setSelector] = useState(targetSelector || '#clickward-demo-cta')

  const snippetCode = `<script async src="${appUrl}/sdk.js" data-experiment="${experimentId}"></script>`

  function handleCopy() {
    navigator.clipboard.writeText(snippetCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* 1. Target Selector Configuration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Target Element Selector</h3>
        </div>
        <p className="text-xs text-slate-500">
          Specify the CSS selector of the button or CTA element on your target website that ClickWard should substitute with variant copy.
        </p>

        <form action={onSaveTargetSelector} className="flex gap-2">
          <input type="hidden" name="experimentId" value={experimentId} />
          <input
            type="text"
            name="targetSelector"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="e.g. #clickward-demo-cta or .buy-now-btn"
            className="flex-1 px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shrink-0"
          >
            Save Target
          </button>
        </form>
      </div>

      {/* 2. One-Line Script Snippet */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">ClickWard JavaScript Snippet</h3>
          </div>
          <a
            href={`/demo?expId=${experimentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Test on Live Demo
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-xs text-slate-500">
          Add this single line of code into the <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">&lt;head&gt;</code> of your website to activate this experiment.
        </p>

        <div className="relative group">
          <pre className="bg-slate-950 text-indigo-300 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800 select-all">
            {snippetCode}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-md flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copy Snippet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
