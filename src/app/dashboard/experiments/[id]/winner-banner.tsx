'use client'

import { useState } from 'react'
import { Trophy, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'

interface VariantStat {
  id: string
  name: string
  ctaText: string
  impressions: number
  conversions: number
  convRate: number
  allocation: number
}

interface WinnerBannerProps {
  experimentId: string
  experimentStatus: string
  winningVariantId: string | null
  variants: VariantStat[]
  onPromoteVariantAction: (formData: FormData) => Promise<void>
}

export default function WinnerBanner({
  experimentId,
  experimentStatus,
  winningVariantId,
  variants,
  onPromoteVariantAction,
}: WinnerBannerProps) {
  const [loading, setLoading] = useState(false)

  // Identify control (first variant or variant with "control" in name)
  const control = variants.find((v) => v.name.toLowerCase().includes('control')) || variants[0]

  // Minimum criteria for Winner Candidate candidacy
  const MIN_IMPRESSIONS_PER_VARIANT = 100
  const MIN_TOTAL_CONVERSIONS = 10
  const MIN_RELATIVE_IMPROVEMENT_PERCENT = 20

  const totalImpressionsAll = variants.reduce((sum, v) => sum + v.impressions, 0)
  const totalConversionsAll = variants.reduce((sum, v) => sum + v.conversions, 0)
  const hasMinImpressions = variants.every((v) => v.impressions >= MIN_IMPRESSIONS_PER_VARIANT)
  const hasMinConversions = totalConversionsAll >= MIN_TOTAL_CONVERSIONS

  let winnerCandidate: { variant: VariantStat; relativeImprovement: number } | null = null

  if (control && hasMinImpressions && hasMinConversions && control.convRate > 0) {
    let bestVariant: VariantStat | null = null
    let maxImprovement = 0

    variants.forEach((v) => {
      if (v.id === control.id) return
      const relImprovement = ((v.convRate - control.convRate) / control.convRate) * 100
      if (relImprovement >= MIN_RELATIVE_IMPROVEMENT_PERCENT && relImprovement > maxImprovement) {
        maxImprovement = relImprovement
        bestVariant = v
      }
    })

    if (bestVariant) {
      winnerCandidate = { variant: bestVariant, relativeImprovement: maxImprovement }
    }
  }

  // Find promoted winning variant if already promoted
  const promotedVariant = variants.find((v) => v.id === winningVariantId)

  async function handlePromote(variantId: string) {
    if (!confirm('Promote this variant to receive 100% of live website traffic immediately? No redeployment is needed.')) return
    setLoading(true)
    const formData = new FormData()
    formData.append('experimentId', experimentId)
    formData.append('variantId', variantId)

    await onPromoteVariantAction(formData)
    setLoading(false)
    window.location.reload()
  }

  if (promotedVariant || winningVariantId) {
    const winnerName = promotedVariant ? promotedVariant.name : 'Promoted Variant'
    return (
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  Winner Promoted (100% Traffic)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                &quot;{winnerName}&quot; is now live to all website visitors!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                ClickWard SDK automatically serves this winner to 100% of traffic without requiring any website redeployment on Vercel.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (winnerCandidate) {
    return (
      <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shrink-0 animate-bounce">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Winner Candidate Detected
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {winnerCandidate.variant.name} (+{winnerCandidate.relativeImprovement.toFixed(1)}% Relative Improvement)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Outperforming Control ({control?.convRate.toFixed(1)}% CVR vs {winnerCandidate.variant.convRate.toFixed(1)}% CVR). Ready to be promoted to 100% traffic!
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handlePromote(winnerCandidate!.variant.id)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Promote {winnerCandidate.variant.name} to 100% Traffic
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Collecting Data / Progress status
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-slate-300">
        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
        <span>
          <strong>Status: Collecting Data</strong> &mdash; Minimum 100 impressions per variant required for automatic candidate detection.
        </span>
      </div>

      <div className="flex items-center gap-2 text-slate-400 font-mono">
        <span>Total Impressions: <strong>{totalImpressionsAll}</strong></span>
        <span>&bull;</span>
        <span>Total Conversions: <strong>{totalConversionsAll}</strong></span>
      </div>
    </div>
  )
}
