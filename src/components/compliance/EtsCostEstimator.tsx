"use client";

import { useState } from "react";
import { Euro, DollarSign } from "lucide-react";
import type { VesselCarbonData } from "@/app/dashboard/fleet-carbon/page";

interface EtsCostEstimatorProps {
  totalCo2: number;
  vessels: VesselCarbonData[];
}

export default function EtsCostEstimator({ totalCo2, vessels }: EtsCostEstimatorProps) {
  const [carbonPrice, setCarbonPrice] = useState<number>(65);
  
  const phaseInRate = 0.40; // 40% for 2024
  const usdExchangeRate = 1.08;

  const coveredEmissions = totalCo2 * phaseInRate;
  const totalCostEur = coveredEmissions * carbonPrice;
  const totalCostUsd = totalCostEur * usdExchangeRate;

  return (
    <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-[#1e3456]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Euro size={18} className="text-blue-400" /> EU ETS Estimator (2024)
          </h3>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold tracking-wider">
            40% Phase-In
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Carbon Price (€/tonne)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Euro size={14} className="text-slate-500" />
              </div>
              <input
                type="number"
                value={carbonPrice}
                onChange={(e) => setCarbonPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#071326] border border-[#1e3456] text-white text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="bg-[#071326] rounded-xl p-4 border border-[#1e3456]">
            <div className="text-xs text-slate-400 mb-1">Estimated Total Fleet Liability</div>
            <div className="text-3xl font-bold text-white mb-1">
              €{totalCostEur.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-slate-400 flex items-center gap-1">
              <DollarSign size={14} />
              {totalCostUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
              <span className="text-[10px] ml-1">(1 EUR = {usdExchangeRate} USD)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Liability by Vessel</h4>
        <div className="overflow-y-auto flex-1 pr-2 space-y-3" style={{ maxHeight: '400px' }}>
          {vessels.map((v) => {
            const vesselCost = totalCostEur * (v.share / 100);
            return (
              <div key={v.vesselId} className="flex justify-between items-center p-3 rounded-lg bg-[#071326] border border-[#1e3456] transition-colors hover:bg-[#0f294d]">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200">{v.name}</span>
                  <span className="text-xs text-slate-500">IMO {v.imoNumber} • {v.share.toFixed(1)}% share</span>
                </div>
                <div className="text-sm font-bold text-white">
                  €{vesselCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
