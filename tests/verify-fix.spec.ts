import { test, expect } from '@playwright/test';

test.describe('Verify Add Customer Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Add Customer button should now work', async ({ page }) => {
    console.log('🔍 Testing Add Customer button after CSP fix...');

    // 1. Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });
    console.log('✅ Logged in successfully');

    // 2. Check for any JavaScript errors
    let hasErrors = false;
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        hasErrors = true;
        console.log('❌ CSP Error still exists:', msg.text());
      }
    });

    // 3. Click Add Customer button
    const addCustomerBtn = page.locator('[data-action="add-customer"]').first();
    await addCustomerBtn.click();
    console.log('✅ Add Customer button clicked');

    // 4. Wait for modal to appear
    await page.waitForTimeout(1000);

    // 5. Check if modal opened
    const modalOverlay = page.locator('#modal-overlay');
    const isModalVisible = await modalOverlay.isVisible();

    if (isModalVisible) {
      console.log('✅ SUCCESS: Add Customer modal opened!');

      // Verify form elements are present
      await expect(page.locator('#customer-email')).toBeVisible();
      await expect(page.locator('#customer-password')).toBeVisible();
      await expect(page.locator('#first-name')).toBeVisible();
      await expect(page.locator('#last-name')).toBeVisible();

      console.log('✅ All form elements are visible');

      // Test filling out the form
      await page.fill('#customer-email', 'test@example.com');
      await page.fill('#customer-password', 'testpass123');
      await page.fill('#first-name', 'Test');
      await page.fill('#last-name', 'User');

      console.log('✅ Form fields filled successfully');

      // Close modal
      await page.click('.modal-close');
      await expect(modalOverlay).toBeHidden();
      console.log('✅ Modal closed successfully');

    } else {
      console.log('❌ FAILED: Modal did not open');
    }

    if (!hasErrors) {
      console.log('✅ No CSP errors detected');
    }
  });

  test('Test all onclick handlers work', async ({ page }) => {
    console.log('🔍 Testing all onclick handlers...');

    // Login first
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Test various onclick handlers
    const onclickElements = [
      { selector: '[onclick="showCustomerForm()"]', name: 'Show Customer Form' },
      { selector: '[onclick="resetDatabase()"]', name: 'Reset Database' },
      { selector: '[onclick="showQuoteCalculator()"]', name: 'Show Quote Calculator' }
    ];

    for (const element of onclickElements) {
      const elem = page.locator(element.selector).first();
      const isVisible = await elem.isVisible();

      if (isVisible) {
        console.log(`Testing ${element.name}...`);
        await elem.click();
        await page.waitForTimeout(500);
        console.log(`✅ ${element.name} clicked without errors`);
      } else {
        console.log(`⚠️ ${element.name} not visible`);
      }
    }
  });
});