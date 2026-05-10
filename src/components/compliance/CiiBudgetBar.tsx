"use client";

import { Activity } from "lucide-react";

interface CiiBudgetBarProps {
  utilisationPct: number; // 0 to 100+
}

export default function CiiBudgetBar({ utilisationPct }: CiiBudgetBarProps) {
  // Cap visual bar at 100%
  const visualPct = Math.min(100, Math.max(0, utilisationPct));
  
  // Determine status color based on how close to 100%
  let statusColor = 'bg-emerald-500';
  let statusTextColor = 'text-emerald-400';
  let message = 'Within Carbon Budget';
  
  if (utilisationPct > 100) {
    statusColor = 'bg-rose-500';
    statusTextColor = 'text-rose-400';
    message = 'Budget Exceeded';
  } else if (utilisationPct > 90) {
    statusColor = 'bg-amber-500';
    statusTextColor = 'text-amber-400';
    message = 'Nearing Budget Limit';
  } else if (utilisationPct > 75) {
    statusColor = 'bg-blue-500';
    statusTextColor = 'text-blue-400';
    message = 'Tracking Normally';
  }

  return (
    <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2 mb-1">
            <Activity size={18} className={statusTextColor} /> Fleet CII Budget Utilisation
          </h3>
          <p className="text-slate-400 text-sm">Aggregate Attained vs Required CII</p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${statusTextColor}`}>{utilisationPct.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="relative w-full h-4 bg-[#071326] rounded-full overflow-hidden border border-[#1e3456]">
        <div 
          className={`h-full ${statusColor} transition-all duration-1000 ease-in-out`}
          style={{ width: `${visualPct}%` }}
        ></div>
        {/* Target Line at 100% */}
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-rose-500 z-10" title="100% Limit"></div>
      </div>
      
      <div className="flex justify-between items-center mt-3 text-xs">
        <span className="text-slate-500">0%</span>
        <span className={`font-medium ${statusTextColor}`}>{message}</span>
        <span className="text-slate-500">100% (Limit)</span>
      </div>
    </div>
  );
}
