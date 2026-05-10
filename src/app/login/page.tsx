"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Ship, Lock, Mail, Loader2, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@vesselciidashboard.com")
  const [password, setPassword] = useState("demo")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#071326] flex items-center justify-center relative overflow-hidden">
      
      {/* Background Graphic Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0D9E75] rounded-full opacity-[0.03] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4f46e5] rounded-full opacity-[0.03] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 md:p-10 bg-[#0B1F3A]/95 backdrop-blur-sm rounded-2xl border border-[#1e3456] shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0D9E75] to-teal-700 flex items-center justify-center shadow-lg shadow-teal-900/50 mb-4">
            <Ship size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">VesselCII Dashboard</h1>
          <p className="text-slate-400 mt-2 text-sm text-center">Compliance & Decarbonization Intelligence Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#071326] border border-[#1e3456] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0D9E75] focus:ring-1 focus:ring-[#0D9E75] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#071326] border border-[#1e3456] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0D9E75] focus:ring-1 focus:ring-[#0D9E75] transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0D9E75] to-teal-600 hover:from-teal-500 hover:to-teal-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-900/30 hover:shadow-teal-900/50 transition-all disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#1e3456] text-center">
          <p className="text-xs text-slate-500 mb-2">Demo Credentials:</p>
          <div className="flex justify-center gap-4 text-xs font-mono text-slate-400">
            <span>admin@...</span>
            <span>manager@...</span>
            <span>officer@...</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Pwd: demo or hashed_password_123</p>
        </div>
      </div>
    </div>
  )
}
