import { prisma } from "@/lib/prisma";
import { FuelType } from "@prisma/client";
import EtsCostEstimator from "@/components/compliance/EtsCostEstimator";
import FleetCarbonCharts from "@/components/compliance/FleetCarbonCharts";
import CiiBudgetBar from "@/components/compliance/CiiBudgetBar";
import { Cloud, TrendingDown, TrendingUp, Anchor } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CF_FACTORS: Record<string, number> = {
  HFO: 3.114,
  VLSFO: 3.151,
  MGO: 3.206, // MDO mapped to MGO
  LNG: 2.750,
  METHANOL: 1.375,
  AMMONIA: 0,
};

export type VesselCarbonData = {
  vesselId: string;
  name: string;
  imoNumber: string;
  co2Emissions: number;
  grade: string;
  share: number;
};

export type FuelSplitData = {
  fuelType: string;
  co2: number;
};

export default async function FleetCarbonPage() {
  const currentYear = 2024;
  const lastYear = 2023;

  const vessels = await prisma.vessel.findMany({
    include: {
      ciiRatings: {
        where: { year: { in: [currentYear, lastYear] } }
      },
      voyages: {
        where: {
          departureTime: {
            gte: new Date(`${lastYear}-01-01`),
            lte: new Date(`${currentYear}-12-31`)
          }
        },
        include: { fuelConsumptions: true }
      }
    }
  });

  let totalCo2Current = 0;
  let totalCo2Last = 0;
  let aggregateAttainedCurrent = 0;
  let aggregateRequiredCurrent = 0;
  let ratingCountCurrent = 0;

  const fuelMap = new Map<string, number>();
  const vesselCarbonList: VesselCarbonData[] = [];

  vessels.forEach(v => {
    let vesselCo2Current = 0;
    
    // CII Aggregation
    const currentRating = v.ciiRatings.find(r => r.year === currentYear);
    if (currentRating) {
      aggregateAttainedCurrent += currentRating.attainedCii;
      aggregateRequiredCurrent += currentRating.requiredCii;
      ratingCountCurrent++;
    }

    v.voyages.forEach(voy => {
      const year = voy.departureTime.getFullYear();
      let voyageCo2 = 0;
      
      voy.fuelConsumptions.forEach(f => {
        const factor = CF_FACTORS[f.fuelType] || 0;
        const co2 = f.quantity * factor;
        voyageCo2 += co2;
        
        if (year === currentYear) {
            const existing = fuelMap.get(f.fuelType) || 0;
            fuelMap.set(f.fuelType, existing + co2);
        }
      });

      if (year === currentYear) {
        vesselCo2Current += voyageCo2;
        totalCo2Current += voyageCo2;
      } else if (year === lastYear) {
        totalCo2Last += voyageCo2;
      }
    });

    if (vesselCo2Current > 0) {
      vesselCarbonList.push({
        vesselId: v.id,
        name: v.name,
        imoNumber: v.imoNumber,
        co2Emissions: vesselCo2Current,
        grade: currentRating?.rating || 'C',
        share: 0 // Will calculate after loop
      });
    }
  });

  vesselCarbonList.forEach(vc => {
    vc.share = totalCo2Current > 0 ? (vc.co2Emissions / totalCo2Current) * 100 : 0;
  });

  vesselCarbonList.sort((a, b) => b.co2Emissions - a.co2Emissions);

  const percentChange = totalCo2Last > 0 ? ((totalCo2Current - totalCo2Last) / totalCo2Last) * 100 : 0;
  const isIncrease = percentChange > 0;

  const fuelSplit: FuelSplitData[] = Array.from(fuelMap.entries()).map(([fuelType, co2]) => ({
    fuelType,
    co2
  }));

  const budgetUtilisation = aggregateRequiredCurrent > 0 ? (aggregateAttainedCurrent / aggregateRequiredCurrent) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#0B1F3A] border border-[#1e3456] flex items-center justify-center">
            <Cloud size={28} className="text-[#0D9E75]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Fleet Carbon Budget</h1>
            <p className="text-sm font-mono text-slate-400 mt-1">Aggregated emissions and ETS forecasting</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Cloud size={16} />
            <span className="text-sm font-medium">Total Fleet CO₂ ({currentYear})</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white">{totalCo2Current.toLocaleString(undefined, { maximumFractionDigits: 0 })} MT</span>
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            {isIncrease ? <TrendingUp size={16} className="text-rose-400" /> : <TrendingDown size={16} className="text-emerald-400" />}
            <span className="text-sm font-medium">YoY Change</span>
          </div>
          <div className="flex items-end gap-3">
            <span className={`text-3xl font-bold ${isIncrease ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isIncrease ? '+' : ''}{percentChange.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-400 mb-1">vs {lastYear}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Anchor size={16} />
            <span className="text-sm font-medium">Active Fleet</span>
          </div>
          <span className="text-3xl font-bold text-white">{vesselCarbonList.length} Vessels</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CiiBudgetBar utilisationPct={budgetUtilisation} />
          <FleetCarbonCharts vessels={vesselCarbonList} fuelSplit={fuelSplit} />
        </div>
        <div className="lg:col-span-1">
          <EtsCostEstimator 
             totalCo2={totalCo2Current} 
             vessels={vesselCarbonList} 
          />
        </div>
      </div>
    </div>
  );
}
