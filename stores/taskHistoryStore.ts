import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TaskHistoryEntry } from '../types';
import useSystemStore from './systemStore'; // Import the new system store

interface TaskHistoryState {
  history: TaskHistoryEntry[];
  addTask: (entry: TaskHistoryEntry) => void;
  clearHistory: () => void;
}

const useTaskHistoryStore = create<TaskHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addTask: (entry) => {
        set((state) => ({
          // Prepend new entries to show the latest first
          history: [entry, ...state.history],
        }));

        // Update system health statistics
        const { incrementTotal, incrementSuccess, incrementFailure } = useSystemStore.getState();
        incrementTotal();
        if (entry.status === 'success') {
          incrementSuccess();
        } else {
          incrementFailure();
        }
      },
      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'amrikyy-os-task-history-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTaskHistoryStore;