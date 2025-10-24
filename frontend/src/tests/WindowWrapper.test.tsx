import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WindowWrapper from '../components/os/Window';
import { LanguageContext, TTSContext, NotificationContext } from '../App';
import { ThemeProvider } from '../contexts/ThemeContext';
import { themes } from '../lib/themes';
import { CpuIcon } from '../components/IconComponents';
import { WindowData } from '../types';
import { describe, expect, test, jest, beforeEach } from '@jest/globals';

jest.mock('../contexts/ThemeContext', () => ({
  ...(jest.requireActual('../contexts/ThemeContext') as any),
  useTheme: () => ({
    theme: themes[0],
    setTheme: jest.fn(),
    availableThemes: themes,
  }),
}));

jest.mock('react-rnd', () => {
    const Rnd = ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => {
      // Remove props that are not valid for a div
      const { onDragStop, onResizeStop, size, position, ...divProps } = props;
      return <div data-testid="react-rnd" {...divProps}>{children}</div>;
    };
    return { Rnd };
});


jest.mock('framer-motion', () => {
  const ActualReact = React;
  const actual = jest.requireActual('framer-motion');
  const mockMotionComponent = (tag: string) => ActualReact.forwardRef((props: any, ref: any) => {
    const {
      initial, animate, exit, variants, transition, onDragEnd, drag, 
      dragConstraints, dragMomentum, whileHover, whileTap, ...rest
    } = props;
    return ActualReact.createElement(tag, { ref, ...rest }, props.children);
  });

  return {
    ...(actual as any),
    motion: {
      ...(actual as any).motion,
      div: mockMotionComponent('div'),
      header: mockMotionComponent('header'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

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

describe('WindowWrapper', () => {
    const mockWindowData: WindowData = {
        id: 'test-window',
        appId: 'test-app',
        title: 'Test Window',
        icon: CpuIcon,
        zIndex: 100,
        position: { x: 100, y: 100 },
        size: { width: 500, height: 400 },
        state: 'normal',
        initialLaunch: true,
    };

    const mockOnClose = jest.fn();
    const mockOnMinimize = jest.fn();
    const mockOnMaximize = jest.fn();
    const mockOnBringToFront = jest.fn();
    const mockOnUpdatePosition = jest.fn();
    const mockOnUpdateSize = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Mocking appComponentMap
    // FIX: Cast `jest.requireActual` to `any` to resolve "Spread types may only be created from object types" error for the mock module.
    jest.mock('../lib/apps', () => ({
        ...(jest.requireActual('../lib/apps') as any),
        appComponentMap: {
            'test-app': () => <div>Window Content</div>
        }
    }));


    test('renders window title and children', () => {
        render(
            <AllProviders lang="en">
                <WindowWrapper windowData={mockWindowData} onClose={mockOnClose} onMinimize={mockOnMinimize} onMaximize={mockOnMaximize} onFocus={mockOnBringToFront} onDragStop={mockOnUpdatePosition} onResizeStop={mockOnUpdateSize} />
            </AllProviders>
        );

        expect(screen.getByText('Test Window')).toBeInTheDocument();
        expect(screen.getByText('Window Content')).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
        render(
            <AllProviders lang="en">
                <WindowWrapper windowData={mockWindowData} onClose={mockOnClose} onMinimize={mockOnMinimize} onMaximize={mockOnMaximize} onFocus={mockOnBringToFront} onDragStop={mockOnUpdatePosition} onResizeStop={mockOnUpdateSize} />
            </AllProviders>
        );

        fireEvent.click(screen.getByLabelText('Close'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onMinimize when minimize button is clicked', () => {
        render(
            <AllProviders lang="en">
                <WindowWrapper windowData={mockWindowData} onClose={mockOnClose} onMinimize={mockOnMinimize} onMaximize={mockOnMaximize} onFocus={mockOnBringToFront} onDragStop={mockOnUpdatePosition} onResizeStop={mockOnUpdateSize} />
            </AllProviders>
        );

        fireEvent.click(screen.getByLabelText('Minimize'));
        expect(mockOnMinimize).toHaveBeenCalledTimes(1);
    });

    test('calls onMaximize when maximize button is clicked', () => {
        render(
            <AllProviders lang="en">
                <WindowWrapper windowData={mockWindowData} onClose={mockOnClose} onMinimize={mockOnMinimize} onMaximize={mockOnMaximize} onFocus={mockOnBringToFront} onDragStop={mockOnUpdatePosition} onResizeStop={mockOnUpdateSize} />
            </AllProviders>
        );

        fireEvent.click(screen.getByLabelText('Maximize'));
        expect(mockOnMaximize).toHaveBeenCalledTimes(1);
    });

    test('calls onBringToFront on mouse down', () => {
        render(
            <AllProviders lang="en">
                <WindowWrapper windowData={mockWindowData} onClose={mockOnClose} onMinimize={mockOnMinimize} onMaximize={mockOnMaximize} onFocus={mockOnBringToFront} onDragStop={mockOnUpdatePosition} onResizeStop={mockOnUpdateSize} />
            </AllProviders>
        );
        fireEvent.mouseDown(screen.getByTestId('react-rnd'));
        expect(mockOnBringToFront).toHaveBeenCalledTimes(1);
    });
});