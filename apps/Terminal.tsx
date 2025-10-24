import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { TaskHistoryEntry } from '../types';

interface File {
    type: 'file';
    content: string;
}
interface Directory {
    type: 'folder';
    children: Record<string, File | Directory>;
}
type FileSystemNode = File | Directory;

const initialFileSystem: Directory = {
    type: 'folder',
    children: {
        'Documents': {
            type: 'folder',
            children: {
                'Project_Alpha.docx': { type: 'file', content: '' },
                'Meeting_Notes.txt': { type: 'file', content: 'Notes from the meeting.' },
            }
        },
        'Pictures': {
            type: 'folder',
            children: {
                'Vacation': {
                    type: 'folder',
                    children: {
                        'beach.jpg': { type: 'file', content: '' },
                        'mountains.jpg': { type: 'file', content: '' },
                    }
                },
                'desktop_background.jpg': { type: 'file', content: '' },
            }
        },
        'Projects': {
            type: 'folder',
            children: {
                'AI_OS_v2': {
                    type: 'folder',
                    children: {
                         'package.json': { type: 'file', content: '{}' },
                    }
                }
            }
        },
        'README.md': { type: 'file', content: '# Welcome to Amrikyy AI OS!' },
    }
};


interface TerminalOutput {
  id: number;
  type: 'command' | 'response' | 'error';
  text: string;
}

const TerminalApp: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const endOfOutputRef = useRef<HTMLDivElement>(null);
  
  const [fileSystem, setFileSystem] = useState<Directory>(initialFileSystem);
  const [currentPath, setCurrentPath] = useState('/');

  const getNodeFromPath = (path: string, fs: Directory): FileSystemNode | null => {
    if (path === '/') return fs;
    const segments = path.split('/').filter(p => p);
    let currentNode: FileSystemNode = fs;
    for (const segment of segments) {
      if (currentNode.type === 'folder' && currentNode.children[segment]) {
        currentNode = currentNode.children[segment];
      } else {
        return null;
      }
    }
    return currentNode;
  };

  const resolvePath = (rawPath: string): string => {
    let newPathSegments;
    if (rawPath.startsWith('/')) {
      newPathSegments = [];
    } else {
      newPathSegments = currentPath.split('/').filter(p => p);
    }

    rawPath.split('/').forEach(segment => {
      if (segment === '' || segment === '.') return;
      if (segment === '..') {
        newPathSegments.pop();
      } else {
        newPathSegments.push(segment);
      }
    });

    return '/' + newPathSegments.join('/');
  };

  useEffect(() => {
    endOfOutputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;
    
    const newHistory = [trimmedCommand, ...history];
    setHistory(newHistory);
    setHistoryIndex(-1);

    const [cmd, ...args] = trimmedCommand.split(' ');
    let responseText: string = '';
    let responseType: 'response' | 'error' = 'response';

    const newOutput: TerminalOutput[] = [{ id: Date.now(), type: 'command', text: `$ ${trimmedCommand}` }];
    
    switch(cmd) {
        case 'help':
            responseText = 'Available: help, clear, ls, pwd, cd, mkdir, touch, rm, echo, date, whoami';
            break;
        case 'clear':
            setOutput([]);
            setCommand('');
            return; // Exit early
        case 'ls': {
            const node = getNodeFromPath(currentPath, fileSystem);
            if (node && node.type === 'folder') {
                responseText = Object.keys(node.children).map(name => {
                    return node.children[name].type === 'folder' ? `${name}/` : name;
                }).join('\t') || '(empty)';
            } else {
                responseText = 'ls: cannot access current directory.';
                responseType = 'error';
            }
            break;
        }
        case 'pwd':
            responseText = currentPath;
            break;
        case 'cd': {
            const targetPath = resolvePath(args[0] || '/');
            const targetNode = getNodeFromPath(targetPath, fileSystem);
            if (targetNode && targetNode.type === 'folder') {
                setCurrentPath(targetPath);
            } else {
                responseText = `cd: ${args[0]}: No such file or directory`;
                responseType = 'error';
            }
            break;
        }
        case 'mkdir': {
            const dirName = args[0];
            if (!dirName || dirName.includes('/')) {
                responseText = `mkdir: Invalid directory name`;
                responseType = 'error';
                break;
            }
            const parentNode = getNodeFromPath(currentPath, fileSystem);
            if (parentNode && parentNode.type === 'folder') {
                if (parentNode.children[dirName]) {
                    responseText = `mkdir: cannot create directory ‘${dirName}’: File exists`;
                    responseType = 'error';
                } else {
                    const newFs = JSON.parse(JSON.stringify(fileSystem));
                    const newParentNode = getNodeFromPath(currentPath, newFs) as Directory;
                    newParentNode.children[dirName] = { type: 'folder', children: {} };
                    setFileSystem(newFs);
                }
            }
            break;
        }
        case 'touch': {
            const fileName = args[0];
            if (!fileName || fileName.includes('/')) {
                responseText = `touch: Invalid file name`;
                responseType = 'error';
                break;
            }
            const parentNode = getNodeFromPath(currentPath, fileSystem);
            if (parentNode && parentNode.type === 'folder') {
                if (!parentNode.children[fileName]) {
                    const newFs = JSON.parse(JSON.stringify(fileSystem));
                    const newParentNode = getNodeFromPath(currentPath, newFs) as Directory;
                    newParentNode.children[fileName] = { type: 'file', content: '' };
                    setFileSystem(newFs);
                }
                // If file exists, do nothing (like unix touch)
            }
            break;
        }
        case 'rm': {
            const targetName = args[0];
             if (!targetName || targetName.includes('/')) {
                responseText = `rm: Invalid target name`;
                responseType = 'error';
                break;
            }
            const parentNode = getNodeFromPath(currentPath, fileSystem);
            if (parentNode && parentNode.type === 'folder') {
                const targetNode = parentNode.children[targetName];
                if (!targetNode) {
                    responseText = `rm: cannot remove '${targetName}': No such file or directory`;
                    responseType = 'error';
                } else if (targetNode.type === 'folder' && Object.keys(targetNode.children).length > 0) {
                    responseText = `rm: cannot remove '${targetName}': Directory not empty`;
                    responseType = 'error';
                } else {
                    const newFs = JSON.parse(JSON.stringify(fileSystem));
                    const newParentNode = getNodeFromPath(currentPath, newFs) as Directory;
                    delete newParentNode.children[targetName];
                    setFileSystem(newFs);
                }
            }
            break;
        }
        case 'echo': responseText = args.join(' '); break;
        case 'date': responseText = new Date().toString(); break;
        case 'whoami': responseText = 'guest'; break;
        default:
            responseText = `command not found: ${cmd}`;
            responseType = 'error';
    }

    if (responseText) {
      newOutput.push({ id: Date.now() + 1, type: responseType, text: responseText });
    }
    
    setOutput(prev => [...prev, ...newOutput]);
    setCommand('');
    
    onTaskComplete({
        id: Date.now().toString(),
        agentId: 'terminal',
        agentName: 'Terminal',
        taskType: `Exec: ${cmd}`,
        taskInput: trimmedCommand,
        taskOutput: responseText || 'Command executed successfully.',
        timestamp: new Date().toISOString(),
        status: responseType === 'error' ? 'error' : 'success',
        errorMessage: responseType === 'error' ? responseText : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setCommand(history[newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setCommand(history[newIndex] || '');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-mono p-2" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {output.map(line => (
          <div key={line.id} className="whitespace-pre-wrap break-words">
            {line.type === 'command' ? (
                <span className="text-green-400">{line.text}</span>
            ) : line.type === 'error' ? (
                <span className="text-red-400">{line.text}</span>
            ) : (
                <span className="text-gray-300">{line.text}</span>
            )}
          </div>
        ))}
        <div ref={endOfOutputRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-blue-400">{currentPath}</span>
        <span className="text-green-400 mx-2">$</span>
        <input
          type="text"
          value={command}
          onChange={e => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none focus:ring-0 w-full text-white"
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalApp;