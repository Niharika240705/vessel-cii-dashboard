import FuelComparisonChart from "@/components/planner/FuelComparisonChart"
import { Target, TrendingDown } from "lucide-react"
import GeneratePlanButton from "@/components/planner/GeneratePlanButton"
import SpeedOptimizer from "@/components/planner/SpeedOptimizer"

export default function PlannerPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Decarbonization Planner</h1>
        <p className="text-sm text-slate-400 mt-1">Strategize and forecast structural emission reductions to meet 2030 targets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#071326] border border-[#1e3456] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Target size={18} className="text-[#0D9E75]" />
            <span className="font-semibold text-white">2030 IMO Target</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Reduce total annual GHG emissions by at least <span className="text-teal-400 font-bold">20%</span>, striving for <span className="text-teal-400 font-bold">30%</span>, compared to 2008.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <TrendingDown size={18} className="text-blue-400" />
            <span className="font-semibold text-white">Current Trajectory</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-rose-400">+4.2%</span>
            <span className="text-slate-500 font-medium pb-1 shadow-sm">vs 2008 baseline</span>
          </div>
        </div>

        <div className="h-full">
          <GeneratePlanButton />
        </div>
      </div>

      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm overflow-hidden">
        <FuelComparisonChart />
      </div>

      <SpeedOptimizer />

      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6">
         <h3 className="text-white font-semibold mb-4">Implementation Roadmap</h3>
         
         <div className="space-y-6">
           <div className="relative pl-6 border-l-2 border-[#1e3456]">
             <div className="absolute w-3 h-3 bg-[#0D9E75] rounded-full -left-[7px] top-1 shadow-[0_0_8px_rgba(13,158,117,1)]" />
             <h4 className="text-white font-medium">2024 - Efficiency Upgrades</h4>
             <p className="text-sm text-slate-400 mt-1">Hull cleaning optimization, weather routing integration across the fleet.</p>
           </div>
           
           <div className="relative pl-6 border-l-2 border-[#1e3456]">
             <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1" />
             <h4 className="text-white font-medium">2026 - Drop-in Biofuels</h4>
             <p className="text-sm text-slate-400 mt-1">Blend 20% sustainable marine fuels into VLSFO configurations.</p>
           </div>
           
           <div className="relative pl-6 border-l-2 border-transparent">
             <div className="absolute w-3 h-3 bg-slate-600 rounded-full -left-[7px] top-1" />
             <h4 className="text-slate-300 font-medium">2029 - Methanol Fleet Launch</h4>
             <p className="text-sm text-slate-500 mt-1">Delivery of 4 Dual-Fuel Green Methanol container ships.</p>
           </div>
         </div>
      </div>

    </div>
  )
}
