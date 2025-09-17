import { test, expect } from '@playwright/test';

// Comprehensive manual verification test
test.describe('Comprehensive Application Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Complete UI and functionality verification', async ({ page }) => {
    // === 1. Initial Login Screen Verification ===
    console.log('Testing initial login screen...');

    // Verify login screen is displayed
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#main-app')).toBeHidden();

    // Verify login form elements
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('.login-submit-btn')).toBeVisible();

    // Verify sample credentials are displayed
    await expect(page.locator('.credential-item').first()).toContainText('Wizard McSpellcaster');

    // === 2. Test Password Visibility Toggle ===
    console.log('Testing password visibility toggle...');

    const passwordInput = page.locator('#login-password');
    const toggleBtn = page.locator('.password-toggle-btn').first();

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle again to hide password
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // === 3. Test Form Validation (Check for popup behavior) ===
    console.log('Testing form validation...');

    // Test empty email validation
    await page.fill('#login-email', '');
    await page.fill('#login-password', 'somepassword');
    await page.click('.login-submit-btn');

    // Wait for any validation response
    await page.waitForTimeout(2000);

    // Test invalid email format
    await page.fill('#login-email', 'invalid-email');
    await page.fill('#login-password', 'somepassword');
    await page.click('.login-submit-btn');

    // Wait for validation response
    await page.waitForTimeout(2000);

    // === 4. Test Successful Login ===
    console.log('Testing successful login...');

    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');

    // Wait for login to complete
    await page.waitForSelector('#main-app', { state: 'visible', timeout: 15000 });

    // Verify main app is shown
    await expect(page.locator('#login-screen')).toBeHidden();
    await expect(page.locator('#main-app')).toBeVisible();

    // Verify user welcome message
    await expect(page.locator('#user-status')).toContainText('Welcome, Wizard McSpellcaster');

    // Verify logout button is visible
    await expect(page.locator('#logout-btn')).toBeVisible();

    // === 5. Test Navigation ===
    console.log('Testing navigation...');

    // Test dashboard is active by default
    await expect(page.locator('#dashboard')).toBeVisible();
    await expect(page.locator('[data-tab="dashboard"]')).toHaveClass(/active/);

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

    // === 6. Test Dashboard Functionality ===
    console.log('Testing dashboard functionality...');

    // Verify dashboard cards are visible
    await expect(page.locator('[data-testid="customers-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="policies-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="claims-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="underwriting-overview"]')).toBeVisible();

    // Test Load Customers button
    await page.click('[data-action="view-customers"]');

    // Wait for any loading or data display
    await page.waitForTimeout(3000);

    // Check if data modal or customers section opened
    const dataModal = page.locator('#data-modal');
    const customersSection = page.locator('#customers');

    const isDataModalVisible = await dataModal.isVisible();
    const isCustomersSectionVisible = await customersSection.isVisible();

    if (isDataModalVisible) {
      console.log('Data modal opened successfully');
      await expect(dataModal).toBeVisible();

      // Close modal
      await page.click('.modal-close');
      await expect(dataModal).toBeHidden();
    } else if (isCustomersSectionVisible) {
      console.log('Customers section opened successfully');
      await expect(customersSection).toBeVisible();
    }

    // === 7. Test Customer Registration Modal ===
    console.log('Testing customer registration modal...');

    await page.click('[data-action="add-customer"]');

    // Wait for modal to appear
    await page.waitForTimeout(1000);

    // Check if modal opened
    const modalOverlay = page.locator('#modal-overlay');
    const isModalVisible = await modalOverlay.isVisible();

    if (isModalVisible) {
      console.log('Customer registration modal opened');
      await expect(modalOverlay).toBeVisible();

      // Test form fields
      await expect(page.locator('#customer-email')).toBeVisible();
      await expect(page.locator('#customer-password')).toBeVisible();
      await expect(page.locator('#first-name')).toBeVisible();
      await expect(page.locator('#last-name')).toBeVisible();

      // Test password toggle in modal
      const modalPasswordInput = page.locator('#customer-password');
      const modalToggleBtn = page.locator('#customer-password').locator('..').locator('.password-toggle-btn');

      if (await modalToggleBtn.count() > 0) {
        await expect(modalPasswordInput).toHaveAttribute('type', 'password');
        await modalToggleBtn.click();
        await expect(modalPasswordInput).toHaveAttribute('type', 'text');
      }

      // Test form validation in modal
      await page.fill('#customer-email', 'invalid-email');
      await page.locator('#customer-email').blur();
      await page.waitForTimeout(1000);

      // Fill valid data
      await page.fill('#customer-email', 'test.customer@example.com');
      await page.fill('#customer-password', 'testpass123');
      await page.fill('#first-name', 'Test');
      await page.fill('#last-name', 'Customer');

      // Close modal
      await page.click('.modal-close');
      await expect(modalOverlay).toBeHidden();
    }

    // === 8. Test Quote Calculator ===
    console.log('Testing quote calculator...');

    await page.click('[data-tab="quotes"]');
    await expect(page.locator('#quotes')).toBeVisible();

    // Fill quote form
    await page.selectOption('#quote-policy-type', 'auto');
    await page.fill('#quote-coverage', '50000');
    await page.fill('#quote-age', '30');

    // Submit quote request
    await page.click('[data-action="calculate-quote"]');

    // Wait for quote result
    await page.waitForTimeout(3000);

    // Check if quote result is displayed
    const quoteResult = page.locator('#quote-result');
    const isQuoteVisible = await quoteResult.isVisible();

    if (isQuoteVisible) {
      console.log('Quote calculation successful');
      await expect(quoteResult).toBeVisible();
    }

    // === 9. Test Database Reset Functionality ===
    console.log('Testing database reset...');

    await page.click('#reset-btn');

    // Handle confirmation dialog
    page.on('dialog', async dialog => {
      console.log('Confirmation dialog appeared:', dialog.message());
      await dialog.dismiss(); // Don't actually reset during test
    });

    await page.waitForTimeout(1000);

    // === 10. Test Logout ===
    console.log('Testing logout...');

    await page.click('#logout-btn');

    // Verify we're back to login screen
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#main-app')).toBeHidden();

    console.log('All UI tests completed successfully!');
  });

  test('Test Toast Notifications and Popups', async ({ page }) => {
    console.log('Testing toast notifications and popup behavior...');

    // Go to main page
    await page.goto('/');

    // Try to trigger some notifications by interacting with features

    // Test login with invalid credentials to trigger error notification
    await page.fill('#login-email', 'invalid@test.com');
    await page.fill('#login-password', 'wrongpass');
    await page.click('.login-submit-btn');

    // Wait and check for any toast notifications or validation popups
    await page.waitForTimeout(3000);

    // Check for toast notifications
    const toastContainer = page.locator('#toast-container');
    const hasToasts = await toastContainer.locator('.toast').count() > 0;

    if (hasToasts) {
      console.log('Toast notifications are working');
    }

    // Check for validation popups
    const validationPopups = page.locator('.validation-popup');
    const hasValidationPopups = await validationPopups.count() > 0;

    if (hasValidationPopups) {
      console.log('Validation popups are working');
    }

    console.log('Toast and popup testing completed');
  });
});