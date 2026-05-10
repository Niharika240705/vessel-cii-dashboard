"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Ship, 
  Map, 
  FileCheck, 
  Leaf, 
  Settings,
  LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vessels", href: "/dashboard/vessels", icon: Ship },
  { name: "Voyages & Map", href: "/dashboard/map", icon: Map },
  { name: "Compliance", href: "/dashboard/compliance", icon: FileCheck },
  { name: "Decarbonization", href: "/dashboard/planner", icon: Leaf },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen bg-[#0B1F3A] text-slate-300 flex flex-col border-r border-[#1e3456]">
      {/* Brand logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#1e3456]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#0D9E75] to-teal-700 flex items-center justify-center shadow-lg shadow-teal-900/50">
            <Ship size={18} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-wide">VesselCII</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          // Hide admin settings from vessel officers
          if (item.name === "Settings" && userRole === "VESSEL_OFFICER") return null

          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? "bg-[#162f55] text-white shadow-inner" 
                  : "hover:bg-[#112747] hover:text-white"
              }`}
            >
              <item.icon 
                size={18} 
                className={`${isActive ? "text-[#0D9E75]" : "text-slate-400 group-hover:text-slate-300"} transition-colors`} 
              />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0D9E75] shadow-[0_0_8px_rgba(13,158,117,1)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-[#1e3456]">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-[#112747] transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
