'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Trash2, Loader2, Filter, Cpu, CheckCircle } from 'lucide-react'

interface Variant {
  id: string
  name: string
  ctaText: string
}

interface SimulationControlsProps {
  experimentId: string
  variants: Variant[]
  activeFilter: 'all' | 'real' | 'simulated'
  onClearSimulationAction: (formData: FormData) => Promise<void>
}

export default function SimulationControls({
  experimentId,
  variants,
  activeFilter,
  onClearSimulationAction,
}: SimulationControlsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customRates, setCustomRates] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    variants.forEach((v, idx) => {
      initial[v.id] = idx === 0 ? 10 : 15 + idx * 5
    })
    return initial
  })
  const [message, setMessage] = useState<string | null>(null)

  function handleFilterChange(f: 'all' | 'real' | 'simulated') {
    router.push(`/dashboard/experiments/${experimentId}?filter=${f}`)
  }

  async function handleSimulate(count: number) {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          count,
          rates: customRates,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Simulation failed')
      }

      setMessage(`✅ Successfully simulated ${count.toLocaleString()} visitors! Refreshing...`)
      setTimeout(() => router.refresh(), 800)
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    if (!confirm('Are you sure you want to delete ALL simulated events? Real visitor data will NOT be affected.')) return
    setLoading(true)
    setMessage(null)
    const formData = new FormData()
    formData.append('experimentId', experimentId)
    await onClearSimulationAction(formData)
    setLoading(false)
    setMessage('🗑️ Simulation data cleared!')
    setTimeout(() => router.refresh(), 500)
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
      {/* Top Header & Data Source Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Traffic Simulator & Data Filter</h3>
            <p className="text-xs text-slate-400">Generate simulated traffic to test winner detection. Real visitor data is never affected.</p>
          </div>
        </div>

        {/* View Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3" /> All
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('real')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'real'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Real Traffic
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('simulated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'simulated'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Simulation
          </button>
        </div>
      </div>

      {/* Conversion Probabilities Config per Variant */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Simulated Conversion Probabilities (% CVR per Variant)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {variants.map((v) => (
            <div key={v.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="block text-xs font-semibold text-slate-300 truncate">{v.name}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={customRates[v.id] ?? 10}
                  onChange={(e) =>
                    setCustomRates((prev) => ({
                      ...prev,
                      [v.id]: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                    }))
                  }
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono font-bold"
                />
                <span className="text-xs text-slate-500 font-mono">% CVR</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulate Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Simulate Traffic:</span>
          {[10, 100, 1000, 10000].map((num) => (
            <button
              key={num}
              type="button"
              disabled={loading}
              onClick={() => handleSimulate(num)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
              {num.toLocaleString()} Visitors
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleClear}
          className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Simulation Data
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          {message}
        </div>
      )}
    </div>
  )
}
