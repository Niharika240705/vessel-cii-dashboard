"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from 'recharts'

export default function CiiForecastChart({ data }: { data: any[] }) {
  const threshold = data && data.length > 0 ? data[0].threshold : 4.5;
  
  const bands = {
    a: threshold * 0.85,
    b: threshold * 0.94,
    c: threshold * 1.06,
    d: threshold * 1.19,
  };

  return (
    <div className="w-full h-full p-6 pb-2 bg-[#0B1F3A] rounded-2xl border border-[#1e3456] shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white font-semibold">CII Forecast Trajectory</h3>
          <p className="text-slate-400 text-sm">Real-time Extrapolation & What-If Analysis</p>
        </div>
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold tracking-wider">
          Live Forecast
        </span>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
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
              domain={[0, 'dataMax + 1']}
              tickFormatter={(val) => val.toFixed(1)}
            />
            <Tooltip 
              cursor={{ stroke: '#1e3456', strokeWidth: 2 }}
              contentStyle={{ backgroundColor: '#071326', borderColor: '#1e3456', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#94a3b8' }} />
            
            {/* Background Grade Bands */}
            <ReferenceArea y1={0} y2={bands.a} fill="#14b8a6" fillOpacity={0.08} />
            <ReferenceArea y1={bands.a} y2={bands.b} fill="#10b981" fillOpacity={0.08} />
            <ReferenceArea y1={bands.b} y2={bands.c} fill="#f59e0b" fillOpacity={0.08} />
            <ReferenceArea y1={bands.c} y2={bands.d} fill="#f97316" fillOpacity={0.08} />
            <ReferenceArea y1={bands.d} y2={threshold * 2} fill="#f43f5e" fillOpacity={0.08} />
            
            {/* Actual Track */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#0D9E75" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#0D9E75', strokeWidth: 0 }}
              name="Actual Trailing CII"
              connectNulls={true}
            />
            
            {/* Prediction Track */}
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Projected Trajectory"
              connectNulls={true}
            />

            {/* Threshold Line */}
            <Line 
              type="monotone" 
              dataKey="threshold" 
              stroke="#ef4444" 
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="Required Target"
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
