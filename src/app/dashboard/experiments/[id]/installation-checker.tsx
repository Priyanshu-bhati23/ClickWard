'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, ExternalLink, Terminal } from 'lucide-react'

interface InstallationCheckerProps {
  experimentId: string
  targetSelector: string
  appUrl: string
}

export default function InstallationChecker({
  experimentId,
  targetSelector,
  appUrl,
}: InstallationCheckerProps) {
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: 'CONNECTED' | 'NOT_DETECTED' | 'ERROR'
    message: string
    totalEvents?: number
    lastEventAt?: string
  } | null>(null)

  const snippetCode = `<script async src="${appUrl}/sdk.js" data-experiment="${experimentId}"></script>`

  function handleCopy() {
    navigator.clipboard.writeText(snippetCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleTestInstallation() {
    setTesting(true)
    try {
      const res = await fetch(`/api/sdk/test-install?experimentId=${experimentId}`)
      const data = await res.json()
      if (res.ok) {
        setTestResult(data)
      } else {
        setTestResult({
          status: 'ERROR',
          message: data.error || 'Failed to verify installation.',
        })
      }
    } catch (err: any) {
      setTestResult({
        status: 'ERROR',
        message: 'Could not connect to ClickWard API.',
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Terminal className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Installation & Verification Checklist</h3>
          <p className="text-xs text-slate-400">Install once on Vercel/GitHub — ClickWard manages experiments live without redeploying.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Step 1 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">STEP 1</span>
            <span className="text-slate-500 font-mono">HTML Tag</span>
          </div>
          <p className="font-bold text-white text-sm">Copy Script Snippet</p>
          <p className="text-slate-400">One lightweight JavaScript tag containing your experiment ID.</p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">STEP 2</span>
            <span className="text-slate-500 font-mono">Vercel / GitHub</span>
          </div>
          <p className="font-bold text-white text-sm">Add to Website & Deploy Once</p>
          <p className="text-slate-400">Paste in <code className="text-indigo-300 font-mono">&lt;head&gt;</code>, commit to GitHub, and let Vercel deploy once.</p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">STEP 3</span>
            <span className="text-slate-500 font-mono">Live Verification</span>
          </div>
          <p className="font-bold text-white text-sm">Visit Site & Test SDK</p>
          <p className="text-slate-400">Open your live page or the built-in demo to verify CTA element substitution.</p>
        </div>
      </div>

      {/* Snippet Code Box */}
      <div className="relative group">
        <pre className="bg-slate-950 text-indigo-300 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800 select-all">
          {snippetCode}
        </pre>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-md flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Snippet
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={testing}
            onClick={handleTestInstallation}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            Test Installation Status
          </button>

          <a
            href={`/demo?expId=${experimentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            Open Live Demo
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          </a>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
              testResult.status === 'CONNECTED'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : testResult.status === 'NOT_DETECTED'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {testResult.status === 'CONNECTED' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>
    </div>
  )
}
