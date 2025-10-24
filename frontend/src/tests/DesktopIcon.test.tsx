import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DesktopIcon from '../components/os/DesktopIcon';
import { AppDefinition } from '../types';
import { CpuIcon } from '../components/IconComponents';
import { describe, expect, test, jest } from '@jest/globals';

describe('DesktopIcon', () => {
  const mockApp: AppDefinition = {
    id: 'test-app',
    name: { en: 'Test App', ar: 'تطبيق الاختبار' },
    description: { en: 'A test description', ar: 'وصف اختباري' },
    icon: CpuIcon,
    color: 'blue',
    component: () => <div>Test Component</div>
  };

  const mockOnLaunch = jest.fn();

  test('renders the app name in English', () => {
    render(<DesktopIcon app={mockApp} onLaunch={mockOnLaunch} lang="en" />);
    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByTitle('Test App')).toBeInTheDocument();
  });

  test('renders the app name in Arabic', () => {
    render(<DesktopIcon app={mockApp} onLaunch={mockOnLaunch} lang="ar" />);
    expect(screen.getByText('تطبيق الاختبار')).toBeInTheDocument();
    expect(screen.getByTitle('تطبيق الاختبار')).toBeInTheDocument();
  });

  test('calls onLaunch with the app id on double-click', () => {
    render(<DesktopIcon app={mockApp} onLaunch={mockOnLaunch} lang="en" />);
    const iconElement = screen.getByText('Test App').closest('div.group');
    expect(iconElement).toBeInTheDocument();
    if(iconElement) {
        fireEvent.doubleClick(iconElement);
        expect(mockOnLaunch).toHaveBeenCalledTimes(1);
        expect(mockOnLaunch).toHaveBeenCalledWith('test-app');
    }
  });

  test('does not call onLaunch on a single click', () => {
    render(<DesktopIcon app={mockApp} onLaunch={mockOnLaunch} lang="en" />);
    const iconElement = screen.getByText('Test App').closest('div.group');
    if(iconElement) {
        fireEvent.click(iconElement);
        expect(mockOnLaunch).not.toHaveBeenCalled();
    }
  });
});