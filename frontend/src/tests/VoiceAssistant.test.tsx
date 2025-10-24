import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceAssistant from '../components/os/VoiceAssistant';
import { LanguageContext, TTSContext, NotificationContext } from '../App';
import { ThemeProvider } from '../contexts/ThemeContext';
import { themes } from '../lib/themes';
import useWindowStore from '../stores/windowStore';
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';

// Mock child components and hooks
jest.mock('../components/os/VoiceWaveform', () => () => <div data-testid="voice-waveform"></div>);
jest.mock('../stores/windowStore');

// Mock @google/genai
const mockClose = jest.fn();
const mockSendRealtimeInput = jest.fn();
const mockSendToolResponse = jest.fn();
const mockLiveConnect = jest.fn().mockResolvedValue({
  close: mockClose,
  sendRealtimeInput: mockSendRealtimeInput,
  sendToolResponse: mockSendToolResponse,
});

jest.mock('@google/genai', () => ({
  ...jest.requireActual('@google/genai'),
  GoogleGenAI: jest.fn(() => ({
    live: {
      connect: mockLiveConnect,
    },
  })),
}));

// Mock browser APIs
const mockMediaStream = { getTracks: () => [{ stop: jest.fn() }] };
// FIX: Use Object.defineProperty to mock the read-only mediaDevices property.
Object.defineProperty(window.navigator, 'mediaDevices', {
  writable: true,
  value: {
    ...window.navigator.mediaDevices,
    getUserMedia: jest.fn().mockResolvedValue(mockMediaStream),
  },
});

// Mock AudioContext
const mockScriptProcessor = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  onaudioprocess: null,
};
(window as any).AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
  })),
  createScriptProcessor: jest.fn(() => mockScriptProcessor),
  destination: {},
  close: jest.fn(),
  state: 'running',
})) as any;


const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <LanguageContext.Provider value={{ lang: 'en', setLang: jest.fn() }}>
      <NotificationContext.Provider value={{ notificationsEnabled: true, setNotificationsEnabled: jest.fn() }}>
        <TTSContext.Provider value={{ selectedVoice: 'Zephyr', setSelectedVoice: jest.fn(), playbackSpeed: 1, setPlaybackSpeed: jest.fn() }}>
          {children}
        </TTSContext.Provider>
      </NotificationContext.Provider>
    </LanguageContext.Provider>
  </ThemeProvider>
);

describe('VoiceAssistant', () => {
  const mockOpenWindow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useWindowStore as unknown as jest.Mock).mockReturnValue({
      openWindow: mockOpenWindow,
    });
  });
  
  afterEach(() => {
    // Manually reset the state of the live connect mock if needed between tests
    mockLiveConnect.mockClear();
  });

  test('renders in idle state initially', () => {
    render(
      <AllProviders>
        <VoiceAssistant />
      </AllProviders>
    );
    // There should be a button to click, probably with "Mic" icon
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('clicking mic button starts a conversation and enters listening state', async () => {
    render(
      <AllProviders>
        <VoiceAssistant />
      </AllProviders>
    );
    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    // Shows connecting, then listening
    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
    
    // The onopen callback should be called
    const connectOptions = mockLiveConnect.mock.calls[0][0];
    connectOptions.callbacks.onopen();

    await waitFor(() => {
      expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
      // Since isExpanded is false, we can't see the transcript directly, but we can check for state change via icon etc.
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
  });
  
  test('clicking mic button while listening stops the conversation', async () => {
    render(
      <AllProviders>
        <VoiceAssistant />
      </AllProviders>
    );
    const micButton = screen.getByRole('button');
    
    // Start session
    fireEvent.click(micButton);
    const connectOptions = mockLiveConnect.mock.calls[0][0];
    connectOptions.callbacks.onopen();
    await waitFor(() => expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled());

    // Stop session
    fireEvent.click(micButton);
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockMediaStream.getTracks()[0].stop).toHaveBeenCalled();
  });

});