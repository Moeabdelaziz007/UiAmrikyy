import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Folder, FileText, ArrowLeft } from 'lucide-react';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { TaskHistoryEntry } from '../types';
import useWindowStore from '../stores/windowStore';

interface FileEntry {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified?: string;
  content?: string;
}

const mockFileSystem: Record<string, FileEntry[]> = {
  '/': [
    { name: 'Documents', type: 'folder' },
    { name: 'Pictures', type: 'folder' },
    { name: 'Projects', type: 'folder' },
    { name: 'README.md', type: 'file', size: '2KB', modified: '2024-10-23', content: '# Welcome to Amrikyy AI OS!' },
  ],
  '/Documents': [
    { name: 'Project_Alpha.docx', type: 'file', size: '128KB', modified: '2024-10-22' },
    { name: 'Meeting_Notes.txt', type: 'file', size: '15KB', modified: '2024-10-21' },
  ],
  '/Pictures': [
    { name: 'Vacation', type: 'folder' },
    { name: 'desktop_background.jpg', type: 'file', size: '2.3MB', modified: '2024-10-20' },
  ],
  '/Pictures/Vacation': [
    { name: 'beach.jpg', type: 'file', size: '4.1MB', modified: '2024-09-15' },
    { name: 'mountains.jpg', type: 'file', size: '3.8MB', modified: '2024-09-16' },
  ],
  '/Projects': [
    { name: 'AI_OS_v2', type: 'folder' },
  ],
  '/Projects/AI_OS_v2': [
    { name: 'package.json', type: 'file', size: '1KB', modified: '2024-10-23' },
  ],
};

const FileManagerApp: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const [currentPath, setCurrentPath] = useState('/');

  const navigateTo = (folderName: string) => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    if (mockFileSystem[newPath]) {
      setCurrentPath(newPath);
    }
  };

  const navigateBack = () => {
    if (currentPath === '/') return;
    const pathParts = currentPath.split('/').filter(p => p);
    pathParts.pop();
    setCurrentPath(`/${pathParts.join('/')}`);
  };

  const handleEntryClick = (entry: FileEntry) => {
    if (entry.type === 'folder') {
      navigateTo(entry.name);
    } else {
        onTaskComplete({
            id: Date.now().toString(),
            agentId: 'fileManager',
            agentName: 'File Manager',
            taskType: 'Open File',
            taskInput: { path: `${currentPath}/${entry.name}`.replace('//', '/') },
            taskOutput: `Simulated opening of ${entry.name}. Content: "${entry.content || 'N/A'}"`,
            timestamp: new Date().toISOString(),
            status: 'success',
        });
    }
  };

  const files = mockFileSystem[currentPath] || [];

  return (
    <div className="h-full flex flex-col bg-background p-2 text-text">
      <div className="flex items-center p-2 mb-2 border-b" style={{ borderColor: theme.colors.border }}>
        <button onClick={navigateBack} disabled={currentPath === '/'} className="p-1 mr-2 rounded hover:bg-white/10 disabled:opacity-50">
          <ArrowLeft size={18} />
        </button>
        <span className="font-mono text-sm text-text-secondary">{currentPath}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map(entry => (
          <motion.div
            key={entry.name}
            className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-white/10"
            onClick={() => handleEntryClick(entry)}
            whileTap={{ scale: 0.98 }}
          >
            {entry.type === 'folder' 
              ? <Folder className="w-5 h-5 text-primary" style={{ color: theme.colors.primary }} />
              : <FileText className="w-5 h-5 text-text-secondary" />
            }
            <span className="flex-1 truncate">{entry.name}</span>
            <span className="text-xs text-text-secondary">{entry.size}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FileManagerApp;
