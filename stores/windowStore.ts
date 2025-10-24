import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppDefinition, WindowData, TaskHistoryEntry } from '../types';

interface WindowState {
  windows: Record<string, WindowData>;
  activeWindowId: string | null;
  highestZIndex: number;
  // This callback will be set by a UI component to handle history updates
  onTaskComplete: (entry: TaskHistoryEntry) => void;
  // Action to open a new window for an app
  openWindow: (app: AppDefinition) => void;
  // Action to close a window by its ID
  closeWindow: (id: string) => void;
  // Action to set a window's state to 'minimized'
  minimizeWindow: (id: string) => void;
  // Action to toggle a window's state between 'maximized' and 'normal'
  toggleMaximize: (id: string) => void;
  // Action to bring a window to the front and set it as active
  focusWindow: (id: string) => void;
  // Action to update a window's position after dragging
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  // Action to update a window's size after resizing
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  // Method for a UI component to provide the real onTaskComplete function
  setTaskHistoryCallback: (callback: (entry: TaskHistoryEntry) => void) => void;
}

const useWindowStore = create<WindowState>()(
  persist(
    (set, get) => ({
      windows: {},
      activeWindowId: null,
      highestZIndex: 100,
      onTaskComplete: (entry) => {
        console.warn('onTaskComplete callback is not set. Task history will not be recorded.', entry);
      },

      setTaskHistoryCallback: (callback) => {
        set({ onTaskComplete: callback });
      },

      openWindow: (app) => {
        const { windows, focusWindow } = get();
        
        // Check if a window for this app is already open
        const existingWindow = Object.values(windows as Record<string, WindowData>).find((w) => w.appId === app.id);
        
        if (existingWindow) {
            focusWindow(existingWindow.id);
            return;
        }
        
        const isMobile = window.innerWidth < 768;
        const newId = `${app.id}-${Date.now()}`;
        const newZIndex = get().highestZIndex + 1;
        
        const newWindow: WindowData = {
          id: newId,
          appId: app.id,
          title: app.name.en, // The title is now correctly localized when passed to Window.tsx
          icon: app.icon,
          position: { 
            x: 50 + (Object.keys(windows).length % 5) * 40, 
            y: 50 + (Object.keys(windows).length % 5) * 40 
          },
          size: { width: 800, height: 600 },
          state: isMobile ? 'maximized' : 'normal',
          zIndex: newZIndex,
          initialLaunch: true, // This can be used for initial animations/positioning
        };

        set((state) => ({
          windows: { ...state.windows, [newId]: newWindow },
          activeWindowId: newId,
          highestZIndex: newZIndex,
        }));
      },

      closeWindow: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.windows;
          // FIX: Cast `rest` to a strongly typed record to ensure Object.values returns a typed array.
          // This resolves the issue where `remainingWindows[0]` was being inferred as `unknown`.
          const remainingWindows = Object.values(rest as Record<string, WindowData>).sort((a, b) => b.zIndex - a.zIndex);
          const newActiveId = remainingWindows.length > 0 ? remainingWindows[0].id : null;
          return { windows: rest, activeWindowId: newActiveId };
        });
      },

      minimizeWindow: (id) => {
        set((state) => {
            const newActiveId = state.activeWindowId === id ? null : state.activeWindowId;
            return {
                windows: {
                    ...state.windows,
                    [id]: { ...state.windows[id], state: 'minimized' },
                },
                activeWindowId: newActiveId
            }
        });
      },
      
      toggleMaximize: (id) => {
        set((state) => {
            const current = state.windows[id];
            const newState = current.state === 'maximized' ? 'normal' : 'maximized';
            return {
                windows: {
                    ...state.windows,
                    [id]: { ...current, state: newState },
                },
            };
        });
        get().focusWindow(id);
      },

      focusWindow: (id) => {
        const { windows, activeWindowId, highestZIndex } = get();
        // Don't re-focus if it's already the active, non-minimized window
        if (id === activeWindowId && windows[id]?.state !== 'minimized') return;

        const newZIndex = highestZIndex + 1;
        set({
          windows: {
            ...windows,
            [id]: { ...windows[id], zIndex: newZIndex, state: 'normal' }, // Restore if minimized
          },
          activeWindowId: id,
          highestZIndex: newZIndex,
        });
      },

      updateWindowPosition: (id, position) => {
        set((state) => ({
          windows: {
            ...state.windows,
            [id]: { ...state.windows[id], position, initialLaunch: false }, // Set initialLaunch to false after first move
          },
        }));
      },

      updateWindowSize: (id, size) => {
        set((state) => ({
          windows: {
            ...state.windows,
            [id]: { ...state.windows[id], size },
          },
        }));
      },
    }),
    {
      name: 'amrikyy-os-window-storage',
      storage: createJSONStorage(() => localStorage),
       // Only persist properties that make sense to restore
      partialize: (state) => ({
        windows: Object.fromEntries(
          // FIX: Cast Object.entries to resolve spread syntax error on 'unknown' type.
          (Object.entries(state.windows) as [string, WindowData][]).map(([id, win]) => [
            id,
            // Don't persist maximized or minimized state, restore as normal
            { ...win, state: 'normal' as const, zIndex: 100 } 
          ])
        )
      }),
    }
  )
);

export default useWindowStore;