'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Plus, Check, AlertCircle } from 'lucide-react'

interface GeneratedVariant {
  name: string
  headline: string
  description: string
  ctaText: string
}

interface AiGeneratorProps {
  experimentId: string
  experimentName: string
  experimentDescription?: string | null
  experimentGoal: string
  controlVariant?: {
    headline: string
    description: string
    ctaText: string
  }
  onSaveVariantAction: (formData: FormData) => Promise<void>
}

export default function AiGenerator({
  experimentId,
  experimentName,
  experimentDescription,
  experimentGoal,
  controlVariant,
  onSaveVariantAction,
}: AiGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([])
  const [savedIndices, setSavedIndices] = useState<Record<number, boolean>>({})

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setGeneratedVariants([])
    setSavedIndices({})

    try {
      const res = await fetch('/api/ai/generate-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          name: experimentName,
          description: experimentDescription,
          goal: experimentGoal,
          controlVariant,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate variants')
      }

      if (data.variants && Array.isArray(data.variants)) {
        setGeneratedVariants(data.variants)
      } else {
        throw new Error('No variants returned')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while calling Groq AI')
    } finally {
      setLoading(false)
    }
  }

  const handleEditField = (index: number, field: keyof GeneratedVariant, value: string) => {
    const updated = [...generatedVariants]
    updated[index] = { ...updated[index], [field]: value }
    setGeneratedVariants(updated)
  }

  async function handleSaveVariant(index: number) {
    const v = generatedVariants[index]
    if (!v) return

    const formData = new FormData()
    formData.append('experimentId', experimentId)
    formData.append('name', v.name)
    formData.append('headline', v.headline)
    formData.append('description', v.description)
    formData.append('ctaText', v.ctaText)

    await onSaveVariantAction(formData)
    setSavedIndices((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <div className="my-4">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          Generate Variants with Groq AI
        </button>
      ) : (
        <div className="bg-slate-900 text-slate-100 rounded-2xl border border-indigo-500/40 p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Groq AI Variant Assistant</h3>
                <p className="text-xs text-slate-400">
                  Generate conversion-focused copy tailored to optimization goal: <span className="text-indigo-400 font-semibold">{experimentGoal}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">AI Generation Notice:</p>
                <p className="mt-0.5 text-red-200/90">{error}</p>
              </div>
            </div>
          )}

          {generatedVariants.length === 0 && !loading && (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Click below to let Groq AI analyze your experiment context and generate 3 conversion-focused variant options.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Generate 3 AI Variants
              </button>
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Drafting conversion variants with Groq AI...</p>
            </div>
          )}

          {generatedVariants.length > 0 && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Review & Approve AI Suggestions ({generatedVariants.length})
                </span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Regenerate
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedVariants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Variant Name
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleEditField(idx, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Headline
                        </label>
                        <input
                          type="text"
                          value={variant.headline}
                          onChange={(e) => handleEditField(idx, 'headline', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={variant.description}
                          onChange={(e) => handleEditField(idx, 'description', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={variant.ctaText}
                          onChange={(e) => handleEditField(idx, 'ctaText', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      {savedIndices[idx] ? (
                        <div className="w-full py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Added to Experiment
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveVariant(idx)}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Save as Variant
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
