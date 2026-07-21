import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Anchor, ChevronRight, BarChart3, Cloud, Bell, 
  Map as MapIcon, FileText, Shield, CheckCircle2
} from 'lucide-react';
import LandingNavbar from '@/components/layout/LandingNavbar';

export const metadata: Metadata = {
  title: 'VesselCII - Maritime Compliance & Decarbonization Intelligence',
  description: 'Fleet compliance intelligence for the IMO CII era. Track CII ratings, forecast year-end grades, and act before you get a D.',
  openGraph: {
    images: ['/og-image.jpg'],
  },
};

const GITHUB_URL = "https://github.com/Niharika240705/vessel-cii-dashboard";

function DashboardMockup() {
  return (
    <div className="w-full rounded-xl bg-[#071326] border border-[#1e3456] shadow-2xl shadow-black/50 overflow-hidden flex flex-col select-none">
      {/* Mock Browser Header */}
      <div className="h-8 bg-[#0B1F3A] border-b border-[#1e3456] flex items-center px-4 gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
        <div className="mx-auto h-4 w-48 bg-[#162f55] rounded-md"></div>
      </div>
      
      {/* Mock App Content */}
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 w-48 bg-[#1e3456] rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-[#1e3456] rounded-md"></div>
            <div className="h-8 w-8 bg-[#0D9E75] rounded-md"></div>
          </div>
        </div>

        {/* Mock KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-[#0B1F3A] border border-[#1e3456] rounded-lg p-3 flex flex-col justify-between">
            <div className="h-3 w-16 bg-[#1e3456] rounded"></div>
            <div className="h-6 w-24 bg-teal-500/20 rounded border border-teal-500/30"></div>
          </div>
          <div className="h-20 bg-[#0B1F3A] border border-[#1e3456] rounded-lg p-3 flex flex-col justify-between">
            <div className="h-3 w-20 bg-[#1e3456] rounded"></div>
            <div className="h-6 w-16 bg-amber-500/20 rounded border border-amber-500/30"></div>
          </div>
          <div className="h-20 bg-[#0B1F3A] border border-[#1e3456] rounded-lg p-3 flex flex-col justify-between">
            <div className="h-3 w-24 bg-[#1e3456] rounded"></div>
            <div className="h-6 w-20 bg-rose-500/20 rounded border border-rose-500/30"></div>
          </div>
        </div>

        {/* Mock Fleet Table */}
        <div className="flex-1 bg-[#0B1F3A] border border-[#1e3456] rounded-lg overflow-hidden">
          <div className="h-10 bg-[#112747] border-b border-[#1e3456] flex items-center px-4 gap-4">
            <div className="h-2 w-24 bg-[#1e3456] rounded"></div>
            <div className="h-2 w-16 bg-[#1e3456] rounded mx-auto"></div>
            <div className="h-2 w-12 bg-[#1e3456] rounded ml-auto"></div>
          </div>
          {[
            { name: "Pacific Star", c: "bg-teal-500 text-teal-100", b: "bg-teal-500/20 border-teal-500/30", r: "A" },
            { name: "Nordic Voyager", c: "bg-emerald-500 text-emerald-100", b: "bg-emerald-500/20 border-emerald-500/30", r: "B" },
            { name: "Desert Rose", c: "bg-orange-500 text-orange-100", b: "bg-orange-500/20 border-orange-500/30", r: "D" },
            { name: "Oceanic Titan", c: "bg-rose-500 text-rose-100", b: "bg-rose-500/20 border-rose-500/30", r: "E" },
          ].map((row, i) => (
            <div key={i} className="h-12 border-b border-[#1e3456] last:border-0 flex items-center px-4 gap-4">
              <div className="text-xs font-semibold text-slate-300 w-32">{row.name}</div>
              <div className="flex-1 flex justify-center">
                <div className={`h-1.5 w-full max-w-[120px] rounded-full bg-[#162f55] overflow-hidden`}>
                  <div className={`h-full w-[70%] ${row.c.split(' ')[0]}`}></div>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.c} ${row.b}`}>
                {row.r} RATING
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0D9E75]/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#112747] border border-[#1e3456] text-teal-400 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            Live Demo Available
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Fleet compliance intelligence for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#0D9E75]">IMO CII era</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-lg leading-relaxed">
            Track CII ratings, forecast year-end grades, and simulate what-if scenarios in real-time. Act before your vessel drops to a D.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
            <Link href="/api/auth/signin?callbackUrl=/dashboard" className="flex items-center justify-center gap-2 bg-[#0D9E75] hover:bg-teal-500 text-white text-base font-medium px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(13,158,117,0.3)] hover:shadow-[0_0_30px_rgba(13,158,117,0.5)]">
              Try Demo <ChevronRight size={18} />
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#112747] hover:bg-[#162f55] text-white border border-[#1e3456] text-base font-medium px-8 py-4 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> View on GitHub
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-500/70" /> IMO CII Compliant</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-500/70" /> EU ETS Ready</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-500/70" /> Defence Mode</div>
          </div>
        </div>

        <div className="w-full max-w-[600px] mx-auto lg:ml-auto perspective-[1000px]">
          <div className="transform lg:-rotate-y-12 lg:rotate-x-12 lg:-translate-x-4 shadow-2xl transition-transform duration-700 hover:rotate-0 hover:translate-x-0">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <div className="w-full bg-[#0B1F3A] border-y border-[#1e3456] py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-[#1e3456]">
        <div className="text-center md:px-4">
          <div className="text-3xl font-extrabold text-white mb-1">15+</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Vessel Types Supported</div>
        </div>
        <div className="text-center md:px-4">
          <div className="text-3xl font-extrabold text-white mb-1">5</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">CII Grade Bands Tracked</div>
        </div>
        <div className="text-center md:px-4">
          <div className="text-3xl font-extrabold text-white mb-1">2030</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Trajectory Modelled</div>
        </div>
        <div className="text-center md:px-4">
          <div className="text-3xl font-extrabold text-white mb-1">€ / $</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">EU ETS Estimator</div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  const features = [
    { icon: BarChart3, title: "CII Forecasting", desc: "Project year-end ratings before it's too late. What-if speed and fuel scenarios in real time." },
    { icon: Cloud, title: "Fleet Carbon Budget", desc: "Track CO₂ across your entire fleet. See EU ETS cost exposure in EUR and USD." },
    { icon: Bell, title: "Smart Alerts", desc: "Automatic notifications for grade risk, document expiry, and fuel anomalies." },
    { icon: Anchor, title: "Voyage Optimisation", desc: "Rule-based recommendations: optimal speed, fuel switch, voyage consolidation." },
    { icon: FileText, title: "PDF Compliance Reports", desc: "One-click export of CII reports formatted for flag state submission." },
    { icon: Shield, title: "Defence Mode", desc: "Switch to naval operational metrics. Supports patrol vessels, auxiliaries, and logistics ships." },
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything a fleet manager needs</h2>
          <p className="text-slate-400 text-lg">A comprehensive suite of tools designed specifically for the complexities of modern maritime compliance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-[#0B1F3A] border border-[#1e3456] p-8 rounded-2xl hover:bg-[#112747] transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#071326] border border-[#1e3456] flex items-center justify-center mb-6 group-hover:border-[#0D9E75]/50 transition-colors">
                <f.icon className="text-[#0D9E75]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "1", title: "Connect your fleet", desc: "Add vessels with IMO number, type, and tonnage constraints." },
    { num: "2", title: "Log voyages & fuel", desc: "Record fuel type, quantity, distance, and cargo per voyage." },
    { num: "3", title: "Calculate automatically", desc: "The system applies IMO formulas and assigns A–E grades." },
    { num: "4", title: "Act on insights", desc: "Use forecasts, recommendations, and alerts to stay compliant." },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0B1F3A] border-y border-[#1e3456]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">From raw voyage data to compliance decisions</h2>
          <p className="text-slate-400 text-lg">A streamlined workflow that transforms disjointed telemetry into actionable intelligence.</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-[#1e3456]"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#071326] border-2 border-[#0D9E75] flex items-center justify-center text-white font-bold text-lg mb-6 shadow-[0_0_15px_rgba(13,158,117,0.3)]">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  const tech = [
    "Next.js 14", "TypeScript", "Prisma ORM", "PostgreSQL", 
    "Recharts", "Leaflet", "NextAuth.js", "Tailwind CSS", "Zustand"
  ];

  return (
    <section id="tech-stack" className="py-20 border-b border-[#1e3456]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">Built with modern infrastructure</h2>
        
        <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-3xl mx-auto">
          {tech.map((t, i) => (
            <span key={i} className="px-4 py-2 rounded-full bg-[#112747] border border-[#1e3456] text-slate-300 text-sm font-medium">
              {t}
            </span>
          ))}
        </div>
        <p className="text-slate-400 text-sm">Full-stack, type-safe, production-ready.</p>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#071326] to-[#040a14]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">See it in action — no account needed</h2>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          Explore a fully seeded fleet with real vessel data, live CII grades, automated forecasting, and global tracking.
        </p>
        <Link href="/api/auth/signin?callbackUrl=/dashboard" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-200 text-[#071326] text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-xl">
          Launch Demo Dashboard <ChevronRight size={20} />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer" className="bg-[#040a14] border-t border-[#1e3456] py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#0B1F3A] border border-[#1e3456] flex items-center justify-center">
            <Anchor size={16} className="text-[#0D9E75]" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">VesselCII</div>
            <div className="text-xs text-slate-500">Decarbonization Intelligence</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <Link href="/api/auth/signin?callbackUrl=/dashboard" className="hover:text-white transition-colors">Live Demo</Link>
          <a href={`mailto:contact@example.com`} className="hover:text-white transition-colors">Contact</a>
        </div>
        
        <div className="text-xs text-slate-600 font-medium">
          Built for the IMO CII era &middot; &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#071326] text-slate-200 selection:bg-teal-500/30 font-sans overflow-x-hidden scroll-smooth">
      <LandingNavbar />
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <HowItWorks />
        <TechStack />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
