import React from 'react';

export function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] bg-[#0B1F3A] rounded-xl border border-[#1e3456] flex flex-col p-4 animate-pulse">
      <div className="w-1/3 h-5 bg-[#112747] rounded mb-4"></div>
      <div className="flex-1 w-full bg-[#112747] rounded-lg"></div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] bg-[#071326] relative overflow-hidden flex items-center justify-center animate-pulse">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(#1e3456 1px, transparent 1px), linear-gradient(90deg, #1e3456 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      <div className="z-10 bg-[#0B1F3A] px-4 py-2 rounded-full border border-[#1e3456] text-slate-400 text-sm">
        Loading mapping engine...
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full">
      <div className="h-12 border-b border-[#1e3456] flex items-center px-6 gap-4 animate-pulse">
        <div className="h-4 bg-[#112747] rounded w-1/4"></div>
        <div className="h-4 bg-[#112747] rounded w-1/4"></div>
        <div className="h-4 bg-[#112747] rounded w-1/4"></div>
        <div className="h-4 bg-[#112747] rounded w-1/4"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 border-b border-[#1e3456] flex items-center px-6 gap-4 animate-pulse">
          <div className="h-5 bg-[#112747] rounded w-1/4"></div>
          <div className="h-5 bg-[#112747] rounded w-1/4"></div>
          <div className="h-5 bg-[#112747] rounded w-1/4"></div>
          <div className="h-8 bg-[#112747] rounded w-24 ml-auto"></div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] h-[104px] animate-pulse flex flex-col justify-between">
          <div className="h-4 bg-[#112747] rounded w-1/2"></div>
          <div className="h-8 bg-[#112747] rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}
