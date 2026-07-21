"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Ship, Lock, Mail, Loader2, ArrowRight, User as UserIcon } from "lucide-react"

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("admin@vesselcii.com")
  const [password, setPassword] = useState("demo")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        // Sign Up Flow
        const registerRes = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        
        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          throw new Error(registerData.error || "Failed to register");
        }

        // Auto-login after successful registration
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          setError("Account created, but automatic sign-in failed. Please log in manually.");
          setIsSignUp(false);
        } else {
          router.push("/dashboard");
        }
      } else {
        // Login Flow
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
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#071326] border border-[#1e3456] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0D9E75] focus:ring-1 focus:ring-[#0D9E75] transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
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
            {loading ? <Loader2 size={20} className="animate-spin" /> : (isSignUp ? "Sign Up" : "Sign In")}
            {!loading && <ArrowRight size={18} />}
          </button>

          {!isSignUp && (
            <button
              type="button"
              onClick={() => {
                setEmail("admin@vesselcii.com");
                setPassword("demo");
              }}
              className="w-full py-3 px-4 bg-[#071326] border border-[#1e3456] text-teal-400 hover:text-teal-300 hover:border-teal-500/50 rounded-xl text-sm font-semibold transition-all mt-2"
            >
              🚀 Quick Demo Login (Admin)
            </button>
          )}
        </form>

        <div className="mt-6 text-center text-sm border-t border-[#1e3456] pt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              if (!isSignUp) {
                // Clear demo values when switching to signup
                setName("");
                setEmail("");
                setPassword("");
              } else {
                // Set default demo values when switching back to login
                setEmail("admin@vesselcii.com");
                setPassword("demo");
              }
            }}
            className="text-[#0D9E75] hover:underline hover:text-teal-400 transition-colors font-medium"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#1e3456] text-center">
          <p className="text-xs text-slate-500 mb-2">Demo Credentials:</p>
          <div className="flex justify-center gap-4 text-xs font-mono text-slate-400">
            <span>admin@vesselcii.com</span>
            <span>manager@vesselcii.com</span>
            <span>officer1@vesselcii.com</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Pwd: demo</p>
        </div>
      </div>
    </div>
  )
}
