import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { Ship, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function VesselsPage() {
  const session = await auth()
  const userId = session?.user?.id
  const role = session?.user?.role

  const vessels = role === "ADMIN" || role === "FLEET_MANAGER" 
    ? await prisma.vessel.findMany({ include: { ciiRatings: true } })
    : await prisma.vessel.findMany({
        where: { officers: { some: { userId: userId } } },
        include: { ciiRatings: true }
      })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Monitored Vessels</h1>
        <p className="text-sm text-slate-400 mt-1">Manage and inspect compliance details for individual vessels.</p>
      </div>

      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm overflow-hidden">
        {/* Desktop & Tablet Table */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="bg-[#071326] border-b border-[#1e3456] text-slate-400 text-sm font-semibold tracking-wide">
              <th className="py-4 px-6 font-medium">Vessel Name</th>
              <th className="py-4 px-6 font-medium hidden lg:table-cell">IMO Number</th>
              <th className="py-4 px-6 font-medium">Type</th>
              <th className="py-4 px-6 font-medium hidden lg:table-cell">Build Year</th>
              <th className="py-4 px-6 font-medium">Latest CII</th>
              <th className="py-4 px-6 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e3456]">
            {vessels.map((v) => {
              // Find latest rating
              const latestRating = v.ciiRatings.length > 0 
                ? v.ciiRatings.reduce((prev, current) => (prev.year > current.year) ? prev : current)
                : null

              const ratingColor = {
                'A': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
                'B': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                'C': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                'D': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                'E': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
              }[latestRating?.rating || 'C'] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'

              return (
                <tr key={v.id} className="hover:bg-[#112747] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#071326] flex items-center justify-center border border-[#1e3456]">
                        <Ship size={14} className="text-[#0D9E75]" />
                      </div>
                      <span className="font-semibold text-white">{v.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-mono text-sm hidden lg:table-cell">{v.imoNumber}</td>
                  <td className="py-4 px-6 text-slate-400 text-sm">{v.type.replace('_', ' ')}</td>
                  <td className="py-4 px-6 text-slate-400 text-sm hidden lg:table-cell">{v.builtYear}</td>
                  <td className="py-4 px-6">
                    {latestRating ? (
                      <span className={`px-2.5 py-1 rounded-md border text-xs font-bold ${ratingColor}`}>
                        {latestRating.rating} Rating
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <Link href={`/dashboard/vessels/${v.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#0D9E75] hover:text-teal-400 transition-colors">
                      View Details
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Mobile Card Layout */}
        <div className="md:hidden flex flex-col divide-y divide-[#1e3456]">
          {vessels.map((v) => {
            const latestRating = v.ciiRatings.length > 0 
              ? v.ciiRatings.reduce((prev, current) => (prev.year > current.year) ? prev : current)
              : null
            
            const ratingColor = {
              'A': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
              'B': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              'C': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              'D': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
              'E': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            }[latestRating?.rating || 'C'] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'

            return (
              <div key={v.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#071326] flex items-center justify-center border border-[#1e3456]">
                      <Ship size={18} className="text-[#0D9E75]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{v.name}</h3>
                      <p className="text-xs text-slate-400">{v.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {latestRating ? (
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${ratingColor}`}>
                      {latestRating.rating} Rating
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs">Pending</span>
                  )}
                </div>
                <Link href={`/dashboard/vessels/${v.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#1e3456] bg-[#071326] hover:bg-[#112747] text-[#0D9E75] text-sm font-medium transition-colors">
                  View Details
                  <ChevronRight size={16} />
                </Link>
              </div>
            )
          })}
        </div>
        
        {vessels.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No vessels found matching your access level.
          </div>
        )}
      </div>
    </div>
  )
}
