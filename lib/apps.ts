// FIX: Add import for React to use its types.
import React from 'react';
import { AppDefinition } from '../types';
import { translations } from './i18n';

// Import Icons
import { PlaneTakeoffIcon, EyeIcon, SearchIcon, LanguagesIcon, CalendarIcon, HardDriveIcon, VideoIcon, MailIcon, CodeIcon, MegaphoneIcon, FolderOpenIcon, TerminalIcon, CogIcon, HistoryIcon, MessageSquareIcon, UsersIcon, ScrollTextIcon } from '../components/IconComponents';

// Import App Components
import TravelAgentUI from '../components/agents/NavigatorAgentUI';
import VisionAgentUI from '../components/agents/VisionAgentUI';
import ResearchAgentUI from '../components/agents/ResearchAgentUI';
import TranslatorAgentUI from '../components/agents/TranslatorAgentUI';
import SchedulerAgentUI from '../components/agents/SchedulerAgentUI';
import StorageAgentUI from '../components/agents/StorageAgentUI';
import MediaAgentUI from '../components/agents/MediaAgentUI';
import CommunicatorAgentUI from '../components/agents/CommunicatorAgentUI';
import CodingAgentUI from '../components/agents/CodingAgentUI';
// FIX: Corrected import for MarketingAgentUI which was causing an error due to the component file being incomplete. The component file will be fixed.
import MarketingAgentUI from '../components/agents/MarketingAgentUI';
import FileManagerApp from '../apps/FileManager';
import TerminalApp from '../apps/Terminal';
import SettingsApp from '../apps/Settings';
import TaskHistoryApp from '../components/apps/TaskHistoryApp';
import ChatbotApp from '../apps/ChatbotApp';
import NexusApp from '../apps/NexusApp';
import ContentCreatorApp from '../components/ContentCreatorApp';


export const appComponentMap: { [key: string]: React.ComponentType<any> } = {
  travel: TravelAgentUI,
  vision: VisionAgentUI,
  research: ResearchAgentUI,
  translator: TranslatorAgentUI,
  scheduler: SchedulerAgentUI,
  storage: StorageAgentUI,
  media: MediaAgentUI,
  communicator: CommunicatorAgentUI,
  coding: CodingAgentUI,
  marketing: MarketingAgentUI,
  fileManager: FileManagerApp,
  terminal: TerminalApp,
  settings: SettingsApp,
  taskHistory: TaskHistoryApp,
  chatbot: ChatbotApp,
  nexus: NexusApp,
  contentCreator: ContentCreatorApp,
};

export const allApps: AppDefinition[] = [
  // Agents
  { 
    id: 'nexus', 
    name: { en: translations.agents.nexus.en.name, ar: translations.agents.nexus.ar.name }, 
    description: { en: translations.agents.nexus.en.description, ar: translations.agents.nexus.ar.description }, 
    icon: UsersIcon, 
    color: 'pink',
    component: NexusApp,
  },
  { 
    id: 'chatbot', 
    name: { en: translations.agents.chatbot.en.name, ar: translations.agents.chatbot.ar.name }, 
    description: { en: translations.agents.chatbot.en.description, ar: translations.agents.chatbot.ar.description }, 
    icon: MessageSquareIcon, 
    color: 'green',
    component: ChatbotApp,
  },
   { 
    id: 'contentCreator', 
    name: { en: translations.agents.contentCreator.en.name, ar: translations.agents.contentCreator.ar.name }, 
    description: { en: translations.agents.contentCreator.en.description, ar: translations.agents.contentCreator.ar.description }, 
    icon: ScrollTextIcon, 
    color: 'orange',
    component: ContentCreatorApp,
  },
  { 
    id: 'travel', 
    name: { en: translations.agents.travel.en.name, ar: translations.agents.travel.ar.name }, 
    description: { en: translations.agents.travel.en.description, ar: translations.agents.travel.ar.description }, 
    icon: PlaneTakeoffIcon, 
    color: 'blue',
    component: TravelAgentUI,
  },
  { 
    id: 'vision', 
    name: { en: translations.agents.vision.en.name, ar: translations.agents.vision.ar.name }, 
    description: { en: translations.agents.vision.en.description, ar: translations.agents.vision.ar.description }, 
    icon: EyeIcon, 
    color: 'purple',
    component: VisionAgentUI,
  },
  { 
    id: 'research', 
    name: { en: translations.agents.research.en.name, ar: translations.agents.research.ar.name }, 
    description: { en: translations.agents.research.en.description, ar: translations.agents.research.ar.description }, 
    icon: SearchIcon, 
    color: 'green',
    component: ResearchAgentUI,
  },
  { 
    id: 'translator', 
    name: { en: translations.agents.translator.en.name, ar: translations.agents.translator.ar.name }, 
    description: { en: translations.agents.translator.en.description, ar: translations.agents.translator.ar.description }, 
    icon: LanguagesIcon, 
    color: 'cyan',
    component: TranslatorAgentUI,
  },
  { 
    id: 'scheduler', 
    name: { en: translations.agents.scheduler.en.name, ar: translations.agents.scheduler.ar.name }, 
    description: { en: translations.agents.scheduler.en.description, ar: translations.agents.scheduler.ar.description }, 
    icon: CalendarIcon, 
    color: 'orange',
    component: SchedulerAgentUI,
  },
  { 
    id: 'storage', 
    name: { en: translations.agents.storage.en.name, ar: translations.agents.storage.ar.name }, 
    description: { en: translations.agents.storage.en.description, ar: translations.agents.storage.ar.description }, 
    icon: HardDriveIcon, 
    color: 'indigo',
    component: StorageAgentUI,
  },
  { 
    id: 'media', 
    name: { en: translations.agents.media.en.name, ar: translations.agents.media.ar.name }, 
    description: { en: translations.agents.media.en.description, ar: translations.agents.media.ar.description }, 
    icon: VideoIcon, 
    color: 'red',
    component: MediaAgentUI,
  },
  { 
    id: 'communicator', 
    name: { en: translations.agents.communicator.en.name, ar: translations.agents.communicator.ar.name }, 
    description: { en: translations.agents.communicator.en.description, ar: translations.agents.communicator.ar.description }, 
    icon: MailIcon, 
    color: 'pink',
    component: CommunicatorAgentUI,
  },
  { 
    id: 'coding', 
    name: { en: translations.agents.coding.en.name, ar: translations.agents.coding.ar.name }, 
    description: { en: translations.agents.coding.en.description, ar: translations.agents.coding.ar.description }, 
    icon: CodeIcon, 
    color: 'emerald',
    component: CodingAgentUI,
  },
  { 
    id: 'marketing', 
    name: { en: translations.agents.marketing.en.name, ar: translations.agents.marketing.ar.name }, 
    description: { en: translations.agents.marketing.en.description, ar: translations.agents.marketing.ar.description }, 
    icon: MegaphoneIcon, 
    color: 'purple',
    component: MarketingAgentUI,
  },
  // System Apps
  {
    id: 'taskHistory',
    name: { en: translations.global.en.taskHistory, ar: translations.global.ar.taskHistory },
    description: { en: translations.global.en.taskHistoryDescription, ar: translations.global.ar.taskHistoryDescription },
    icon: HistoryIcon,
    color: 'blue',
    isSystemApp: true,
    component: TaskHistoryApp,
  },
  {
    id: 'fileManager',
    name: { en: translations.global.en.fileManager, ar: translations.global.ar.fileManager },
    description: { en: 'Browse and manage your files', ar: 'تصفح وقم بإدارة ملفاتك' },
    icon: FolderOpenIcon,
    color: 'amber',
    isSystemApp: true,
    component: FileManagerApp,
  },
  {
    id: 'terminal',
    name: { en: translations.global.en.terminal, ar: translations.global.ar.terminal },
    description: { en: 'Execute commands and scripts', ar: 'تنفيذ الأوامر والبرامج النصية' },
    icon: TerminalIcon,
    color: 'gray',
    isSystemApp: true,
    component: TerminalApp,
  },
  {
    id: 'settings',
    name: { en: translations.global.en.settings, ar: translations.global.ar.settings },
    description: { en: 'Configure OS and agent settings', ar: 'تكوين إعدادات النظام والوكلاء' },
    icon: CogIcon,
    color: 'gray',
    isSystemApp: true,
    component: SettingsApp,
  },
];