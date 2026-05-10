import { StatsSkeleton, ChartSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#0B1F3A] animate-pulse border border-[#1e3456]"></div>
          <div>
            <div className="h-8 w-48 bg-[#112747] animate-pulse rounded mb-2"></div>
            <div className="h-4 w-32 bg-[#112747] animate-pulse rounded"></div>
          </div>
        </div>
        <div className="h-10 w-32 bg-[#112747] animate-pulse rounded"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <StatsSkeleton />

      {/* Main Stats: Chart & Gauge Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <ChartSkeleton />
        </div>
        <div className="lg:col-span-3">
          <ChartSkeleton />
        </div>
      </div>
    </div>
  );
}
