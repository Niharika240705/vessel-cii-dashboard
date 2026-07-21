"use client"

import { Bell, Search, UserCircle, X, AlertTriangle, FileWarning, Flame, Shield, Anchor } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useFleetMode } from "@/store/useFleetMode"

interface AlertData {
  id: string;
  vesselId: string;
  type: string;
  severity: string;
  message: string;
  createdAt: string;
  vessel: { name: string };
}

export default function TopNav({ userName, userRole }: { userName?: string, userRole?: string }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [alerts, setAlerts] = useState<AlertData[]>([])

  // Format the role for display (e.g. FLEET_MANAGER -> Fleet Manager)
  const roleDisplay = userRole?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')

  const fetchUnreadAlerts = async () => {
    try {
      const res = await fetch('/api/alerts/unread')
      const data = await res.json()
      if (data) {
        setUnreadCount(data.unreadCount)
        setAlerts(data.alerts)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchUnreadAlerts()
    // Could set up a polling interval here for a real app
    const interval = setInterval(fetchUnreadAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const markAllAsRead = async () => {
    try {
      await fetch('/api/alerts/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })
      setUnreadCount(0)
      setAlerts([])
      setShowNotifications(false)
    } catch (e) {
      console.error(e)
    }
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef])

  const getAlertIcon = (type: string, severity: string) => {
    const color = severity === 'HIGH' ? 'text-rose-500' : severity === 'MEDIUM' ? 'text-amber-500' : 'text-blue-500';
    if (type === 'CII_RISK') return <AlertTriangle className={`${color} mt-0.5 shrink-0`} size={16} />
    if (type === 'DOC_EXPIRY') return <FileWarning className={`${color} mt-0.5 shrink-0`} size={16} />
    if (type === 'FUEL_ANOMALY') return <Flame className={`${color} mt-0.5 shrink-0`} size={16} />
    return <AlertTriangle className={`${color} mt-0.5 shrink-0`} size={16} />
  }

  const { mode, toggleMode } = useFleetMode();

  return (
    <header className="h-16 w-full bg-[#071326] border-b border-[#1e3456] flex items-center justify-between px-6 z-50 sticky top-0">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#0D9E75] transition-colors" />
          <input 
            type="text" 
            placeholder="Search vessels by IMO or name..." 
            className="w-full bg-[#0B1F3A] border border-[#1e3456] text-sm text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-[#0D9E75] focus:ring-1 focus:ring-[#0D9E75] transition-all placeholder:text-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* Right side alerts & profile */}
      <div className="flex items-center gap-6 ml-4">
        
        {/* Fleet Mode Toggle */}
        <button 
          onClick={toggleMode}
          className="flex items-center justify-center gap-2 px-3 py-1.5 min-h-[44px] rounded-full border border-[#1e3456] bg-[#0B1F3A] hover:bg-[#112747] transition-colors"
          title={`Switch to ${mode === 'COMMERCIAL' ? 'Defence' : 'Commercial'} Mode`}
        >
          {mode === 'COMMERCIAL' ? (
            <><Anchor size={14} className="text-[#0D9E75]" /><span className="text-xs text-slate-300 font-medium hidden sm:inline">Commercial</span></>
          ) : (
            <><Shield size={14} className="text-blue-500" /><span className="text-xs text-slate-300 font-medium hidden sm:inline">Defence</span></>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative flex items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${showNotifications ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-[#071326] flex items-center justify-center text-[8px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 max-w-[90vw] bg-[#0B1F3A] border border-[#1e3456] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-[#1e3456] flex justify-between items-center bg-[#071326]">
                <h4 className="text-sm font-semibold text-white">Alerts ({unreadCount})</h4>
                <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white"><X size={14}/></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">No new alerts</div>
                ) : (
                  alerts.map((alert) => (
                    <Link href={`/dashboard/vessels/${alert.vesselId}`} key={alert.id} onClick={() => setShowNotifications(false)}>
                      <div className="p-3 border-b border-[#1e3456] hover:bg-[#112747] transition-colors cursor-pointer flex gap-3 items-start">
                        {getAlertIcon(alert.type, alert.severity)}
                        <div>
                          <p className="text-xs text-slate-200" dangerouslySetInnerHTML={{ __html: alert.message.replace(alert.vessel.name, `<strong>${alert.vessel.name}</strong>`) }}></p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {new Date(alert.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-[#1e3456] flex justify-between items-center bg-[#071326]">
                <Link href="/dashboard/alerts" onClick={() => setShowNotifications(false)} className="text-xs text-slate-400 hover:text-white px-2">
                  View All
                </Link>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-[#0D9E75] hover:text-teal-400 font-medium px-2">
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-[#1e3456]">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-white leading-tight">{userName || "User"}</span>
            <span className="text-xs text-[#0D9E75] font-semibold tracking-wide">{roleDisplay || "Staff"}</span>
          </div>
          <button className="min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-[#071326] rounded-full flex items-center justify-center">
                <UserCircle size={24} className="text-slate-400" />
              </div>
            </div>
          </button>
        </div>

      </div>
    </header>
  )
}
