"use client"

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'
import { Settings, Zap } from 'lucide-react'

export default function SpeedOptimizer() {
  const [payload, setPayload] = useState(85)
  const [distance, setDistance] = useState(4500)

  // Physics Simulation: Power requirement roughly scales with Speed^3
  // Emissions scale linearly with power.
  const chartData = useMemo(() => {
    const data = []
    const baseResistance = payload / 100
    const limit = 4.0 // Simulated CII Limit
    for (let speed = 10; speed <= 22; speed++) {
      // Very simplified physics mock for portfolio demonstration
      const timeHours = distance / speed
      const fuelPerHr = 2.5 + Math.pow(speed / 13, 3) * baseResistance * 1.5
      const totalEmissions = fuelPerHr * timeHours * 3.114 // MT CO2
      const cii = (totalEmissions * 1e6) / (distance * 50000) // Mock DWT 50,000

      data.push({
        speed,
        cii: Number(cii.toFixed(2)),
        limit
      })
    }
    return data
  }, [payload, distance])

  const optimalPoint = chartData.find(d => d.cii > d.limit) || chartData[chartData.length - 1]
  const optimalSpeed = optimalPoint.speed - 1

  return (
    <div className="w-full bg-[#0B1F3A] rounded-2xl border border-[#1e3456] shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Zap size={18} className="text-blue-400" />
            AI Speed Optimization Solver
          </h3>
          <p className="text-slate-400 text-sm">Constrained Optimization: Maximise speed while maintaining strict CII compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Settings size={12} /> Optimization Boundary
          </span>
          <span className="bg-[#112747] text-teal-400 border border-teal-500/30 px-3 py-1 rounded-md text-sm font-bold shadow-[0_0_10px_theme(colors.teal.500/20)]">
            V_OPT: {optimalSpeed} kts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 border border-[#1e3456] rounded-xl p-4 bg-[#071326] space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Cargo Payload Load</span>
              <span className="text-white font-mono">{payload}%</span>
            </div>
            <input 
              type="range" min="50" max="100" value={payload} 
              onChange={(e) => setPayload(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Route Distance</span>
              <span className="text-white font-mono">{distance} NM</span>
            </div>
            <input 
              type="range" min="1000" max="10000" step="500" value={distance} 
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="pt-4 border-t border-[#1e3456]">
            <p className="text-xs text-slate-500 leading-relaxed shadow-sm">
              The engine automatically calculates hull resistance coefficient vs fuel burn {"$FC_{voy}$"} against the non-linear speed derivative to establish an optimal operating window.
            </p>
          </div>
        </div>

        <div className="col-span-3 h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e3456" />
              <XAxis 
                dataKey="speed" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
                label={{ value: 'Cruising Speed (Knots)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                label={{ value: 'CII Metric', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12, dx: 10 }}
              />
              <Tooltip 
                cursor={{ stroke: '#1e3456', strokeWidth: 2 }}
                contentStyle={{ backgroundColor: '#071326', borderColor: '#1e3456', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontSize: '13px' }}
              />
              <ReferenceArea x1={10} x2={optimalSpeed} fill="#0D9E75" fillOpacity={0.05} />
              <ReferenceArea x1={optimalSpeed} x2={22} fill="#ef4444" fillOpacity={0.05} />
              
              <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Max C-Grade Bound', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine x={optimalSpeed} stroke="#0D9E75" strokeDasharray="4 4" />

              <Line 
                type="monotone" 
                dataKey="cii" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                name="Projected Voyage CII"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
