"use client"

import { RefreshCcw, Loader2, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export default function GeneratePlanButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "complete">("idle")

  const handleGenerate = () => {
    setStatus("loading")
    // Simulate complex simulation algorithm
    setTimeout(() => {
      setStatus("complete")
      // Reset after 3 seconds showing success
      setTimeout(() => setStatus("idle"), 3000)
    }, 2000)
  }

  if (status === "loading") {
    return (
      <div className="p-5 rounded-2xl border border-dashed border-[#1e3456] bg-[#071326] flex flex-col items-center justify-center text-center h-full">
        <Loader2 size={24} className="text-[#0D9E75] mb-3 animate-spin" />
        <span className="font-semibold text-white">Simulating Scenarios...</span>
        <p className="text-xs text-slate-500 mt-1">Calculating optimal fleet retrofits</p>
      </div>
    )
  }

  if (status === "complete") {
    return (
      <div className="p-5 rounded-2xl border border-dashed border-[#0D9E75] bg-[#0B1F3A]/50 flex flex-col items-center justify-center text-center h-full animate-in fade-in zoom-in duration-300">
        <CheckCircle2 size={24} className="text-[#0D9E75] mb-3" />
        <span className="font-semibold text-white pr-2">Mitigation Plan Generated</span>
        <p className="text-xs text-[#0D9E75] mt-1">Report sent to Fleet Manager</p>
      </div>
    )
  }

  return (
    <div 
      onClick={handleGenerate}
      className="p-5 rounded-2xl border border-dashed border-[#1e3456] bg-transparent hover:bg-[#0B1F3A] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group h-full shadow-sm hover:shadow-md"
    >
      <RefreshCcw size={24} className="text-slate-500 mb-3 group-hover:text-blue-400 transition-colors" />
      <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">Generate Mitigation Plan</span>
      <p className="text-xs text-slate-500 mt-1">Simulate engine retrofitting</p>
    </div>
  )
}
