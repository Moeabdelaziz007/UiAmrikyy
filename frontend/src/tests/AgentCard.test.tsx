import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentCard from '../components/AgentCard';
import { LanguageContext, TTSContext, NotificationContext } from '../App';
import { ThemeContext, ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { themes } from '../lib/themes';
import { CpuIcon } from '../components/IconComponents';

// FIX: Import Jest globals explicitly
import { describe, expect, test, jest, beforeEach, afterAll } from '@jest/globals';

// Mock useTheme as it comes from a provider
jest.mock('../contexts/ThemeContext', () => ({
  // FIX: Cast `requireActual` to `any` to resolve "Spread types may only be created from object types" error.
  ...(jest.requireActual('../contexts/ThemeContext') as any),
  useTheme: () => ({ 
    theme: themes[0], // Provide a default theme
    setTheme: () => {},
    availableThemes: themes,
  }), 
}));

// A simple wrapper component that provides all necessary contexts
const AllProviders: React.FC<{ children: React.ReactNode; lang: 'en' | 'ar' }> = ({ children, lang }) => {
  const [currentLang, setCurrentLang] = React.useState(lang);
  const themeContextValue = React.useMemo(() => ({
    theme: themes[0], // Provide a default theme
    setTheme: () => {}, // Use no-op function instead of jest.fn()
    availableThemes: themes,
  }), []);

  const languageContextValue = React.useMemo(() => ({
    lang: currentLang,
    setLang: setCurrentLang,
  }), [currentLang]);

  const ttsContextValue = React.useMemo(() => ({
    selectedVoice: 'Zephyr', 
    setSelectedVoice: () => {}, // Use no-op function instead of jest.fn()
    playbackSpeed: 1.0, 
    setPlaybackSpeed: () => {}, // Use no-op function instead of jest.fn()
  }), []);

  const notificationContextValue = React.useMemo(() => ({
    notificationsEnabled: true, 
    setNotificationsEnabled: () => {}, // Use no-op function instead of jest.fn()
  }), []);


  return (
    <ThemeProvider> {/* Wrap with actual ThemeProvider */}
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


describe('AgentCard', () => {
  const mockApp = { // Changed to mockApp instead of mockAgent
    id: 'test-app',
    name: { en: 'Test App', ar: 'تطبيق الاختبار' },
    description: { en: 'A test description', ar: 'وصف اختباري' },
    icon: CpuIcon,
    color: 'blue',
    component: () => <div />
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    // Mock the useTheme hook to return a consistent value
    (useTheme as jest.Mock).mockReturnValue({
      theme: themes[0], // A default light theme
      setTheme: jest.fn(),
      availableThemes: themes,
    });
  });

  test('renders app name and description in English', () => { // Changed 'agent' to 'app'
    render(
      <AllProviders lang="en">
        <AgentCard app={mockApp} isActive={false} onClick={mockOnClick} />
      </AllProviders>
    );

    expect(screen.getByRole('button', { name: 'Test App App' })).toBeInTheDocument(); // Updated aria-label
    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByText('A test description')).toBeInTheDocument();
  });

  test('renders app name and description in Arabic', () => { // Changed 'agent' to 'app'
    render(
      <AllProviders lang="ar">
        <AgentCard app={mockApp} isActive={false} onClick={mockOnClick} />
      </AllProviders>
    );

    expect(screen.getByRole('button', { name: 'تطبيق الاختبار التطبيق' })).toBeInTheDocument(); // Updated aria-label
    expect(screen.getByText('تطبيق الاختبار')).toBeInTheDocument();
    expect(screen.getByText('وصف اختباري')).toBeInTheDocument();
  });

  test('applies active styles when isActive is true', () => {
    render(
      <AllProviders lang="en">
        <AgentCard app={mockApp} isActive={true} onClick={mockOnClick} />
      </AllProviders>
    );

    const button = screen.getByRole('button', { name: 'Test App App' }); // Updated aria-label
    expect(button).toHaveClass('scale-105');
    // Check for specific background color or text color based on active state if needed
  });

  test('calls onClick handler when button is clicked', () => {
    render(
      <AllProviders lang="en">
        <AgentCard app={mockApp} isActive={false} onClick={mockOnClick} />
      </AllProviders>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Test App App' })); // Updated aria-label
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith('test-app');
  });
});