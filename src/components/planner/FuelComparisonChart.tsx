"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const MOCK_PROJECTIONS = [
  { year: 2024, VLSFO: 4.5, LNG: 3.8, Methanol: 1.2, Ammonia: 0.1 },
  { year: 2025, VLSFO: 4.1, LNG: 4.0, Methanol: 1.5, Ammonia: 0.1 },
  { year: 2026, VLSFO: 3.2, LNG: 4.2, Methanol: 2.1, Ammonia: 0.3 },
  { year: 2027, VLSFO: 2.5, LNG: 4.0, Methanol: 3.2, Ammonia: 0.7 },
  { year: 2028, VLSFO: 1.8, LNG: 3.4, Methanol: 4.5, Ammonia: 1.8 },
  { year: 2029, VLSFO: 1.0, LNG: 2.5, Methanol: 5.6, Ammonia: 3.0 },
  { year: 2030, VLSFO: 0.4, LNG: 1.8, Methanol: 6.8, Ammonia: 4.5 },
]

export default function FuelComparisonChart() {
  return (
    <div className="w-full h-full p-6 pb-2">
      <div className="mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          Alternative Fuel Transition Footprint
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          <strong>How to read this chart:</strong> This graph projects how the global maritime fleet will phase out heavy bunker fuel (VLSFO) and adopt zero-emission alternatives to achieve net-zero regulatory compliance by 2030. Downward slopes mean a fuel is being phased out, while upward slopes indicate rising adoption.
        </p>
      </div>
      
      <div className="h-[350px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MOCK_PROJECTIONS} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e3456" />
            <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#071326', borderColor: '#1e3456', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey="VLSFO" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#071326' }} />
            <Line type="monotone" dataKey="LNG" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#071326' }} />
            <Line type="monotone" dataKey="Methanol" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#071326' }} />
            <Line type="monotone" dataKey="Ammonia" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#071326' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
