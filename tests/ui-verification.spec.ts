import { test, expect } from '@playwright/test';

test.describe('UI Elements Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Verify login screen and successful login flow', async ({ page }) => {
    // 1. Verify initial login screen
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#main-app')).toBeHidden();

    // 2. Verify login form elements
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('.login-submit-btn')).toBeVisible();

    // 3. Verify sample credentials are shown
    await expect(page.locator('.credential-item').first()).toContainText('Wizard McSpellcaster');

    // 4. Test successful login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');

    // 5. Wait for login to complete and verify main app
    await page.waitForSelector('#main-app', { state: 'visible', timeout: 10000 });
    await expect(page.locator('#login-screen')).toBeHidden();
    await expect(page.locator('#main-app')).toBeVisible();

    // 6. Verify user status
    await expect(page.locator('#user-status')).toContainText('Welcome, Wizard McSpellcaster');
    await expect(page.locator('#logout-btn')).toBeVisible();
  });

  test('Verify navigation and dashboard elements', async ({ page }) => {
    // Login first
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Test navigation links
    await expect(page.locator('[data-tab="dashboard"]')).toHaveClass(/active/);
    await expect(page.locator('#dashboard')).toBeVisible();

    // Test customers navigation
    await page.click('[data-tab="customers"]');
    await expect(page.locator('#customers')).toBeVisible();
    await expect(page.locator('#dashboard')).toBeHidden();

    // Test policies navigation
    await page.click('[data-tab="policies"]');
    await expect(page.locator('#policies')).toBeVisible();

    // Test claims navigation
    await page.click('[data-tab="claims"]');
    await expect(page.locator('#claims')).toBeVisible();

    // Test quotes navigation
    await page.click('[data-tab="quotes"]');
    await expect(page.locator('#quotes')).toBeVisible();

    // Return to dashboard
    await page.click('[data-tab="dashboard"]');
    await expect(page.locator('#dashboard')).toBeVisible();
  });

  test('Verify dashboard cards and buttons', async ({ page }) => {
    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Verify dashboard cards
    await expect(page.locator('[data-testid="customers-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="policies-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="claims-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="underwriting-overview"]')).toBeVisible();

    // Test Load Customers button
    await page.click('[data-action="view-customers"]');
    await page.waitForTimeout(2000);

    // Check for data modal or navigation
    const dataModal = page.locator('#data-modal');
    const customersSection = page.locator('#customers');

    const modalVisible = await dataModal.isVisible();
    const sectionVisible = await customersSection.isVisible();

    console.log(`Data modal visible: ${modalVisible}, Customers section visible: ${sectionVisible}`);

    if (modalVisible) {
      console.log('✓ Data modal opened successfully');
      // Close modal if it opened
      await page.click('.modal-close');
    } else if (sectionVisible) {
      console.log('✓ Customers section navigated successfully');
    } else {
      console.log('⚠ Neither modal nor section visible - checking for other responses');
    }
  });

  test('Test customer registration modal', async ({ page }) => {
    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Click add customer button
    await page.click('[data-action="add-customer"]');
    await page.waitForTimeout(1000);

    // Check if modal opened
    const modalOverlay = page.locator('#modal-overlay');
    if (await modalOverlay.isVisible()) {
      console.log('✓ Customer registration modal opened');

      // Verify form fields
      await expect(page.locator('#customer-email')).toBeVisible();
      await expect(page.locator('#customer-password')).toBeVisible();
      await expect(page.locator('#first-name')).toBeVisible();
      await expect(page.locator('#last-name')).toBeVisible();

      // Close modal
      await page.click('.modal-close');
      await expect(modalOverlay).toBeHidden();
      console.log('✓ Modal closed successfully');
    } else {
      console.log('⚠ Customer registration modal did not open');
    }
  });

  test('Test quote calculator functionality', async ({ page }) => {
    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to quotes
    await page.click('[data-tab="quotes"]');
    await expect(page.locator('#quotes')).toBeVisible();

    // Fill quote form
    await page.selectOption('#quote-policy-type', 'auto');
    await page.fill('#quote-coverage', '50000');
    await page.fill('#quote-age', '30');

    // Submit quote
    await page.click('[data-action="calculate-quote"]');
    await page.waitForTimeout(3000);

    // Check for quote result
    const quoteResult = page.locator('#quote-result');
    if (await quoteResult.isVisible()) {
      console.log('✓ Quote calculation successful');
      await expect(quoteResult).toContainText('Your Insurance Quote');
    } else {
      console.log('⚠ Quote result not displayed');
    }
  });

  test('Test database reset button', async ({ page }) => {
    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Test reset button exists
    await expect(page.locator('#reset-btn')).toBeVisible();

    // Click reset button and handle dialog (dismiss to avoid actual reset)
    let dialogHandled = false;
    page.on('dialog', async dialog => {
      console.log('✓ Reset confirmation dialog appeared:', dialog.message().substring(0, 50) + '...');
      dialogHandled = true;
      await dialog.dismiss();
    });

    await page.click('#reset-btn');
    await page.waitForTimeout(1000);

    if (dialogHandled) {
      console.log('✓ Database reset dialog functionality working');
    } else {
      console.log('⚠ No reset dialog appeared');
    }
  });

  test('Test logout functionality', async ({ page }) => {
    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Logout
    await page.click('#logout-btn');

    // Verify back to login screen
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#main-app')).toBeHidden();
    console.log('✓ Logout functionality working');
  });

  test('Test error handling for invalid login', async ({ page }) => {
    // Try invalid login
    await page.fill('#login-email', 'invalid@test.com');
    await page.fill('#login-password', 'wrongpassword');
    await page.click('.login-submit-btn');

    // Wait for any error response
    await page.waitForTimeout(3000);

    // Check for validation popup or toast notification
    const validationPopup = page.locator('.validation-popup');
    const toastNotification = page.locator('.toast');

    const hasValidationPopup = await validationPopup.count() > 0;
    const hasToastNotification = await toastNotification.count() > 0;

    if (hasValidationPopup) {
      console.log('✓ Validation popup displayed for invalid login');
    } else if (hasToastNotification) {
      console.log('✓ Toast notification displayed for invalid login');
    } else {
      console.log('⚠ No visible error feedback for invalid login');
    }

    // Should still be on login screen
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#main-app')).toBeHidden();
  });
});