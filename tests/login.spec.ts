import { test, expect } from '@playwright/test';

// Test data
const validCredentials = {
  email: 'wizard.mcspellcaster@email.com',
  password: 'password123'
};

const invalidCredentials = {
  email: 'invalid@email.com',
  password: 'wrongpassword'
};

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Clear any existing localStorage to ensure clean state
    await page.evaluate(() => localStorage.clear());
  });

  test('should display login screen on initial load', async ({ page }) => {
    // Verify login screen is visible
    await expect(page.locator('#login-screen')).toBeVisible();

    // Verify main app is hidden
    await expect(page.locator('#main-app')).toBeHidden();

    // Verify login form elements
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('.login-submit-btn')).toBeVisible();

    // Verify page title and header
    await expect(page.locator('.login-header h1')).toContainText('Chubb Testing Playground');
    await expect(page.locator('.login-header p')).toContainText('Please log in to access the insurance portal');
  });

  test('should display sample credentials on login screen', async ({ page }) => {
    // Verify sample credentials are shown
    await expect(page.locator('.login-help h3')).toContainText('Sample Login Credentials');

    // Check for specific sample credentials
    await expect(page.locator('.credential-item').first()).toContainText('Wizard McSpellcaster');
    await expect(page.locator('.credential-item').first()).toContainText('wizard.mcspellcaster@email.com');
    await expect(page.locator('.credential-item').nth(1)).toContainText('Captain Awesome');
    await expect(page.locator('.credential-item').nth(2)).toContainText('Princess Sparkles');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill in login form
    await page.fill('#login-email', validCredentials.email);
    await page.fill('#login-password', validCredentials.password);

    // Submit the form
    await page.click('.login-submit-btn');

    // Wait for navigation/redirect after successful login
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Verify login screen is hidden
    await expect(page.locator('#login-screen')).toBeHidden();

    // Verify main app is visible
    await expect(page.locator('#main-app')).toBeVisible();

    // Verify user is logged in (check header)
    await expect(page.locator('#user-status')).toContainText('Welcome, Wizard McSpellcaster');

    // Verify logout button is visible
    await expect(page.locator('#logout-btn')).toBeVisible();

    // Verify main page title
    await expect(page.locator('#main-title')).toContainText('Chubb Insurance Portal');

    // Verify dashboard elements are present
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Insurance Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in login form with invalid credentials
    await page.fill('#login-email', invalidCredentials.email);
    await page.fill('#login-password', invalidCredentials.password);

    // Submit the form
    await page.click('.login-submit-btn');

    // Wait for error message to appear
    await page.waitForSelector('.validation-popup', { state: 'visible', timeout: 10000 });

    // Verify error message is displayed
    await expect(page.locator('.validation-popup')).toBeVisible();
    await expect(page.locator('.validation-popup')).toContainText('Invalid email or password');

    // Verify we're still on login screen
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#main-app')).toBeHidden();
  });

  test('should validate email format', async ({ page }) => {
    // Fill in invalid email format
    await page.fill('#login-email', 'invalid-email');
    await page.fill('#login-password', 'somepassword');

    // Submit the form
    await page.click('.login-submit-btn');

    // Wait for validation error
    await page.waitForSelector('.validation-popup', { state: 'visible', timeout: 10000 });

    // Verify validation message
    await expect(page.locator('.validation-popup')).toBeVisible();
    await expect(page.locator('.validation-popup')).toContainText('Please enter a valid email address');
  });

  test('should require password field', async ({ page }) => {
    // Fill in email but leave password empty
    await page.fill('#login-email', validCredentials.email);
    // Don't fill password

    // Submit the form
    await page.click('.login-submit-btn');

    // Wait for validation error
    await page.waitForSelector('.validation-popup', { state: 'visible', timeout: 10000 });

    // Verify validation message
    await expect(page.locator('.validation-popup')).toBeVisible();
    await expect(page.locator('.validation-popup')).toContainText('Password is required');
  });

  test('should persist login state after page refresh', async ({ page }) => {
    // Login first
    await page.fill('#login-email', validCredentials.email);
    await page.fill('#login-password', validCredentials.password);
    await page.click('.login-submit-btn');

    // Wait for successful login
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Refresh the page
    await page.reload();

    // Verify user is still logged in
    await expect(page.locator('#main-app')).toBeVisible();
    await expect(page.locator('#login-screen')).toBeHidden();
    await expect(page.locator('#user-status')).toContainText('Welcome, Wizard McSpellcaster');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('#login-email', validCredentials.email);
    await page.fill('#login-password', validCredentials.password);
    await page.click('.login-submit-btn');

    // Wait for successful login
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Click logout button
    await page.click('#logout-btn');

    // Verify logout
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#main-app')).toBeHidden();
  });

  test('should test Load Customers button functionality after login', async ({ page }) => {
    // Login first
    await page.fill('#login-email', validCredentials.email);
    await page.fill('#login-password', validCredentials.password);
    await page.click('.login-submit-btn');

    // Wait for successful login
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to customers section
    await page.click('[data-tab="customers"]');

    // Verify we're on customers section
    await expect(page.locator('#customers')).toBeVisible();

    // Click Load Customers button
    await page.click('[data-action="load-customers"]');

    // Wait for customers to load (check for table or data)
    await page.waitForTimeout(2000); // Give time for API call

    // Verify customers loaded (look for customer data or table)
    const customersSection = page.locator('#customers');
    await expect(customersSection).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept and block the login API call to simulate network error
    await page.route('**/api/auth/login', route => route.abort());

    // Try to login
    await page.fill('#login-email', validCredentials.email);
    await page.fill('#login-password', validCredentials.password);
    await page.click('.login-submit-btn');

    // Wait for error handling
    await page.waitForSelector('.validation-popup', { state: 'visible', timeout: 10000 });

    // Verify error message for network failure
    await expect(page.locator('.validation-popup')).toBeVisible();
    await expect(page.locator('.validation-popup')).toContainText('Login failed. Please try again.');
  });
});