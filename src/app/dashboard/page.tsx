import { Ship, Anchor, Thermometer, Wind } from "lucide-react"
import { prisma } from "@/lib/prisma"
import FleetTrendsChart from "@/components/dashboard/FleetTrendsChart"
import { auth } from "@/auth"

// Next.js ISR/SSR configuration
export const dynamic = "force-dynamic"

export default async function DashboardOverview() {
  const session = await auth()
  const userId = session?.user?.id
  const role = session?.user?.role

  // Fetch vessels - if admin, fetch all, otherwise fetch assigned
  const vessels = role === "ADMIN" || role === "FLEET_MANAGER" 
    ? await prisma.vessel.findMany()
    : await prisma.vessel.findMany({
        where: { officers: { some: { userId: userId } } }
      })

  const vesselIds = vessels.map(v => v.id)

  // 1. Total Vessels
  const totalVessels = vessels.length

  // 2. Active Voyages (Voyages ending in the future or very recently)
  const activeVoyagesCount = await prisma.voyage.count({
    where: {
      vesselId: { in: vesselIds },
      arrivalTime: { gte: new Date() },
    }
  })

  // 3. YTD CO2 Emissions
  // VLSFO ~ 3.114, MGO ~ 3.206
  const startOfYear = new Date(new Date().getFullYear(), 0, 1)
  const ytdFuel = await prisma.fuelConsumption.findMany({
    where: {
      voyage: { vesselId: { in: vesselIds } },
      createdAt: { gte: startOfYear }
    }
  })

  let ytdCo2 = 0
  ytdFuel.forEach(f => {
    const factor = f.fuelType === "MGO" ? 3.206 : 3.114
    ytdCo2 += f.quantity * factor
  })

  // 4. Fleet Avg CII Rating
  // Simple heuristic: A=1, B=2, C=3, D=4, E=5
  const activeYear = new Date().getFullYear() - 1 // Ratings are typically for previous year
  const ratings = await prisma.ciiRating.findMany({
    where: { vesselId: { in: vesselIds }, year: activeYear }
  })
  
  let fleetAvgRating = "N/A"
  if (ratings.length > 0) {
    const scoreMap: Record<string, number> = { A:1, B:2, C:3, D:4, E:5 }
    const reverseMap = ["A", "B", "C", "D", "E"]
    const sum = ratings.reduce((acc, r) => acc + (scoreMap[r.rating] || 3), 0)
    const avg = Math.round(sum / ratings.length)
    fleetAvgRating = reverseMap[avg - 1] || "C"
  }

  // 5. Monthly Trend Mock Data (for previous 12 months)
  // We'll aggregate fuel consumption into months
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  const fuelLastYear = await prisma.fuelConsumption.findMany({
    where: {
      voyage: { vesselId: { in: vesselIds } },
      createdAt: { gte: oneYearAgo }
    },
    select: { createdAt: true, quantity: true, fuelType: true }
  })

  const monthMap: Record<string, number> = {}
  fuelLastYear.forEach(f => {
    const month = f.createdAt.toLocaleString('default', { month: 'short' })
    const factor = f.fuelType === "MGO" ? 3.206 : 3.114
    monthMap[month] = (monthMap[month] || 0) + (f.quantity * factor)
  })

  // Ensure 12 months ordered correctly
  const chartData = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const m = d.toLocaleString('default', { month: 'short' })
    
    chartData.push({
      month: m,
      co2: Math.round(monthMap[m] || 0) 
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fleet Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time holistic view of vessel compliance and emissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Monitored Vessels", value: totalVessels.toString(), icon: Ship, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Fleet Avg CII (Last Yr)", value: fleetAvgRating, icon: Anchor, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "YTD CO2 Emitted", value: `${(ytdCo2 / 1000).toFixed(1)}k mt`, icon: Wind, color: "text-rose-400", bg: "bg-rose-400/10" },
          { label: "Active Voyages", value: activeVoyagesCount.toString(), icon: Thermometer, color: "text-[#0D9E75]", bg: "bg-[#0D9E75]/10" },
        ].map((kpi, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex items-center gap-5 hover:border-[#0D9E75]/50 transition-colors shadow-sm">
            <div className={`p-4 rounded-xl ${kpi.bg}`}>
              <kpi.icon className={kpi.color} size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{kpi.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm overflow-hidden">
          <FleetTrendsChart data={chartData} />
        </div>
        <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6 flex flex-col">
          <h3 className="text-white font-semibold mb-4">Urgent Alerts</h3>
          <div className="flex-1 space-y-3">
            {[
              { msg: "Oceanic Explorer approaching D rating threshold.", type: "warn" },
              { msg: "SEEMP missing for Baltic Voyager.", type: "crit" },
              { msg: "Pending MRV verification due in 14 days.", type: "warn" }
            ].map((alert, i) => (
              <div key={i} className="p-4 rounded-lg bg-[#071326] border border-[#1e3456] flex gap-3 items-start">
                <div className={`w-2 h-2 mt-1.5 rounded-full ${alert.type === 'crit' ? 'bg-rose-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
                <p className="text-sm text-slate-300">{alert.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
