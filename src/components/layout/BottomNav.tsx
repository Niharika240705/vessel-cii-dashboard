"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ship, Map, Bell, FileCheck, Settings } from "lucide-react"

const BOTTOM_NAV_ITEMS = [
  { name: "Fleet", href: "/dashboard/vessels", icon: Ship },
  { name: "Map", href: "/dashboard/map", icon: Map },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Reports", href: "/dashboard/compliance", icon: FileCheck },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#071326] border-t border-[#1e3456] px-2 py-2 flex justify-between items-center safe-area-bottom">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard' && item.href !== '/dashboard/alerts')
        // Special case for dashboard root
        const isExactActive = pathname === item.href

        // Determine if it should be highlighted
        const highlight = item.name === 'Settings' || item.name === 'Alerts' ? isExactActive : isActive;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 rounded-lg transition-colors ${
              highlight ? "text-[#0D9E75]" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <item.icon size={20} className="mb-1" />
            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
