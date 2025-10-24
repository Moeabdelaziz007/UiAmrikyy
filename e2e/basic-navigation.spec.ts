// FIX: Corrected import for `test` and `expect`. They are named exports.
import { test, expect } from '@playwright/test';

test.describe('Basic Navigation and Agent Interaction', () => {
  test('should login, open App Launcher, launch Navigator agent, and verify task history', async ({ page }) => {
    await page.goto('/');

    // 1. Verify login page elements
    await expect(page.getByText('Login to your AI OS')).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();

    // 2. Perform login as guest
    await page.getByRole('button', { name: 'Login as Guest' }).click();
    await expect(page.getByText('Amrikyy QuantumOS')).toBeVisible();

    // 3. Open App Launcher via Taskbar Start button
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByText('App Launcher')).toBeVisible();

    // 4. Launch Navigator Agent
    await page.getByRole('button', { name: 'Navigator App' }).click();
    
    // Check if the App Launcher closed
    await expect(page.getByText('App Launcher')).not.toBeVisible();

    // Check if Navigator window is visible by its title in the header
    const navigatorWindow = page.locator('[aria-label="Navigator"]');
    await expect(navigatorWindow.getByText('Navigator', { exact: true })).toBeVisible();

    // 5. Interact with Navigator Agent (e.g., Get Directions)
    const originInput = page.getByPlaceholder('Origin (e.g., Cairo)');
    const destinationInput = page.getByPlaceholder('Destination (e.g., Alexandria)');
    const getDirectionsButton = page.getByRole('button', { name: 'Get Directions' });

    await originInput.fill('Mock Origin');
    await destinationInput.fill('Mock Destination');
    await getDirectionsButton.click();

    // 6. Verify loading state
    await expect(page.getByText('AI is processing...')).toBeVisible();
    await expect(page.getByText('AI is processing...')).not.toBeVisible({timeout: 10000}); // Wait for processing to complete

    // 7. Check for result output (API call with mock data will fail, so we expect an error message)
    await expect(page.getByText('Error: Failed to get directions from Google Maps API.')).toBeVisible();

    // 8. Close Navigator Agent window
    await navigatorWindow.getByLabel('Close').click();
    await expect(navigatorWindow).not.toBeVisible();
  });

  test('should open Terminal app and execute a command', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Login as Guest' }).click();
    
    // Open App Launcher
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByText('App Launcher')).toBeVisible();

    // Launch Terminal App
    await page.getByRole('button', { name: 'Terminal App' }).click();
    await expect(page.getByText('App Launcher')).not.toBeVisible();
    const terminalWindow = page.locator('[aria-label="Terminal"]');
    await expect(terminalWindow.getByText('Terminal', { exact: true })).toBeVisible();

    // Type a command and press Enter
    const commandInput = page.getByPlaceholder('Enter command...');
    await commandInput.fill('echo Hello World');
    await page.getByLabel('Execute command').click();

    // Verify command output
    await expect(page.getByText('> echo Hello World')).toBeVisible();
    await expect(page.getByText('Hello World')).toBeVisible();

    // Type another command
    await commandInput.fill('help');
    await page.getByLabel('Execute command').click();
    await expect(page.getByText('> help')).toBeVisible();
    await expect(page.getByText('Available commands: help, ls, pwd, echo [message], clear')).toBeVisible();

    // Close Terminal window
    await terminalWindow.getByLabel('Close').click();
    await expect(terminalWindow).not.toBeVisible();
  });
});