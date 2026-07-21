"use client"

import { useState, useEffect } from 'react';
import CiiForecastChart from './CiiForecastChart';
import { AlertCircle, Gauge, Flame } from 'lucide-react';
import type { ForecastResponse } from '@/app/api/vessels/[id]/forecast/route';
import { useFleetMode } from '@/store/useFleetMode';
import { getNavalGrade } from './FleetModeAdapters';
import { ChartSkeleton } from '@/components/ui/Skeletons';

export default function CiiForecastModule({ 
  vesselId, 
  initialAER, 
  initialRating, 
  etsExposure 
}: { 
  vesselId: string, 
  initialAER: number, 
  initialRating: string, 
  etsExposure: number 
}) {
  const [speedReduction, setSpeedReduction] = useState<number>(0);
  const [fuelTypeOverride, setFuelTypeOverride] = useState<string>('');
  const { mode } = useFleetMode();
  
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = `/api/vessels/${vesselId}/forecast?speedReduction=${speedReduction}`;
    if (fuelTypeOverride) {
      url += `&fuelTypeOverride=${fuelTypeOverride}`;
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [vesselId, speedReduction, fuelTypeOverride]);

  // Derived values
  const attained = data?.projectedAttainedCii || initialAER;
  const rating = data?.projectedGrade || initialRating;
  const required = data?.requiredCii || 4.5;
  const progressPct = Math.min(100, Math.max(0, (attained / (required * 1.5)) * 100));

  const ratingColor = {
    'A': 'bg-teal-500',
    'B': 'bg-emerald-500',
    'C': 'bg-amber-500',
    'D': 'bg-orange-500',
    'E': 'bg-rose-500',
  }[rating] || 'bg-slate-500';

  const initialRatingColor = {
    'A': 'bg-teal-500',
    'B': 'bg-emerald-500',
    'C': 'bg-amber-500',
    'D': 'bg-orange-500',
    'E': 'bg-rose-500',
  }[initialRating] || 'bg-slate-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart and Controls Column */}
      <div className="lg:col-span-2 space-y-4">
        {loading && !data ? (
          <div className="mt-2"><ChartSkeleton /></div>
        ) : (
          <div className="w-full overflow-x-auto styled-scrollbar pb-2">
            <div className="min-w-[500px]">
              <CiiForecastChart data={data?.forecastData || []} />
            </div>
          </div>
        )}
        
        {/* What-If Controls */}
        <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Gauge size={16} className="text-blue-400" /> Speed Reduction
              </label>
              <span className="text-xs text-blue-400 font-mono">-{speedReduction} knots</span>
            </div>
            <input 
              type="range" 
              min="0" max="3" step="0.5" 
              value={speedReduction} 
              onChange={(e) => setSpeedReduction(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Current</span>
              <span>-3 knots</span>
            </div>
          </div>
          
          <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-[#1e3456] pt-4 md:pt-0 md:pl-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Flame size={16} className="text-orange-400" /> Fuel Switch (Remaining)
              </label>
            </div>
            <select 
              value={fuelTypeOverride} 
              onChange={(e) => setFuelTypeOverride(e.target.value)}
              className="w-full bg-[#071326] border border-[#1e3456] text-white text-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Current Trailing Fuel</option>
              <option value="VLSFO">VLSFO (0.5% S)</option>
              <option value="MGO">MGO</option>
              <option value="LNG">LNG</option>
              <option value="METHANOL">Green Methanol</option>
              <option value="AMMONIA">Green Ammonia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Gauge Column */}
      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6 flex flex-col relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-[#0B1F3A]/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <h3 className="text-white font-semibold mb-6 flex justify-between items-center">
          Year-End Forecast
          {rating !== initialRating && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              {mode === 'COMMERCIAL' ? 'Grade Changed' : 'Readiness Changed'}
            </span>
          )}
        </h3>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e3456" strokeWidth="8" strokeDasharray="125 250" strokeLinecap="round" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray={`${(progressPct / 100) * 125} 250`} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center top-1/2 -translate-y-[20%]">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{attained.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded text-white ${initialRatingColor} opacity-50 line-through`}>{initialRating}</span>
                <span className="text-slate-400 text-xs">→</span>
                <span className={`text-lg font-bold px-2 py-0.5 rounded text-white shadow-lg ${ratingColor}`}>{rating}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-2">vs {required.toFixed(2)} {mode === 'COMMERCIAL' ? 'Req' : 'Target'}</span>
            </div>
          </div>
          
          <div className="w-full mt-6 p-4 rounded-xl bg-[#071326] border border-[#1e3456]">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Projected Insight</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on the simulated burn rate, this vessel will achieve a {mode === 'COMMERCIAL' ? rating : getNavalGrade(rating)} {mode === 'COMMERCIAL' ? 'grade' : 'readiness level'}.
                  {(rating === 'D' || rating === 'E') 
                    ? ` Significant exposure to ETS liabilities remains at €${etsExposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}.` 
                    : mode === 'COMMERCIAL' ? ' Compliance targets are currently met.' : ' Operational targets are currently met.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
