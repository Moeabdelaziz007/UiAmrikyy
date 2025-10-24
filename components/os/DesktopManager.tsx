import React, { useState, useContext, useEffect } from 'react';
import useWindowStore from '../../stores/windowStore';
import useTaskHistoryStore from '../../stores/taskHistoryStore';
import Dashboard from '../Dashboard';
import Window from './Window';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import VoiceAssistant from './VoiceAssistant'; // Import the new VoiceAssistant
import { AnimatePresence } from 'framer-motion';
import { allApps } from '../../lib/apps';
import DesktopIcon from './DesktopIcon';
import { LanguageContext } from '../../App';


const DesktopManager: React.FC = () => {
  const windows = useWindowStore((state) => Object.values(state.windows));
  const { openWindow, closeWindow, minimizeWindow, toggleMaximize, focusWindow, updateWindowPosition, updateWindowSize, setTaskHistoryCallback } = useWindowStore();
  const addTaskToHistory = useTaskHistoryStore((state) => state.addTask);
  const [isStartMenuVisible, setStartMenuVisible] = useState(false);
  const { lang } = useContext(LanguageContext);

  // Connect the onTaskComplete callback from the window store to the task history store
  useEffect(() => {
    setTaskHistoryCallback(addTaskToHistory);
  }, [setTaskHistoryCallback, addTaskToHistory]);

  const handleLaunchApp = (appId: string) => {
    const app = allApps.find(a => a.id === appId);
    if (app) {
      openWindow(app);
    }
  };


  return (
    <div className="h-full w-full relative overflow-hidden">
      <Dashboard />

      {/* Desktop Icons */}
      <div className="absolute top-5 left-5 grid grid-cols-1 gap-4">
        {allApps.map(app => (
          <DesktopIcon 
            key={app.id} 
            app={app} 
            onLaunch={handleLaunchApp} 
            lang={lang}
          />
        ))}
      </div>


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

      <AnimatePresence>
        {isStartMenuVisible && <StartMenu onClose={() => setStartMenuVisible(false)} />}
      </AnimatePresence>

      <Taskbar onToggleStartMenu={() => setStartMenuVisible((prev) => !prev)} />
      
      {/* Add the Voice Assistant to the UI */}
      <VoiceAssistant />
    </div>
  );
};

export default DesktopManager;
