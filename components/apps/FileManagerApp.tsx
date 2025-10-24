import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FolderOpenIcon, FileText, Folder, HardDrive, ArrowLeft } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface FileManagerAppProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
  // appId is passed by WindowManager, but not directly used here for mock content
}

interface FileEntry {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified?: string;
  content?: string; // For mock file content
}

const mockFileSystem: Record<string, FileEntry[]> = {
  '/': [
    { name: 'Documents', type: 'folder' },
    { name: 'Images', type: 'folder' },
    { name: 'Projects', type: 'folder' },
    { name: 'README.txt', type: 'file', size: '2KB', modified: '2024-07-28', content: 'Welcome to your mock file system!' },
  ],
  '/Documents': [
    { name: 'Report.docx', type: 'file', size: '500KB', modified: '2024-07-27' },
    { name: 'Notes.txt', type: 'file', size: '10KB', modified: '2024-07-26' },
  ],
  '/Images': [
    { name: 'wallpaper.jpg', type: 'file', size: '1.2MB', modified: '2024-07-20' },
    { name: 'icon.png', type: 'file', size: '50KB', modified: '2024-07-15' },
  ],
  '/Projects': [
    { name: 'MyWebApp', type: 'folder' },
    { name: 'AI_Research', type: 'folder' },
  ],
  '/Projects/MyWebApp': [
    { name: 'index.html', type: 'file', size: '5KB', modified: '2024-07-25' },
    { name: 'app.js', type: 'file', size: '100KB', modified: '2024-07-25' },
  ],
  '/Projects/AI_Research': [
    { name: 'model.py', type: 'file', size: '200KB', modified: '2024-07-24' },
    { name: 'data.csv', type: 'file', size: '1.5MB', modified: '2024-07-23' },
  ],
};


const FileManagerApp: React.FC<FileManagerAppProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.global[lang]; // Use global translations for FileManager
  const currentThemeColors = theme.colors;

  const [currentPath, setCurrentPath] = useState('/');
  const [currentContent, setCurrentContent] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulate fetching directory content
  React.useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const content = mockFileSystem[currentPath] || [];
      setCurrentContent(content);
      setLoading(false);
    }, 300);
  }, [currentPath]);

  const navigateTo = (folderName: string) => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
  };

  const navigateBack = () => {
    const lastSlashIndex = currentPath.lastIndexOf('/');
    if (lastSlashIndex <= 0) {
      setCurrentPath('/');
    } else {
      setCurrentPath(currentPath.substring(0, lastSlashIndex));
    }
  };

  const handleEntryClick = (entry: FileEntry) => {
    if (entry.type === 'folder') {
      navigateTo(entry.name);
    } else {
      // For files, you could simulate opening a viewer or log to history
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'fileManager',
        agentName: currentText.fileManager,
        taskType: `Open File: ${entry.name}`,
        taskInput: { path: `${currentPath}/${entry.name}` },
        taskOutput: `Simulated content: "${entry.content || 'Binary/Unknown content.'}"`,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 h-full flex flex-col`}
      style={{ background: currentThemeColors.background, color: currentThemeColors.text }}
    >
      <div className={`flex items-center mb-4 p-2 rounded-lg border`} style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
        {currentPath !== '/' && (
          <motion.button
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={navigateBack} 
            className="p-1 mr-2 rounded-md hover:bg-background transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </motion.button>
        )}
        <FolderOpenIcon className="w-6 h-6 mr-2 text-primary" style={{color: currentThemeColors.primary}} />
        <span className="font-semibold text-lg">{currentPath}</span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">{currentText.loading}</p>
        </div>
      ) : currentContent.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">{currentText.noFilesFound}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            {currentContent.map((entry) => (
              <motion.button
                key={entry.name}
                whileHover={{ scale: 1.01, backgroundColor: currentThemeColors.surface }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleEntryClick(entry)}
                className={`flex items-center p-3 rounded-lg border transition-colors text-left`}
                style={{ background: currentThemeColors.background, borderColor: currentThemeColors.border }}
              >
                {entry.type === 'folder' ? (
                  <Folder className="w-5 h-5 mr-3 text-cyan-500" />
                ) : (
                  <FileText className="w-5 h-5 mr-3 text-green-500" />
                )}
                <span className="flex-1 text-text">{entry.name}</span>
                {entry.size && <span className="text-sm text-text-secondary mr-2">{entry.size}</span>}
                {entry.modified && <span className="text-xs text-text-secondary">{entry.modified}</span>}
              </motion.button>
            ))}
          </div>
        </div>
      )}
      
    </motion.div>
  );
};

export default FileManagerApp;