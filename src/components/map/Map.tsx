"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Navigation, AlertTriangle } from "lucide-react"
import { logger } from "@/lib/logger"

// Fix missing marker icons natively in Leaflet with Next.js
const createCustomIcon = (heading: number | null, color: string, pulse: boolean = false) => {
  const rotation = heading ? heading : 0
  
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="transform: rotate(${rotation}deg); color: ${color}; filter: drop-shadow(0 0 ${pulse ? '8px' : '4px'} ${color}); display: flex; justify-content: center; align-items: center; width: 24px; height: 24px;" class="${pulse ? 'animate-pulse' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })
}

// Global ECA Restricted Zones
const ECA_ZONES = [
  { name: 'Rotterdam Port limits', pos: [51.9225, 4.4791], radius: 120000, color: '#ef4444' }, // 120km
  { name: 'Singapore Strait', pos: [1.290270, 103.851959], radius: 80000, color: '#ef4444' },  // 80km
  { name: 'Antwerp', pos: [51.2194, 4.4025], radius: 40000, color: '#ef4444' }
]

interface VesselLocation {
  id: string
  name: string
  mmsi: number
  latitude: number
  longitude: number
  speed: number | null
  heading: number | null
  type: string
  lastPing: string
  ciiRatings?: { rating: string }[]
}

export default function LiveMap() {
  const [vessels, setVessels] = useState<VesselLocation[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const eventSource = new EventSource("/api/vessels/stream")

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.vessels) {
          setVessels(data.vessels)
          setLastUpdated(new Date())
        }
      } catch (error) {
        logger.error({ err: error }, "SSE message parsing failed")
      }
    }

    eventSource.onerror = (err) => {
      logger.warn({ err }, "SSE connection lost. Reconnecting natively...")
    }

    return () => eventSource.close()
  }, [])

  return (
    <div className="relative w-full h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] min-h-[400px] rounded-2xl overflow-hidden border border-[#1e3456] shadow-xl z-0">
      
      {/* HUD overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-[#071326]/90 backdrop-blur border border-[#1e3456] p-4 rounded-xl shadow-lg w-[280px] pointer-events-auto">
        <h3 className="text-white font-bold tracking-wide flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live AIS Feed
        </h3>
        <p className="text-xs text-slate-400 mt-2">
          Tracking Global Constellation.
          <br/>
          Visible Assets: <span className="text-[#0D9E75] font-bold">{vessels.length}</span>
        </p>
        <div className="mt-3 pt-3 border-t border-[#1e3456] text-[10px] uppercase text-slate-500 tracking-wider font-mono">
          Last Synced: {lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}
        </div>
      </div>

      {/* Geofence Alert Dashboard Overlay */}
      <div className="absolute bottom-4 right-4 z-[400] bg-red-500/10 backdrop-blur border border-red-500/30 p-3 md:p-4 rounded-xl shadow-lg w-48 md:w-64 pointer-events-auto">
         <h4 className="flex items-center gap-2 text-red-400 font-bold text-[10px] md:text-xs uppercase mb-1">
           <AlertTriangle size={14} /> Active Geofences
         </h4>
         <p className="text-[10px] text-red-300">
           Strict IMO emissions checks at Rotterdam, Antwerp, Singapore. Grade D/E banned from entry.
         </p>
      </div>

      <MapContainer 
        center={[20, 0]} 
        zoom={3} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", backgroundColor: '#071326' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render ECA Zones */}
        {ECA_ZONES.map((zone, i) => (
          <Circle 
            key={i}
            center={zone.pos as [number, number]} 
            pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.2, dashArray: '5, 5' }} 
            radius={zone.radius}
          >
            <Popup className="custom-popup">
              <div className="p-2 font-bold text-red-600 uppercase text-xs tracking-wider border-b border-red-200 mb-1">ECA ZONE STRICT</div>
              <div className="font-mono text-[10px] text-slate-600">{zone.name} restricts port entry for CII ratings D and E.</div>
            </Popup>
          </Circle>
        ))}

        {/* Render Vessels with Smart Routing/Flagging */}
        {vessels.map((v) => {
          const rating = v.ciiRatings?.[0]?.rating || 'C'
          const isRestricted = rating === 'D' || rating === 'E'
          const markerColor = isRestricted ? "#ef4444" : "#0D9E75" // Red if failed
          
          return (
            <Marker 
              key={v.id} 
              position={[v.latitude, v.longitude]}
              icon={createCustomIcon(v.heading, markerColor, isRestricted)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[240px]">
                  <div className="flex justify-between items-start border-b pb-2 mb-2">
                    <h4 className="font-bold text-slate-800 text-base">{v.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-white text-xs font-bold ${isRestricted ? 'bg-red-500' : 'bg-[#0D9E75]'}`}>
                      CII: {rating}
                    </span>
                  </div>
                  
                  {isRestricted && (
                    <div className="bg-red-50 border border-red-200 p-2 rounded mb-3">
                      <p className="text-red-700 text-xs font-bold tracking-tight uppercase flex items-center gap-1">
                        <AlertTriangle size={12} /> Geofence Entry Warning
                      </p>
                      <p className="text-red-600 text-[10px] mt-1">This vessel is restricted from entering ECAs (Rotterdam, Singapore) due to structural emissions failure.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="text-slate-500">MMSI</div>
                    <div className="font-mono">{v.mmsi}</div>
                    
                    <div className="text-slate-500">Speed (SOG)</div>
                    <div className="font-mono text-blue-600 font-semibold">{v.speed ? `${v.speed} kts` : 'N/A'}</div>
                    
                    <div className="text-slate-500 mt-2">Updated</div>
                    <div className="font-mono mt-2">{new Date(v.lastPing).toLocaleTimeString()}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
