# 📚 UiAmrikyy Codebase Index

**Repository**: Moeabdelaziz007/UiAmrikyy  
**Type**: AI-Powered Desktop OS UI Theme  
**Version**: 0.0.0  
**Last Updated**: October 24, 2025  
**Status**: 🟡 In Development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Core Features](#core-features)
5. [Component Architecture](#component-architecture)
6. [Backend Services](#backend-services)
7. [Key Files Reference](#key-files-reference)
8. [Dependencies](#dependencies)
9. [Development Guide](#development-guide)

---

## 🎯 Project Overview

**UiAmrikyy** is a modern, AI-powered desktop operating system interface built with React. It provides:
- Complete desktop OS experience in browser
- Window management system
- AI-powered agents and mini-apps
- Voice interaction capabilities
- Multi-theme support with smooth transitions
- Responsive desktop environment

### Purpose
This is primarily a **frontend UI/UX theme** that provides:
- Desktop OS metaphor interface
- Window management
- Application launcher
- Taskbar and start menu
- Multiple AI agent interfaces

---

## 🛠️ Technology Stack

### Frontend Core
- **Framework**: React 19.0.0
- **Build Tool**: Vite 5.3.4
- **Language**: TypeScript 5.2.2
- **Styling**: TailwindCSS 3.4.6
- **Animations**: Framer Motion 11.3.2
- **Routing**: React Router DOM 6.25.1
- **Icons**: Lucide React 0.546.0

### Backend (Node.js)
- **Runtime**: Node.js
- **Framework**: Express 4.19.2
- **APIs**: Google Cloud APIs (Speech, Vision, Translate)
- **Communication**: Telegram Bot API

### Testing
- **Unit Tests**: Jest 29.7.0
- **E2E Tests**: Playwright 1.45.3
- **Testing Library**: React Testing Library 16.0.0

### Development Tools
- **TypeScript**: Static typing
- **ESLint**: Code linting
- **Babel**: JavaScript transpilation
- **PostCSS**: CSS processing

---

## 📁 Directory Structure

```
UiAmrikyy/
│
├── 📱 Frontend (React + TypeScript)
│   ├── App.tsx                      # Main application component
│   ├── index.tsx                    # Application entry point
│   ├── types.ts                     # TypeScript type definitions
│   │
│   ├── components/                  # React components
│   │   ├── os/                      # OS-level components
│   │   │   ├── DesktopManager.tsx   # Main desktop manager
│   │   │   ├── Window.tsx           # Window component
│   │   │   ├── Taskbar.tsx          # Bottom taskbar
│   │   │   ├── StartMenu.tsx        # Start menu
│   │   │   ├── DesktopIcon.tsx      # Desktop icons
│   │   │   ├── VoiceAssistant.tsx   # Voice interaction
│   │   │   ├── VoiceSettings.tsx    # Voice configuration
│   │   │   ├── VoiceWaveform.tsx    # Voice visualization
│   │   │   └── GeminiLogo.tsx       # Branding
│   │   │
│   │   ├── apps/                    # Application components
│   │   │   ├── FileManagerApp.tsx   # File manager
│   │   │   ├── TerminalApp.tsx      # Terminal emulator
│   │   │   └── TaskHistoryApp.tsx   # Task history viewer
│   │   │
│   │   ├── agents/                  # AI Agent UIs
│   │   │   ├── CodingAgentUI.tsx    # Code assistant
│   │   │   ├── MarketingAgentUI.tsx # Marketing agent
│   │   │   ├── NavigatorAgentUI.tsx # Navigation agent
│   │   │   ├── ResearchAgentUI.tsx  # Research agent
│   │   │   ├── VisionAgentUI.tsx    # Vision/image agent
│   │   │   ├── CommunicatorAgentUI.tsx # Communication
│   │   │   ├── StorageAgentUI.tsx   # Storage management
│   │   │   ├── MediaAgentUI.tsx     # Media handling
│   │   │   ├── TranslatorAgentUI.tsx # Translation
│   │   │   └── SchedulerAgentUI.tsx # Scheduling
│   │   │
│   │   ├── LoginPage.tsx            # Authentication page
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── ChatScreen.tsx           # Chat interface
│   │   ├── RealtimeChat.tsx         # Real-time chat
│   │   ├── AgentInterface.tsx       # Agent interaction
│   │   ├── AgentCard.tsx            # Agent cards
│   │   ├── MiniAgentsHub.tsx        # Mini agents hub
│   │   ├── Settings.tsx             # Settings panel
│   │   ├── ThemeSelector.tsx        # Theme switcher
│   │   ├── WindowManager.tsx        # Window management
│   │   ├── WindowWrapper.tsx        # Window wrapper
│   │   ├── Taskbar.tsx              # Taskbar component
│   │   ├── AppLauncher.tsx          # App launcher
│   │   ├── Header.tsx               # Header component
│   │   ├── Avatar.tsx               # User avatar
│   │   ├── IconComponents.tsx       # Icon library
│   │   ├── TravelAssistanceApp.tsx  # Travel assistance
│   │   ├── TravelAssistant.tsx      # Travel helper
│   │   ├── TripPlanner.tsx          # Trip planning
│   │   ├── ContentCreator.tsx       # Content creation
│   │   ├── ContentCreatorApp.tsx    # Content creator app
│   │   ├── SmartNotesApp.tsx        # Smart notes
│   │   ├── TaskHistory.tsx          # Task history
│   │   ├── ImageStudio.tsx          # Image editor
│   │   ├── VideoStudio.tsx          # Video editor
│   │   ├── Transcriber.tsx          # Audio transcription
│   │   ├── TutorScreen.tsx          # Tutor interface
│   │   └── OSShell.tsx              # OS shell
│   │
│   ├── apps/                        # Standalone apps
│   │   ├── Settings.tsx             # Settings app
│   │   ├── Terminal.tsx             # Terminal app
│   │   └── FileManager.tsx          # File manager app
│   │
│   ├── contexts/                    # React contexts
│   │   └── ThemeContext.tsx         # Theme management
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useVoiceInput.ts         # Voice input hook
│   │   ├── useTTS.ts                # Text-to-speech hook
│   │   └── useVoiceRecognition.ts   # Voice recognition hook
│   │
│   ├── stores/                      # State management
│   │   ├── windowStore.ts           # Window state
│   │   └── taskHistoryStore.ts      # Task history state
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── apps.ts                  # App configurations
│   │   ├── themes.ts                # Theme definitions
│   │   └── i18n.ts                  # Internationalization
│   │
│   ├── services/                    # API services
│   │   └── geminiService.ts         # Gemini AI service
│   │
│   └── utils/                       # Utility functions
│       ├── audio.ts                 # Audio utilities
│       └── speech.ts                # Speech utilities
│
├── 🔧 Backend (Node.js + Express)
│   ├── index.js                     # Backend entry point
│   │
│   ├── routes/                      # API routes
│   │   └── api.js                   # Main API routes
│   │
│   ├── services/                    # Backend services
│   │   ├── geminiService.js         # Gemini AI service
│   │   ├── GoogleMapsService.js     # Google Maps API
│   │   ├── YouTubeService.js        # YouTube API
│   │   ├── TranslateService.js      # Translation service
│   │   ├── TelegramService.js       # Telegram bot
│   │   ├── agentOrchestrator.js     # Agent coordination
│   │   ├── aixExecutor.js           # AIX execution
│   │   └── aixParser.js             # AIX parsing
│   │
│   ├── agents/                      # AI Agents
│   │   ├── OrchestratorAgent.js     # Main orchestrator
│   │   ├── CodingAgent.js           # Code generation
│   │   ├── MarketingAgent.js        # Marketing tasks
│   │   ├── NavigatorAgent.js        # Navigation
│   │   ├── ResearchAgent.js         # Research tasks
│   │   ├── VisionAgent.js           # Image processing
│   │   ├── CommunicatorAgent.js     # Communication
│   │   ├── StorageAgent.js          # Storage management
│   │   ├── MediaAgent.js            # Media handling
│   │   ├── TranslatorAgent.js       # Translation
│   │   └── SchedulerAgent.js        # Scheduling
│   │
│   ├── aix_tasks/                   # AIX task definitions
│   │
│   ├── utils/                       # Utility functions
│   │   └── logger.js                # Logging utility
│   │
│   └── tests/                       # Backend tests
│       ├── orchestrator.test.js
│       ├── navigatorAgent.test.js
│       ├── marketingAgent.test.js
│       ├── codingAgent.test.js
│       └── visionAgent.test.js
│
├── 🧪 Testing
│   ├── e2e/                         # E2E tests
│   │   └── basic-navigation.spec.ts # Navigation tests
│   │
│   └── frontend/src/tests/          # Frontend tests
│       └── AppLauncher.test.tsx     # Component tests
│
├── ⚙️ Configuration
│   ├── package.json                 # Dependencies
│   ├── vite.config.ts               # Vite config
│   ├── tsconfig.json                # TypeScript config
│   ├── tailwind.config.js           # TailwindCSS config (if exists)
│   ├── jest.config.js               # Jest config
│   ├── jest-setup.js                # Jest setup
│   ├── playwright.config.ts         # Playwright config
│   ├── babel.config.js              # Babel config
│   └── manifest.json                # PWA manifest
│
├── 📄 Documentation
│   ├── README.md                    # Project documentation
│   └── metadata.json                # Project metadata
│
└── 🔐 Service Worker
    └── sw.js                        # Service worker for PWA
```

---

## ⭐ Core Features

### 1. Desktop OS Interface
- **Window Management**: Draggable, resizable windows
- **Taskbar**: Application launcher and running apps
- **Start Menu**: Application categories and quick access
- **Desktop Icons**: Quick launch shortcuts
- **Multi-Window Support**: Multiple apps running simultaneously

### 2. AI Agents
The system includes 10+ specialized AI agents:

| Agent | Purpose | UI Component |
|-------|---------|--------------|
| **Coding Agent** | Code generation & assistance | CodingAgentUI.tsx |
| **Marketing Agent** | Marketing content creation | MarketingAgentUI.tsx |
| **Navigator Agent** | Navigation & location services | NavigatorAgentUI.tsx |
| **Research Agent** | Information gathering | ResearchAgentUI.tsx |
| **Vision Agent** | Image analysis & generation | VisionAgentUI.tsx |
| **Communicator** | Email, messaging | CommunicatorAgentUI.tsx |
| **Storage Agent** | File & cloud storage | StorageAgentUI.tsx |
| **Media Agent** | Audio/video processing | MediaAgentUI.tsx |
| **Translator** | Multi-language translation | TranslatorAgentUI.tsx |
| **Scheduler** | Task & calendar management | SchedulerAgentUI.tsx |

### 3. Voice Interaction
- **Voice Input**: Speech-to-text
- **Voice Commands**: Control OS with voice
- **TTS (Text-to-Speech)**: System responses
- **Voice Settings**: Configure voice preferences
- **Visual Feedback**: Waveform visualization

### 4. Applications
Built-in applications:
- **File Manager**: Browse files
- **Terminal**: Command-line interface
- **Task History**: View past tasks
- **Travel Assistance**: Plan trips
- **Content Creator**: Generate content
- **Smart Notes**: Intelligent note-taking
- **Image Studio**: Edit images
- **Video Studio**: Edit videos
- **Transcriber**: Audio transcription
- **Tutor**: Learning assistant

### 5. Theme System
- **Multiple Themes**: Dark, light, cyberpunk, etc.
- **Smooth Transitions**: Animated theme changes
- **Custom Colors**: Configurable color schemes
- **Persistent Settings**: Save user preferences

### 6. Internationalization
- **Multi-Language**: English and Arabic support
- **RTL Support**: Right-to-left languages
- **Language Context**: Easy language switching

---

## 🏗️ Component Architecture

### Core Component Hierarchy

```
App.tsx
├── AppProviders
│   ├── ThemeProvider
│   ├── LanguageContext
│   ├── NotificationContext
│   └── TTSContext
│
├── LoginPage (unauthenticated)
│
└── AppContent (authenticated)
    └── DesktopManager
        ├── Desktop
        │   ├── DesktopIcon[]
        │   └── VoiceAssistant
        ├── Window[]
        │   └── (Various App Components)
        ├── Taskbar
        │   ├── StartMenu
        │   └── WindowButtons[]
        └── VoiceSettings
```

### Key Components

#### DesktopManager.tsx
**Purpose**: Main desktop environment controller
- Manages all windows
- Handles app launching
- Coordinates taskbar
- Controls desktop icons

#### Window.tsx
**Purpose**: Window container for all apps
- Draggable functionality
- Resize support
- Minimize/maximize/close
- Z-index management

#### Taskbar.tsx
**Purpose**: Bottom taskbar with start menu and running apps
- Start menu trigger
- Running apps display
- Window switching
- System tray

#### VoiceAssistant.tsx
**Purpose**: Voice interaction interface
- Voice input capture
- Speech recognition
- Command processing
- Visual feedback

---

## 🔧 Backend Services

### Service Architecture

#### Agent System
**File**: `backend/agents/OrchestratorAgent.js`
- Coordinates all specialized agents
- Routes requests to appropriate agent
- Manages agent communication

#### Google Cloud Integration
- **Speech-to-Text**: Voice input processing
- **Text-to-Speech**: Voice output generation
- **Translation**: Multi-language support
- **Vision**: Image analysis
- **Maps**: Location services

#### External APIs
- **YouTube**: Video services
- **Telegram**: Bot integration
- **Gemini AI**: Primary AI model

### API Endpoints
```
POST /api/agent/chat          # Chat with AI agents
POST /api/agent/task          # Execute specific task
POST /api/voice/transcribe    # Transcribe audio
POST /api/voice/synthesize    # Generate speech
POST /api/translate           # Translate text
POST /api/vision/analyze      # Analyze images
POST /api/maps/search         # Search locations
```

---

## 🔑 Key Files Reference

### Critical Files

| File | Purpose | Priority |
|------|---------|----------|
| `App.tsx` | Main application | ⭐⭐⭐ |
| `components/os/DesktopManager.tsx` | Desktop environment | ⭐⭐⭐ |
| `components/os/Window.tsx` | Window system | ⭐⭐⭐ |
| `lib/themes.ts` | Theme definitions | ⭐⭐⭐ |
| `lib/apps.ts` | App configurations | ⭐⭐⭐ |
| `backend/index.js` | Backend server | ⭐⭐⭐ |
| `backend/agents/OrchestratorAgent.js` | Agent coordinator | ⭐⭐ |
| `contexts/ThemeContext.tsx` | Theme management | ⭐⭐ |
| `package.json` | Dependencies | ⭐⭐ |
| `vite.config.ts` | Build config | ⭐⭐ |

---

## 📦 Dependencies

### Frontend Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.25.1",
  "framer-motion": "^11.3.2",
  "lucide-react": "^0.546.0",
  "googleapis": "^140.0.1"
}
```

### Backend Dependencies
```json
{
  "express": "^4.19.2",
  "@google-cloud/speech": "^6.4.0",
  "@google-cloud/text-to-speech": "^5.0.0",
  "@google-cloud/translate": "^9.0.0",
  "@google-cloud/vision": "^4.2.0",
  "node-telegram-bot-api": "^0.66.0"
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.3.1",
  "@playwright/test": "^1.45.3",
  "@testing-library/react": "^16.0.0",
  "typescript": "^5.2.2",
  "vite": "^5.3.4",
  "jest": "^29.7.0",
  "eslint": "^8.57.0",
  "tailwindcss": "^3.4.6"
}
```

---

## 🚀 Development Guide

### Setup
```bash
# Clone repository
git clone https://github.com/Moeabdelaziz007/UiAmrikyy.git
cd UiAmrikyy

# Install dependencies
npm install

# Set up environment
# Create .env.local with required API keys

# Start development
npm run dev

# Access at http://localhost:5173
```

### Available Scripts
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:e2e     # Run E2E tests
npm run start-backend # Start backend server
```

### Environment Variables
```bash
# Required for backend
GEMINI_API_KEY=your_gemini_key
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json
TELEGRAM_BOT_TOKEN=your_telegram_token

# Optional
YOUTUBE_API_KEY=your_youtube_key
GOOGLE_MAPS_API_KEY=your_maps_key
```

---

## 🎨 Theme System

### Available Themes
Defined in `lib/themes.ts`:
- **Default** - Modern light theme
- **Dark** - Dark mode
- **Cyberpunk** - Neon cyberpunk style
- **Ocean** - Blue ocean theme
- **Forest** - Green nature theme
- **Sunset** - Warm sunset colors

### Theme Structure
```typescript
interface Theme {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
}
```

---

## 🔍 Finding Things

### Need to find...

**A component?**
→ Check `components/` or `components/os/` or `components/agents/`

**A theme?**
→ Check `lib/themes.ts`

**An app configuration?**
→ Check `lib/apps.ts`

**A hook?**
→ Check `hooks/`

**Backend API?**
→ Check `backend/routes/api.js`

**An agent?**
→ Check `backend/agents/`

**Tests?**
→ Check `e2e/` or `frontend/src/tests/` or `backend/tests/`

---

## 📊 Project Status

- ✅ Desktop OS interface
- ✅ Window management system
- ✅ Multiple AI agents
- ✅ Voice interaction
- ✅ Theme system
- ✅ Basic applications
- 🚧 Backend integration (partial)
- 🚧 Full agent implementation
- 🚧 PWA features
- 🚧 Mobile responsiveness

---

## 🆘 Common Tasks

### Add New Theme
1. Edit `lib/themes.ts`
2. Add theme object to `themes` array
3. Theme will auto-appear in ThemeSelector

### Add New Application
1. Create component in `components/` or `apps/`
2. Add app config to `lib/apps.ts`
3. App will auto-appear in start menu

### Add New Agent
1. Create backend agent in `backend/agents/`
2. Create UI component in `components/agents/`
3. Register in agent orchestrator

### Modify Window Behavior
1. Edit `components/os/Window.tsx`
2. Update window store in `stores/windowStore.ts`

---

## 📞 Contact & Support

**Project**: UiAmrikyy  
**Owner**: Moeabdelaziz007  
**Repository**: https://github.com/Moeabdelaziz007/UiAmrikyy

---

**Last Updated**: October 24, 2025  
**Version**: 0.0.0  
**Status**: 🟡 In Development
