import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Ship, Scale, Calendar, Anchor, AlertCircle } from "lucide-react"
import Link from "next/link"
import VesselDetailsChart from "@/components/vessels/VesselDetailsChart"
import CiiForecastModule from "@/components/vessels/CiiForecastModule"
import OptimisationRecommendations from "@/components/vessels/OptimisationRecommendations"
import CiiTrajectoryChart from "@/components/vessels/CiiTrajectoryChart"
import DownloadReportButton from "@/components/vessels/DownloadReportButton"
import { FleetText, FleetGuard } from "@/components/vessels/FleetModeAdapters"

export const dynamic = "force-dynamic"

export default async function VesselDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const vessel = await prisma.vessel.findUnique({
    where: { id: params.id },
    include: {
      ciiRatings: {
        orderBy: { year: 'desc' }
      },
      voyages: {
        include: { fuelConsumptions: true }
      }
    }
  })

  // (Original Code Logic for CO2)
  if (!vessel) return notFound()

  const rating = vessel.ciiRatings[0]

  const monthMap: Record<string, { mgo: number, vlsfo: number }> = {}

  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const m = d.toLocaleString('default', { month: 'short' })
    monthMap[m] = { mgo: 0, vlsfo: 0 }
  }

  vessel.voyages.forEach(voyage => {
    const month = voyage.departureTime.toLocaleString('default', { month: 'short' })
    if (monthMap[month]) {
      voyage.fuelConsumptions.forEach(f => {
        if (f.fuelType === "MGO") {
          monthMap[month].mgo += (f.quantity * 3.206)
        } else {
          monthMap[month].vlsfo += (f.quantity * 3.114)
        }
      })
    }
  })

  const chartData = Object.keys(monthMap).map(k => ({
    month: k,
    mgo: Math.round(monthMap[k].mgo),
    vlsfo: Math.round(monthMap[k].vlsfo),
  }))

  let totalCo2 = 0;
  chartData.forEach(d => {
    totalCo2 += d.mgo + d.vlsfo;
  });

  const etsExposure = totalCo2 * 0.5 * 85;

  const ratingColor = {
    'A': 'bg-teal-500 text-white',
    'B': 'bg-emerald-500 text-white',
    'C': 'bg-amber-500 text-white',
    'D': 'bg-orange-500 text-white',
    'E': 'bg-rose-500 text-white',
  }[rating?.rating || 'C'] || 'bg-slate-500 text-white'

  const attained = rating?.attainedCii || 3.5
  const required = rating?.requiredCii || 4.0
  const progressPct = Math.min(100, Math.max(0, (attained / (required * 1.5)) * 100))

  const availableYears = vessel.ciiRatings.map(r => r.year)

  // Defence Metrics Calculations
  const totalFuelLast12m = vessel.voyages.reduce((sum, v) => sum + v.fuelConsumptions.reduce((s, f) => s + f.quantity, 0), 0);
  const totalDistLast12m = vessel.voyages.reduce((sum, v) => sum + v.distanceSailed, 0);
  const fuelCostPerNm = totalDistLast12m > 0 ? (totalFuelLast12m * 800) / totalDistLast12m : 0;
  const sortieFuelEfficiency = totalDistLast12m > 0 ? totalDistLast12m / totalFuelLast12m : 0;
  const estRangeRemaining = sortieFuelEfficiency * 1500 * 0.5;

  // The forecast trajectory is now handled dynamically by CiiForecastModule

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/dashboard/vessels" className="hover:text-white transition-colors">Vessels</Link>
        <span>/</span>
        <span className="text-slate-200">{vessel.name}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#0B1F3A] border border-[#1e3456] flex items-center justify-center">
            <Ship size={28} className="text-[#0D9E75]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{vessel.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm font-mono text-slate-400">
              <span><FleetText comm="IMO:" def="Pennant:" /> {vessel.imoNumber}</span>
              <span>•</span>
              <span className="bg-[#112747] px-2 py-0.5 rounded text-xs border border-[#1e3456]">
                {vessel.type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        <DownloadReportButton vesselId={vessel.id} availableYears={availableYears} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Scale size={16} />
            <span className="text-sm font-medium">Gross Tonnage</span>
          </div>
          <span className="text-2xl font-bold text-white">{vessel.grossTonnage.toLocaleString()}</span>
        </div>
        
        <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Anchor size={16} />
            <span className="text-sm font-medium">Deadweight</span>
          </div>
          <span className="text-2xl font-bold text-white">{vessel.deadweight.toLocaleString()} MT</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2 z-10 relative">
            <span className="text-sm font-medium"><FleetText comm="Latest Rating" def="Fleet Readiness" /></span>
            {rating && <span className="text-xs">{rating.year} Cycle</span>}
          </div>
          {rating ? (
            <div className="z-10 relative flex items-end gap-3">
              <span className={`text-3xl font-extrabold w-12 h-12 flex items-center justify-center rounded-lg shadow-lg ${ratingColor}`}>
                {rating.rating}
              </span>
              <div className="flex flex-col pb-1 text-xs text-slate-300">
                <span><FleetText comm="Attained:" def="Energy Idx:" /> {rating.attainedCii.toFixed(2)}</span>
                <span><FleetText comm="Required:" def="Target:" /> {rating.requiredCii.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <span className="text-2xl font-bold text-slate-500 z-10 relative">Pending</span>
          )}
          {rating && <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-[40px] opacity-40 ${ratingColor}`}></div>}
        </div>

        <FleetGuard mode="COMMERCIAL">
          <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-2 lg:bg-gradient-to-br from-[#0B1F3A] to-[#112747]">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <AlertCircle size={16} className="text-rose-400" />
              <span className="text-sm font-medium">Est. EU ETS Exposure</span>
              <span className="ml-auto text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-[#1e3456]">Trailing 12Mo</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">
                €{etsExposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-sm text-slate-400 mb-1">at ~€85/t</span>
            </div>
          </div>
        </FleetGuard>

        <FleetGuard mode="DEFENCE">
          <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#0B1F3A] to-blue-900/40">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-blue-400" />
                <span className="text-sm font-medium">Tactical Range Estimate</span>
              </div>
              <span className="text-xs bg-blue-900/50 px-2 py-0.5 rounded text-blue-200 border border-blue-800/50">Sortie Avg: {sortieFuelEfficiency.toFixed(2)} nm/MT</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">
                {estRangeRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} nm
              </span>
              <span className="text-sm text-slate-400 mb-1">at 50% fuel capacity</span>
            </div>
          </div>
        </FleetGuard>
      </div>

      {/* Main Stats: Chart & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Forecast Module */}
        <div className="lg:col-span-3">
          <CiiForecastModule 
            vesselId={vessel.id} 
            initialAER={attained} 
            initialRating={rating?.rating || 'C'} 
            etsExposure={etsExposure} 
          />
        </div>

        {/* Multi-Year Trajectory */}
        <div className="lg:col-span-3">
          <CiiTrajectoryChart vesselId={vessel.id} />
        </div>

        {/* Optimisation Recommendations */}
        <div className="lg:col-span-3">
          <OptimisationRecommendations vesselId={vessel.id} />
        </div>

        {/* Existing Historical Chart */}
        <div className="hidden md:block lg:col-span-3 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm overflow-hidden">
          <VesselDetailsChart data={chartData} />
        </div>

      </div>
      
    </div>
  )
}
