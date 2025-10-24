import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SystemState {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  successfulDebugs: number;
  incrementTotal: () => void;
  incrementSuccess: () => void;
  incrementFailure: () => void;
  incrementSuccessfulDebugs: () => void;
  resetStats: () => void; // Optional: for debugging or user action
}

const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      successfulDebugs: 0,
      
      incrementTotal: () => set((state) => ({ totalTasks: state.totalTasks + 1 })),
      incrementSuccess: () => set((state) => ({ successfulTasks: state.successfulTasks + 1 })),
      incrementFailure: () => set((state) => ({ failedTasks: state.failedTasks + 1 })),
      incrementSuccessfulDebugs: () => set((state) => ({ successfulDebugs: state.successfulDebugs + 1 })),
      
      resetStats: () => set({
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        successfulDebugs: 0,
      }),
    }),
    {
      name: 'amrikyy-os-system-health-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSystemStore;