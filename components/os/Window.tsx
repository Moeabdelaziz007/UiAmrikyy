import React, { useContext } from 'react';
// FIX: Add Variants type to resolve framer-motion easing type error.
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, Copy } from 'lucide-react';
import { WindowData } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../App';
import { allApps } from '../../lib/apps';
import { appComponentMap } from '../../lib/apps';
import useWindowStore from '../../stores/windowStore';

interface WindowProps {
  windowData: WindowData;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragStop: (position: { x: number; y: number }) => void;
  onResizeStop: (size: { width: number; height: number }) => void;
}

const Window: React.FC<WindowProps> = ({
  windowData,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDragStop,
  onResizeStop,
}) => {
  const { theme } = useTheme();
  const { lang } = useContext(LanguageContext);
  const { onTaskComplete } = useWindowStore();

  const appDef = allApps.find(app => app.id === windowData.appId);
  const AppComponent = appDef ? appComponentMap[appDef.id] : null;
  const Icon = appDef?.icon;
  const title = appDef ? appDef.name[lang] : windowData.title;

  const handleResizeStop = (e: any, direction: any, ref: HTMLElement) => {
    onResizeStop({ width: ref.offsetWidth, height: ref.offsetHeight });
  };
  
  const handleDragStop = (e: any, data: { x: number; y: number }) => {
    onDragStop({ x: data.x, y: data.y });
  };

  const windowVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
  };

  const maximizedStyle = windowData.state === 'maximized' ? {
    width: '100%',
    height: 'calc(100% - 3.5rem)', // Full height minus taskbar
    transform: 'translate(0, 0)',
    top: 0,
    left: 0,
  } : {};

  return (
    <AnimatePresence>
      {windowData.state !== 'minimized' && (
        <Rnd
          size={windowData.state === 'maximized' ? { width: '100%', height: 'calc(100% - 3.5rem)' } : { width: windowData.size.width, height: windowData.size.height }}
          position={windowData.state === 'maximized' ? { x: 0, y: 0 } : { x: windowData.position.x, y: windowData.position.y }}
          onDragStart={onFocus}
          onDragStop={handleDragStop}
          onResizeStart={onFocus}
          onResizeStop={handleResizeStop}
          minWidth={300}
          minHeight={200}
          style={{ zIndex: windowData.zIndex }}
          bounds="parent"
          disableDragging={windowData.state === 'maximized'}
          enableResizing={windowData.state !== 'maximized'}
          dragHandleClassName="drag-handle"
        >
          <motion.div
            className="w-full h-full bg-surface/80 backdrop-blur-xl rounded-lg shadow-2xl border flex flex-col overflow-hidden relative"
            style={{ 
                borderColor: theme.colors.border,
                background: `rgba(${theme.mode === 'dark' ? '30, 41, 59' : '255, 255, 255'} 0.8)`,
                ...maximizedStyle
            }}
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseDownCapture={onFocus}
            aria-label={title}
          >
            {/* Holographic Grid Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03] animate-grid-pan" style={{
              backgroundImage: `linear-gradient(${theme.colors.primary} 1px, transparent 1px), linear-gradient(to right, ${theme.colors.primary} 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}></div>


            <header className="drag-handle h-10 flex items-center justify-between px-2 border-b cursor-grab active:cursor-grabbing flex-shrink-0 relative z-10" style={{ borderColor: theme.colors.border }}>
              {/* Holographic Scanline Effect */}
              <motion.div 
                className="absolute top-0 left-0 w-full h-1 bg-primary/80 filter blur-[1px]"
                animate={{
                  y: [0, 36], // 36px is approx height of header
                  opacity: [0.5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut'
                }}
              />
              <div className="flex items-center gap-2 pointer-events-none">
                {Icon && <Icon className="w-5 h-5" color={theme.colors.primary}/>}
                <span className="font-bold text-text select-none">{title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label="Minimize" onClick={onMinimize} className="p-2 rounded-full hover:bg-white/10 transition-colors text-text-secondary"><Minus size={16} /></button>
                <button aria-label="Maximize" onClick={onMaximize} className="p-2 rounded-full hover:bg-white/10 transition-colors text-text-secondary">
                  {windowData.state === 'maximized' ? <Copy size={16} /> : <Square size={16} />}
                </button>
                <button aria-label="Close" onClick={onClose} className="p-2 rounded-full hover:bg-error hover:text-white transition-colors text-text-secondary"><X size={16} /></button>
              </div>
            </header>
            <main className="flex-1 overflow-auto relative z-10">
              {AppComponent ? <AppComponent onTaskComplete={onTaskComplete} appId={windowData.appId} /> : <div>App component '{windowData.appId}' not found.</div>}
            </main>
          </motion.div>
        </Rnd>
      )}
    </AnimatePresence>
  );
};

export default Window;