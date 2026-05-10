"use client"

import { useState } from "react"
import { calculateAttainedCIIAndRating, calculateRequiredCII } from "@/lib/ciiCalculator"
import type { VesselType } from "@prisma/client"
import { Calculator, ArrowRight, Gauge, Activity } from "lucide-react"
import { logger } from "@/lib/logger"

const VESSEL_TYPES: string[] = [
  'BULK_CARRIER', 'TANKER', 'CONTAINER', 'LNG_CARRIER', 'RO_RO', 'GENERAL_CARGO'
];

export default function CiiForm() {
  const [vesselType, setVesselType] = useState<VesselType>('BULK_CARRIER' as VesselType)
  const [capacity, setCapacity] = useState(50000)
  const [year, setYear] = useState(new Date().getFullYear())
  const [co2Emitted, setCo2Emitted] = useState(15000)
  const [distance, setDistance] = useState(80000)

  const [result, setResult] = useState<any>(null)

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = calculateAttainedCIIAndRating(vesselType, capacity, year, co2Emitted, distance)
      setResult(res)
    } catch (err) {
      logger.error({ err }, "Failed to calculate CII rating")
    }
  }

  const ratingColorMap: Record<string, string> = {
    'A': 'bg-teal-500 text-white shadow-teal-500/30',
    'B': 'bg-emerald-500 text-white shadow-emerald-500/30',
    'C': 'bg-amber-500 text-white shadow-amber-500/30',
    'D': 'bg-orange-500 text-white shadow-orange-500/30',
    'E': 'bg-rose-500 text-white shadow-rose-500/30',
  }
  const ratingColor = ratingColorMap[result?.rating || 'C']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Input Form */}
      <form onSubmit={handleCalculate} className="p-6 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[#1e3456] pb-4">
          <div className="w-10 h-10 rounded-lg bg-[#0D9E75]/20 flex items-center justify-center">
            <Calculator size={20} className="text-[#0D9E75]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Vessel Parameters</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Vessel Type</label>
              <select 
                value={vesselType}
                onChange={(e) => setVesselType(e.target.value as VesselType)}
                className="w-full bg-[#071326] border border-[#1e3456] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9E75]"
              >
                {VESSEL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Target Year</label>
              <select 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full bg-[#071326] border border-[#1e3456] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9E75]"
              >
                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Capacity (DWT/GT)</label>
            <input 
              type="number" 
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full bg-[#071326] border border-[#1e3456] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9E75]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Annual CO₂ Emitted (MT)</label>
              <input 
                type="number" 
                value={co2Emitted}
                onChange={(e) => setCo2Emitted(Number(e.target.value))}
                className="w-full bg-[#071326] border border-[#1e3456] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9E75]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Distance Sailed (nm)</label>
              <input 
                type="number" 
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full bg-[#071326] border border-[#1e3456] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9E75]"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full mt-4 flex items-center justify-center gap-2 bg-[#0D9E75] hover:bg-teal-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
        >
          Compute CII Rating
          <ArrowRight size={16} />
        </button>
      </form>

      {/* Results Panel */}
      <div className="p-6 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        {!result ? (
          <div className="text-center opacity-60">
            <Gauge size={48} className="mx-auto mb-4 text-slate-500" />
            <p className="text-slate-400 font-medium">Enter metrics to compute</p>
          </div>
        ) : (
          <div className="w-full max-w-sm flex flex-col items-center animate-in zoom-in-95 duration-500">
            <p className="text-slate-400 font-semibold mb-6 flex items-center gap-2">
              <Activity size={18} className="text-[#0D9E75]" /> Forecasted Outcome
            </p>
            
            <div className={`w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center text-7xl font-extrabold rotate-3 transition-colors ${ratingColor}`}>
              <div className="-rotate-3">{result.rating}</div>
            </div>

            <div className="w-full space-y-3 mt-10">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#071326] border border-[#1e3456]">
                <span className="text-sm text-slate-400">Required CII</span>
                <span className="font-mono text-white font-medium">{result.required.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#071326] border border-[#1e3456]">
                <span className="text-sm text-slate-400">Attained CII</span>
                <span className="font-mono text-white font-medium">{result.attained.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#071326] border border-[#1e3456]">
                <span className="text-sm text-slate-400">Deviation Margin</span>
                <span className={`font-mono font-medium ${(result.attained - result.required) > 0 ? "text-rose-400" : "text-teal-400"}`}>
                  {((result.attained - result.required) / result.required * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
