"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import type { VesselCarbonData, FuelSplitData } from '@/app/dashboard/fleet-carbon/page';

const GRADE_COLORS: Record<string, string> = {
  'A': '#14b8a6', // teal-500
  'B': '#10b981', // emerald-500
  'C': '#f59e0b', // amber-500
  'D': '#f97316', // orange-500
  'E': '#f43f5e', // rose-500
};

const FUEL_COLORS: Record<string, string> = {
  'HFO': '#ef4444',
  'VLSFO': '#f59e0b',
  'MGO': '#3b82f6',
  'LNG': '#10b981',
  'METHANOL': '#14b8a6',
  'AMMONIA': '#06b6d4',
};

interface FleetCarbonChartsProps {
  vessels: VesselCarbonData[];
  fuelSplit: FuelSplitData[];
}

export default function FleetCarbonCharts({ vessels, fuelSplit }: FleetCarbonChartsProps) {
  // Truncate names for XAxis
  const chartData = vessels.map(v => ({
    ...v,
    shortName: v.name.length > 12 ? v.name.substring(0, 10) + '...' : v.name
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6">
        <h3 className="text-white font-semibold mb-6">Emissions by Vessel (MT)</h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e3456" />
              <XAxis 
                dataKey="shortName" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
                tick={{ fill: '#94a3b8' }} 
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
              />
              <Tooltip 
                cursor={{ fill: '#1e3456', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#071326', borderColor: '#1e3456', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontSize: '13px' }}
                formatter={(value: number, name: string) => [value.toLocaleString(undefined, { maximumFractionDigits: 0 }), 'CO₂ (MT)']}
                labelFormatter={(label) => `Vessel: ${label}`}
              />
              <Bar dataKey="co2Emissions" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
           {['A', 'B', 'C', 'D', 'E'].map(g => (
               <div key={g} className="flex items-center gap-1.5">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GRADE_COLORS[g] }}></div>
                   <span className="text-xs text-slate-400">Grade {g}</span>
               </div>
           ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6">
        <h3 className="text-white font-semibold mb-6">Emissions by Fuel Source</h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fuelSplit}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="co2"
                nameKey="fuelType"
              >
                {fuelSplit.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FUEL_COLORS[entry.fuelType] || '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#071326', borderColor: '#1e3456', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontSize: '13px' }}
                formatter={(value: number) => [value.toLocaleString(undefined, { maximumFractionDigits: 0 }), 'CO₂ (MT)']}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
