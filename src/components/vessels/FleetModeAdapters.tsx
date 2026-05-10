"use client";

import { useFleetMode } from "@/store/useFleetMode";
import { ReactNode } from "react";

export function FleetText({ comm, def }: { comm: string, def: string }) {
  const { mode } = useFleetMode();
  return <>{mode === 'COMMERCIAL' ? comm : def}</>;
}

export function FleetGuard({ mode: reqMode, children }: { mode: 'COMMERCIAL' | 'DEFENCE', children: ReactNode }) {
  const { mode } = useFleetMode();
  if (mode !== reqMode) return null;
  return <>{children}</>;
}

export const getNavalGrade = (grade: string) => {
  switch (grade) {
    case 'A': return 'Optimal';
    case 'B': return 'Efficient';
    case 'C': return 'Acceptable';
    case 'D': return 'Review Required';
    case 'E': return 'Non-Compliant';
    default: return grade;
  }
};
