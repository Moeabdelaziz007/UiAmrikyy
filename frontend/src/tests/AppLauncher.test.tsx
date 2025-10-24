import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppLauncher from '../components/AppLauncher'; // Adjust path if needed
import { LanguageContext, TTSContext, NotificationContext } from '../App';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { themes } from '../lib/themes';

// FIX: Import Jest globals explicitly
import { describe, expect, test, jest, beforeEach, afterAll } from '@jest/globals';

// Mock useTheme as it comes from a provider
jest.mock('../contexts/ThemeContext', () => ({
  // FIX: Cast `requireActual` to `any` to resolve "Spread types may only be created from object types" error.
  ...(jest.requireActual('../contexts/ThemeContext') as any),
  useTheme: () => ({ 
    theme: themes[0], 
    setTheme: jest.fn(),
    availableThemes: themes,
  }), 
}));

// A simple wrapper component that provides all necessary contexts
const AllProviders: React.FC<{ children: React.ReactNode; lang: 'en' | 'ar' }> = ({ children, lang }) => {
  const [currentLang, setCurrentLang] = React.useState(lang);
  
  const languageContextValue = React.useMemo(() => ({
    lang: currentLang,
    setLang: setCurrentLang,
  }), [currentLang]);

  const ttsContextValue = React.useMemo(() => ({
    selectedVoice: 'Zephyr', 
    setSelectedVoice: () => {},
    playbackSpeed: 1.0, 
    setPlaybackSpeed: () => {},
  }), []);

  const notificationContextValue = React.useMemo(() => ({
    notificationsEnabled: true, 
    setNotificationsEnabled: () => {},
  }), []);


  return (
    <ThemeProvider>
        <LanguageContext.Provider value={languageContextValue}>
            <NotificationContext.Provider value={notificationContextValue}>
                <TTSContext.Provider value={ttsContextValue}>
                    {children}
                </TTSContext.Provider>
            </NotificationContext.Provider>
        </LanguageContext.Provider>
    </ThemeProvider>
  );
};


describe('AppLauncher', () => {
  const mockOnLaunchApp = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders App Launcher title in English', () => {
    render(
      <AllProviders lang="en">
        <AppLauncher onLaunchApp={mockOnLaunchApp} onClose={mockOnClose} />
      </AllProviders>
    );
    expect(screen.getByText('App Launcher')).toBeInTheDocument();
  });

  test('renders App Launcher title in Arabic', () => {
    render(
      <AllProviders lang="ar">
        <AppLauncher onLaunchApp={mockOnLaunchApp} onClose={mockOnClose} />
      </AllProviders>
    );
    expect(screen.getByText('مشغل التطبيقات')).toBeInTheDocument();
  });

  test('renders all available apps', () => {
    render(
      <AllProviders lang="en">
        <AppLauncher onLaunchApp={mockOnLaunchApp} onClose={mockOnClose} />
      </AllProviders>
    );
    // Check for a few known apps/agents
    expect(screen.getByRole('button', { name: 'Navigator App' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coding Agent App' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'File Manager App' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terminal App' })).toBeInTheDocument();
  });

  test('calls onLaunchApp and onClose when an app card is clicked', () => {
    render(
      <AllProviders lang="en">
        <AppLauncher onLaunchApp={mockOnLaunchApp} onClose={mockOnClose} />
      </AllProviders>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Navigator App' }));
    expect(mockOnLaunchApp).toHaveBeenCalledTimes(1);
    expect(mockOnLaunchApp).toHaveBeenCalledWith('navigator');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <AllProviders lang="en">
        <AppLauncher onLaunchApp={mockOnLaunchApp} onClose={mockOnClose} />
      </AllProviders>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnLaunchApp).not.toHaveBeenCalled();
  });
});