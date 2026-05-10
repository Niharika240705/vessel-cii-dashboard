import { Bell, Shield, Mail, User, ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage notifications, strict compliance alerting, and user preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Notifications Config */}
        <div className="p-6 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1e3456]">
            <Bell className="text-[#0D9E75]" size={20} />
            <h2 className="text-lg font-semibold text-white">Alert Preferences</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Alerts for Rating Drops</p>
                <p className="text-xs text-slate-400 mt-0.5">Send a real-time email if a vessel drops below C rating.</p>
              </div>
              <div className="w-12 h-6 bg-[#0D9E75] rounded-full relative cursor-pointer shadow-inner">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Weekly Fleet Summary Report</p>
                <p className="text-xs text-slate-400 mt-0.5">Receive an automated PDF aggregate report every Monday.</p>
              </div>
              <div className="w-12 h-6 bg-[#0D9E75] rounded-full relative cursor-pointer shadow-inner">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
              </div>
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div>
                <p className="text-white font-medium">SMS Critical Notifications</p>
                <p className="text-xs text-slate-400 mt-0.5">Disabled by system administrator.</p>
              </div>
              <div className="w-12 h-6 bg-[#1e3456] rounded-full relative cursor-not-allowed">
                <div className="w-4 h-4 bg-slate-400 rounded-full absolute left-1 top-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Settings */}
        <div className="p-6 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1e3456]">
            <ShieldCheck className="text-amber-400" size={20} />
            <h2 className="text-lg font-semibold text-white">Regulatory Compliance</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e3456]/50">
              <div>
                <p className="text-white font-medium">Strict Compliance Mode</p>
                <p className="text-xs text-slate-400 mt-0.5 max-w-[280px]">Automatically flag voyages whose simulated consumption exceeds 80% of their proportional annual allowance.</p>
              </div>
              <div className="w-12 h-6 bg-amber-500 rounded-full relative cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
              </div>
            </div>

            <div>
              <p className="text-white font-medium mb-2">Default Carbon Price (EU ETS Simulation)</p>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">€</span>
                <input type="number" defaultValue="85" className="bg-[#071326] border border-[#1e3456] text-white px-3 py-1.5 rounded-lg w-24 text-sm focus:outline-none focus:border-[#0D9E75]" />
                <span className="text-slate-400 text-sm ml-2">per metric tonne</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
