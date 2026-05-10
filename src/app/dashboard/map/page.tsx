"use client"

import dynamic from "next/dynamic"
import { MapSkeleton } from "@/components/ui/Skeletons"

// Dynamically import the LiveMap to fix "window is not defined" SSR errors with Leaflet
const LiveMap = dynamic(() => import("@/components/map/Map"), { 
  ssr: false,
  loading: () => <MapSkeleton />
})

export default function MapPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Global Fleet Tracking</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time AIS streaming connected via aisstream.io WebSockets.</p>
      </div>

      <div className="flex-1 w-full relative">
        <LiveMap />
      </div>
    </div>
  )
}
