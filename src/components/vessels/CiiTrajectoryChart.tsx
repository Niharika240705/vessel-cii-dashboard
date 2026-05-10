"use client";

import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Dot
} from 'recharts';
import { Info } from 'lucide-react';
import { useFleetMode } from '@/store/useFleetMode';
import { getNavalGrade } from './FleetModeAdapters';
import { ChartSkeleton } from '@/components/ui/Skeletons';

interface TrajectoryData {
  year: number;
  isHistorical: boolean;
  attainedCii: number;
  requiredCii: number;
  grade: string;
  gap: number;
  bandA: number;
  bandB: number;
  bandC: number;
  bandD: number;
  bandE: number;
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return '#10b981'; // green
    case 'B': return '#14b8a6'; // teal
    case 'C': return '#f59e0b'; // amber
    case 'D': return '#f97316'; // orange
    case 'E': return '#f43f5e'; // red
    default: return '#64748b';
  }
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  return (
    <Dot 
      cx={cx} 
      cy={cy} 
      r={5} 
      fill={getGradeColor(payload.grade)} 
      stroke="#0B1F3A" 
      strokeWidth={2} 
    />
  );
};

export default function CiiTrajectoryChart({ vesselId }: { vesselId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const { mode } = useFleetMode();

  useEffect(() => {
    fetch(`/api/vessels/${vesselId}/cii-trajectory`)
      .then(res => res.json())
      .then(res => {
        if (res.dataPoints) {
          // Prepare data for stacked areas and separate historical/projected lines
          const mapped = res.dataPoints.map((d: TrajectoryData, i: number, arr: TrajectoryData[]) => {
            const isTransition = i > 0 && !d.isHistorical && arr[i-1].isHistorical;
            
            return {
              ...d,
              // Stacked diffs for Area
              valA: d.bandA,
              valB: d.bandB - d.bandA,
              valC: d.bandC - d.bandB,
              valD: d.bandD - d.bandC,
              valE: d.bandE - d.bandD,
              
              // Split lines for styling
              historicalCii: d.isHistorical || isTransition ? d.attainedCii : null,
              projectedCii: !d.isHistorical || isTransition ? d.attainedCii : null,
            };
          });
          setData(mapped);
          setSummary(res.summary);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [vesselId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6 animate-pulse min-h-[400px]">
        <div className="h-6 w-48 bg-[#1e3456] rounded mb-6"></div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-[#0B1F3A] border border-[#1e3456] p-4 rounded-xl shadow-2xl">
          <p className="text-white font-bold mb-2">{label} {point.isHistorical ? '(Historical)' : '(Projected)'}</p>
          <div className="space-y-1 text-sm">
            <p className="text-slate-300">{mode === 'COMMERCIAL' ? 'Attained CII:' : 'Energy Idx:'} <span className="text-white font-medium">{point.attainedCii}</span></p>
            <p className="text-slate-300">{mode === 'COMMERCIAL' ? 'Required CII:' : 'Target Idx:'} <span className="text-white font-medium">{point.requiredCii}</span></p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1e3456]">
              <span className="text-slate-400">{mode === 'COMMERCIAL' ? 'Grade:' : 'Readiness:'}</span>
              <span className="px-2 py-0.5 rounded font-bold text-white text-xs" style={{ backgroundColor: getGradeColor(point.grade) }}>
                {mode === 'COMMERCIAL' ? point.grade : getNavalGrade(point.grade)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-lg">{mode === 'COMMERCIAL' ? 'Long-term Compliance Outlook' : 'Long-term Readiness Outlook'}</h3>
          <p className="text-sm text-slate-400 mt-1">Multi-year trajectory vs tightening {mode === 'COMMERCIAL' ? 'IMO thresholds' : 'Fleet targets'}</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6"><ChartSkeleton /></div>
      ) : (
        <div className="w-full overflow-x-auto styled-scrollbar pb-2 mt-6">
          <div className="h-[350px] w-full min-w-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3456" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b' }} tickMargin={10} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} domain={['auto', 'auto']} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                {/* Background Grade Bands (Stacked Areas) */}
                <Area type="monotone" dataKey="valA" stackId="1" stroke="none" fill="#10b981" fillOpacity={0.1} name="Band A" />
                <Area type="monotone" dataKey="valB" stackId="1" stroke="none" fill="#14b8a6" fillOpacity={0.1} name="Band B" />
                <Area type="monotone" dataKey="valC" stackId="1" stroke="none" fill="#f59e0b" fillOpacity={0.1} name="Band C" />
                <Area type="monotone" dataKey="valD" stackId="1" stroke="none" fill="#f97316" fillOpacity={0.1} name="Band D" />
                <Area type="monotone" dataKey="valE" stackId="1" stroke="none" fill="#f43f5e" fillOpacity={0.1} name="Band E" />

                {/* Required CII Line */}
                <Line 
                  type="monotone" 
                  dataKey="requiredCii" 
                  stroke="#cbd5e1" 
                  strokeWidth={2} 
                  dot={false} 
                  name={mode === 'COMMERCIAL' ? "IMO Required" : "Fleet Target"} 
                />

                {/* Historical Attained CII */}
                <Line 
                  type="monotone" 
                  dataKey="historicalCii" 
                  stroke="#ffffff" 
                  strokeWidth={3} 
                  dot={<CustomDot />}
                  name={mode === 'COMMERCIAL' ? "Historical Attained" : "Historical Energy Idx"} 
                />

                {/* Projected Attained CII */}
                <Line 
                  type="monotone" 
                  dataKey="projectedCii" 
                  stroke="#ffffff" 
                  strokeWidth={3} 
                  strokeDasharray="5 5"
                  dot={<CustomDot />}
                  name={mode === 'COMMERCIAL' ? "Projected Attained" : "Projected Energy Idx"} 
                />

                <ReferenceLine x={currentYear} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#3b82f6', fontSize: 12 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-[#071326] rounded-xl border border-[#1e3456] flex gap-3 items-start">
        <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-slate-300 leading-relaxed">
          {mode === 'COMMERCIAL' ? summary : summary
              .replace(/rating/g, 'readiness level')
              .replace(/IMO threshold/g, 'Fleet Energy Target')
              .replace(/CII reduction/g, 'energy reduction')
              .replace(/compliance rating/g, 'operational readiness')
          }
        </p>
      </div>
    </div>
  );
}
