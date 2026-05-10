"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function VesselDetailsChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full p-6 pb-2">
      <div className="mb-6">
        <h3 className="text-white font-semibold">Monthly CO₂ & AER Breakdown</h3>
        <p className="text-slate-400 text-sm">Voyage-derived emissions tracking</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              yAxisId="left"
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}t`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip 
              cursor={{ fill: '#112747' }}
              contentStyle={{ backgroundColor: '#071326', borderColor: '#1e3456', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#94a3b8' }} />
            <Bar 
              yAxisId="left"
              dataKey="vlsfo" 
              name="VLSFO (MT CO₂)" 
              stackId="a" 
              fill="#0D9E75" 
              radius={[0, 0, 4, 4]} 
              barSize={30}
            />
            <Bar 
              yAxisId="left"
              dataKey="mgo" 
              name="MGO (MT CO₂)" 
              stackId="a" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
