import React, { useState, useContext, useEffect } from 'react';
import useWindowStore from '../../stores/windowStore';
import useTaskHistoryStore from '../../stores/taskHistoryStore';
import Dashboard from '../Dashboard';
import Window from './Window';
import Taskbar from './Taskbar';
import AppLauncher from '../AppLauncher'; // Import the new AppLauncher
import { AnimatePresence } from 'framer-motion';
import { allApps } from '../../lib/apps';
import { LanguageContext } from '../../App';


const DesktopManager: React.FC = () => {
  const windows = useWindowStore((state) => Object.values(state.windows));
  const { closeWindow, minimizeWindow, toggleMaximize, focusWindow, updateWindowPosition, updateWindowSize, setTaskHistoryCallback } = useWindowStore();
  const addTaskToHistory = useTaskHistoryStore((state) => state.addTask);
  const [isAppLauncherVisible, setAppLauncherVisible] = useState(false);

  // Connect the onTaskComplete callback from the window store to the task history store
  useEffect(() => {
    setTaskHistoryCallback(addTaskToHistory);
  }, [setTaskHistoryCallback, addTaskToHistory]);

  return (
    <div className="h-full w-full relative overflow-hidden">
      <Dashboard />

      {/* Desktop Icons are removed for a cleaner, intent-driven UI */}

      {/* Render all non-minimized windows */}
      <main className="absolute inset-0">
        {windows.map((win) =>
          win.state !== 'minimized' ? (
            <Window
              key={win.id}
              windowData={win}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              onFocus={() => focusWindow(win.id)}
              onDragStop={(pos) => updateWindowPosition(win.id, pos)}
              onResizeStop={(size) => updateWindowSize(win.id, size)}
            />
          ) : null
        )}
      </main>

      <AppLauncher 
        isVisible={isAppLauncherVisible} 
        onClose={() => setAppLauncherVisible(false)} 
      />

      <Taskbar onToggleAppLauncher={() => setAppLauncherVisible((prev) => !prev)} />
      
    </div>
  );
};

export default DesktopManager;