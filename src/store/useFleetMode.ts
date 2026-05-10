import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FleetMode = 'COMMERCIAL' | 'DEFENCE';

interface FleetModeState {
  mode: FleetMode;
  toggleMode: () => void;
  setMode: (mode: FleetMode) => void;
}

export const useFleetMode = create<FleetModeState>()(
  persist(
    (set) => ({
      mode: 'COMMERCIAL',
      toggleMode: () => set((state) => ({ mode: state.mode === 'COMMERCIAL' ? 'DEFENCE' : 'COMMERCIAL' })),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'fleet-mode-storage',
    }
  )
);
