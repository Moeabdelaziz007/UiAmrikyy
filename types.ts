// FIX: Import React to resolve 'Cannot find namespace' errors.
import React from 'react';

// New type for Task History entries
export interface TaskHistoryEntry {
  id: string;
  agentId: string;
  agentName: string;
  taskType: string;
  taskInput: string | Record<string, any>; // Can be a string or a more complex object
  taskOutput: string | Record<string, any>; // Can be a string or a more complex object
  timestamp: string;
  status: 'success' | 'error';
  errorMessage?: string;
  workflowStep?: number; // Optional: for multi-step workflows
}

// New type for Guardian Agent's analysis response
export interface GuardianAnalysis {
  diagnosis: string;
  suggestion: string;
  retryInput?: Record<string, any>;
}


// New type for application window data
export interface WindowData {
  id: string;
  appId: string;
  title: string;
  // FIX: Update icon type to accept a color prop, resolving type error in Window.tsx
  icon: React.FC<{ className?: string; color?: string; }>;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  // FIX: Unify window state into a single 'state' property.
  state: 'normal' | 'minimized' | 'maximized';
  initialLaunch: boolean; // To allow repositioning on first launch
}

// Redefined type for OS apps (includes agents and system apps)
export interface AppDefinition {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  // FIX: Update icon type to accept a color prop, resolving type error in Window.tsx
  icon: React.FC<{ className?: string; color?: string; }>;
  color: string; // Tailwind color class suffix
  component: React.ComponentType<any>; // Component to render inside the window
  isSystemApp?: boolean; // True for apps like File Manager, Terminal
}

// New type for agent specific configuration
export interface AgentConfig {
  apiKey?: string;
  defaultParam?: string; // Generic example parameter
  // Add more configurable parameters as needed
}