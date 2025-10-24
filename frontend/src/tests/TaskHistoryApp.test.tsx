import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskHistoryApp from '../../components/apps/TaskHistoryApp';
import { LanguageContext } from '../../App';
import { ThemeProvider } from '../../contexts/ThemeContext';
import useTaskHistoryStore from '../../stores/taskHistoryStore';
import { TaskHistoryEntry } from '../../types';
// FIX: Import Jest globals to resolve "Cannot find name" errors.
import { describe, expect, test, jest, beforeEach } from '@jest/globals';

// Mock the theme context
jest.mock('../../contexts/ThemeContext', () => ({
  ...(jest.requireActual('../../contexts/ThemeContext')),
  useTheme: () => ({
    theme: {
      colors: {
        background: '#fff', text: '#000', surface: '#eee', border: '#ddd',
        primary: '#007bff', success: '#28a745', error: '#dc3545',
        textSecondary: '#6c757d',
      },
    },
  }),
}));

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <LanguageContext.Provider value={{ lang: 'en', setLang: jest.fn() }}>
      {children}
    </LanguageContext.Provider>
  </ThemeProvider>
);

const mockHistory: TaskHistoryEntry[] = [
  {
    id: '1', agentId: 'test', agentName: 'Test Agent', taskType: 'Run Test',
    taskInput: { query: 'first' }, taskOutput: 'First result',
    timestamp: new Date().toISOString(), status: 'success'
  },
  {
    id: '2', agentId: 'research', agentName: 'Research Agent', taskType: 'Web Search',
    taskInput: { query: 'second' }, taskOutput: 'Second result',
    timestamp: new Date().toISOString(), status: 'error', errorMessage: 'API failed'
  },
];

describe('TaskHistoryApp', () => {

  beforeEach(() => {
    // Reset store before each test
    useTaskHistoryStore.setState({ history: [] });
  });

  test('shows "No tasks" message when history is empty', () => {
    render(
      <AllProviders>
        <TaskHistoryApp />
      </AllProviders>
    );
    expect(screen.getByText('No tasks executed yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear History/i })).toBeDisabled();
  });

  test('renders task entries from the store', () => {
    useTaskHistoryStore.setState({ history: mockHistory });
    render(
      <AllProviders>
        <TaskHistoryApp />
      </AllProviders>
    );

    expect(screen.getByText(/Test Agent: Run Test/i)).toBeInTheDocument();
    expect(screen.getByText(/Research Agent: Web Search/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear History/i })).toBeEnabled();
  });

  test('clears history when clear button is clicked', () => {
    const { clearHistory } = useTaskHistoryStore.getState();
    const clearHistorySpy = jest.spyOn(useTaskHistoryStore.getState(), 'clearHistory');
    useTaskHistoryStore.setState({ history: mockHistory });

    render(
      <AllProviders>
        <TaskHistoryApp />
      </AllProviders>
    );

    fireEvent.click(screen.getByRole('button', { name: /Clear History/i }));
    expect(clearHistorySpy).toHaveBeenCalledTimes(1);
    clearHistorySpy.mockRestore();
  });

  test('filters tasks based on search query', () => {
    useTaskHistoryStore.setState({ history: mockHistory });
    render(
      <AllProviders>
        <TaskHistoryApp />
      </AllProviders>
    );

    const searchInput = screen.getByPlaceholderText(/Search history/i);
    fireEvent.change(searchInput, { target: { value: 'Research' } });

    expect(screen.queryByText(/Test Agent: Run Test/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Research Agent: Web Search/i)).toBeInTheDocument();
  });

  test('expands and collapses a task entry on click', async () => {
    useTaskHistoryStore.setState({ history: [mockHistory[0]] });
    render(
      <AllProviders>
        <TaskHistoryApp />
      </AllProviders>
    );

    const taskEntry = screen.getByText(/Test Agent: Run Test/i);

    // Initially, details are hidden
    expect(screen.queryByText('Input:')).not.toBeInTheDocument();

    // Expand
    fireEvent.click(taskEntry);
    await waitFor(() => {
      expect(screen.getByText('Input:')).toBeInTheDocument();
      expect(screen.getByText('Output:')).toBeInTheDocument();
      // check for prettified JSON content
      expect(screen.getByText(/"query": "first"/)).toBeInTheDocument();
    });

    // Collapse
    fireEvent.click(taskEntry);
    await waitFor(() => {
      expect(screen.queryByText('Input:')).not.toBeInTheDocument();
    });
  });

  test('shows error message on expanded error entry', async () => {
     useTaskHistoryStore.setState({ history: [mockHistory[1]] });
     render(
      <AllProviders>
        <TaskHistoryApp />
      </AllProviders>
    );

    const errorEntry = screen.getByText(/Research Agent: Web Search/i);
    fireEvent.click(errorEntry);

    await waitFor(() => {
        expect(screen.getByText('Error Message:')).toBeInTheDocument();
        expect(screen.getByText('API failed')).toBeInTheDocument();
    });
  });
});
