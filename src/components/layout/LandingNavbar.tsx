"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Anchor, ChevronRight, Menu, X } from 'lucide-react';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#071326]/90 backdrop-blur-md border-b border-[#1e3456] py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-[#0D9E75] flex items-center justify-center group-hover:bg-teal-400 transition-colors">
            <Anchor size={18} className="text-[#071326]" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">VesselCII</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#tech-stack" className="hover:text-white transition-colors">Tech Stack</a>
          <a href="#footer" className="hover:text-white transition-colors">Contact</a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/api/auth/signin?callbackUrl=/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/api/auth/signin?callbackUrl=/dashboard" className="flex items-center gap-2 bg-[#0D9E75] hover:bg-teal-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-teal-900/50">
            Try Demo <ChevronRight size={16} />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#071326] border-b border-[#1e3456] flex flex-col px-6 py-4 space-y-4 shadow-xl">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white text-sm font-medium">Features</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white text-sm font-medium">How It Works</a>
          <a href="#tech-stack" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white text-sm font-medium">Tech Stack</a>
          <hr className="border-[#1e3456]" />
          <Link href="/api/auth/signin?callbackUrl=/dashboard" className="text-slate-300 hover:text-white text-sm font-medium">Sign In</Link>
          <Link href="/api/auth/signin?callbackUrl=/dashboard" className="w-full flex items-center justify-center gap-2 bg-[#0D9E75] text-white text-sm font-medium px-4 py-2.5 rounded-lg">
            Try Demo <ChevronRight size={16} />
          </Link>
        </div>
      )}
    </nav>
  );
}
