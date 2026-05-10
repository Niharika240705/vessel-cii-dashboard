import { TableSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-[#112747] animate-pulse rounded mb-2"></div>
        <div className="h-4 w-96 bg-[#112747] animate-pulse rounded"></div>
      </div>
      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm overflow-hidden">
        <TableSkeleton />
      </div>
    </div>
  );
}
