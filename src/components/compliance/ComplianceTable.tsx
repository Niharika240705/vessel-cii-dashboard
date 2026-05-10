import { FileCheck, AlertTriangle, ShieldCheck, Activity } from "lucide-react"

interface DocStatus {
  status: string
  expiry?: Date | null
}

const getBadge = (status: string) => {
  if (status === 'APPROVED') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold"><ShieldCheck size={14}/> Valid</span>
  }
  if (status === 'OVERDUE') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold"><AlertTriangle size={14}/> Overdue</span>
  }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold"><FileCheck size={14}/> Pending</span>
}

export default function ComplianceTable({ data }: { data: any[] }) {
  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#071326] border-b border-[#1e3456] text-slate-400 text-sm font-semibold tracking-wide">
            <th className="py-4 px-6 font-medium">Vessel Overview</th>
            <th className="py-4 px-6 font-medium">SEEMP Part III</th>
            <th className="py-4 px-6 font-medium">EU MRV Verification</th>
            <th className="py-4 px-6 font-medium">IMO DCS Status</th>
            <th className="py-4 px-6 font-medium">AI Insights</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e3456]">
          {data.map((v) => {
            const seemp = v.docs.find((d: any) => d.type === 'SEEMP')?.status || 'PENDING'
            const mrv = v.docs.find((d: any) => d.type === 'MRV')?.status || 'PENDING'
            const dcs = v.docs.find((d: any) => d.type === 'DCS')?.status || 'PENDING'
            
            return (
              <tr key={v.id} className="hover:bg-[#112747] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{v.vesselName}</span>
                    <span className="text-xs text-slate-500 font-mono">IMO {v.imo}</span>
                  </div>
                </td>
                <td className="py-4 px-6">{getBadge(seemp)}</td>
                <td className="py-4 px-6">{getBadge(mrv)}</td>
                <td className="py-4 px-6">{getBadge(dcs)}</td>
                <td className="py-4 px-6">
                  {v.anomalousCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] uppercase font-extrabold tracking-widest animate-pulse shadow-[0_0_10px_theme(colors.purple.500/20)]">
                      <Activity size={14} className="stroke-[2.5]" /> 
                      Anomaly Detected ({v.anomalousCount})
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600 font-medium">Normal baseline</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
