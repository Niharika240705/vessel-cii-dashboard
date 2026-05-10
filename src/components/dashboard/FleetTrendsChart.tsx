"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function FleetTrendsChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full p-6 pb-2">
      <div className="mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          Fleet Extrapolated CO₂ Output 
          <span className="bg-[#0D9E75]/20 text-[#0D9E75] text-xs px-2 py-0.5 rounded-full font-bold pt-1">TRAILING 12 MONTHS</span>
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          <strong>How to read this chart:</strong> Displays the total aggregate CO₂ spewed by the entire monitored fleet over the previous year. Dips in the chart indicate fewer active voyages or use of greener fuels.
        </p>
      </div>
      
      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9E75" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0D9E75" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e3456" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}t`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#071326', borderColor: '#1e3456', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#0D9E75' }}
            />
            <Area 
              type="monotone" 
              dataKey="co2" 
              name="CO₂ Emissions (MT)"
              stroke="#0D9E75" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCo2)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
