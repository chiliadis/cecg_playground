import { test, expect } from '@playwright/test';

test.describe('Debug Add Customer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Debug Add Customer button step by step', async ({ page }) => {
    console.log('🔍 Starting Add Customer debug test...');

    // 1. Login first
    console.log('Step 1: Logging in...');
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });
    console.log('✅ Login successful');

    // 2. Check if we're on dashboard
    console.log('Step 2: Checking dashboard state...');
    const isDashboardVisible = await page.locator('#dashboard').isVisible();
    console.log(`Dashboard visible: ${isDashboardVisible}`);

    // 3. Look for Add Customer buttons
    console.log('Step 3: Looking for Add Customer buttons...');

    // Find all elements with add-customer action
    const addCustomerButtons = page.locator('[data-action="add-customer"]');
    const buttonCount = await addCustomerButtons.count();
    console.log(`Found ${buttonCount} Add Customer buttons`);

    // List all buttons
    for (let i = 0; i < buttonCount; i++) {
      const button = addCustomerButtons.nth(i);
      const isVisible = await button.isVisible();
      const text = await button.textContent();
      const onclick = await button.getAttribute('onclick');
      console.log(`Button ${i + 1}: visible=${isVisible}, text="${text}", onclick="${onclick}"`);
    }

    // 4. Check modal overlay exists
    console.log('Step 4: Checking modal overlay...');
    const modalOverlay = page.locator('#modal-overlay');
    const modalExists = await modalOverlay.count() > 0;
    const modalVisible = await modalOverlay.isVisible();
    console.log(`Modal overlay exists: ${modalExists}, visible: ${modalVisible}`);

    // 5. Check customer form template exists
    console.log('Step 5: Checking customer form template...');
    const customerFormTemplate = page.locator('#customer-form-template');
    const templateExists = await customerFormTemplate.count() > 0;
    console.log(`Customer form template exists: ${templateExists}`);

    if (templateExists) {
      const templateContent = await customerFormTemplate.innerHTML();
      console.log(`Template content length: ${templateContent.length} characters`);
    }

    // 6. Try clicking the first visible Add Customer button
    console.log('Step 6: Attempting to click Add Customer button...');

    if (buttonCount > 0) {
      // Look for visible button
      let clickableButton = null;
      for (let i = 0; i < buttonCount; i++) {
        const button = addCustomerButtons.nth(i);
        const isVisible = await button.isVisible();
        if (isVisible) {
          clickableButton = button;
          console.log(`Using button ${i + 1} (visible)`);
          break;
        }
      }

      if (clickableButton) {
        // Listen for console errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            console.log('❌ JavaScript Error:', msg.text());
          } else if (msg.type() === 'log') {
            console.log('📝 Console Log:', msg.text());
          }
        });

        // Click the button
        await clickableButton.click();
        console.log('✅ Button clicked');

        // Wait a moment for any response
        await page.waitForTimeout(2000);

        // Check if modal opened
        const modalVisibleAfterClick = await modalOverlay.isVisible();
        console.log(`Modal visible after click: ${modalVisibleAfterClick}`);

        // Check modal content
        const modalContent = page.locator('#modal-content');
        const hasContent = await modalContent.innerHTML() !== '';
        console.log(`Modal has content: ${hasContent}`);

        if (hasContent) {
          const content = await modalContent.innerHTML();
          console.log(`Modal content preview: ${content.substring(0, 200)}...`);
        }

      } else {
        console.log('❌ No visible Add Customer button found');
      }
    } else {
      console.log('❌ No Add Customer buttons found at all');
    }

    // 7. Check for JavaScript errors
    console.log('Step 7: Checking for JavaScript errors...');
    const errors = await page.evaluate(() => {
      return window.console.errors || [];
    });

    if (errors.length > 0) {
      console.log('❌ JavaScript errors found:', errors);
    } else {
      console.log('✅ No JavaScript errors detected');
    }

    console.log('🔍 Add Customer debug test completed');
  });

  test('Test showCustomerForm function directly', async ({ page }) => {
    console.log('🔍 Testing showCustomerForm function directly...');

    // Login first
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Try calling the function directly
    const result = await page.evaluate(() => {
      try {
        if (typeof showCustomerForm === 'function') {
          console.log('showCustomerForm function exists, calling it...');
          showCustomerForm();
          return { success: true, message: 'Function called successfully' };
        } else {
          return { success: false, message: 'showCustomerForm function not found' };
        }
      } catch (error) {
        return { success: false, message: `Error calling function: ${error.message}` };
      }
    });

    console.log('Function call result:', result);

    // Check if modal opened after direct function call
    await page.waitForTimeout(1000);
    const modalVisible = await page.locator('#modal-overlay').isVisible();
    console.log(`Modal visible after direct function call: ${modalVisible}`);
  });
});