import { test, expect } from '@playwright/test';

test.describe('Modal Viewport and Sizing Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Test modal rendering at various resolutions', async ({ page }) => {
    const resolutions = [
      { width: 1920, height: 1080, name: '1080p' },
      { width: 1366, height: 768, name: '1366x768 (most common)' },
      { width: 1280, height: 720, name: '720p' },
      { width: 1024, height: 768, name: '1024x768' }
    ];

    // Login first
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    for (const resolution of resolutions) {
      console.log(`\n🔍 Testing ${resolution.name} (${resolution.width}x${resolution.height})`);

      // Set viewport
      await page.setViewportSize({ width: resolution.width, height: resolution.height });
      await page.waitForTimeout(500);

      // Open Add Customer modal
      await page.click('[data-action="add-customer"]');
      await page.waitForTimeout(1000);

      // Check if modal is visible and fits in viewport
      const modalOverlay = page.locator('#modal-overlay');
      const modalContainer = page.locator('.modal-container');

      if (await modalOverlay.isVisible()) {
        // Get modal dimensions
        const modalBox = await modalContainer.boundingBox();
        if (modalBox) {
          console.log(`  Modal dimensions: ${modalBox.width}x${modalBox.height}`);
          console.log(`  Modal position: top=${modalBox.y}, left=${modalBox.x}`);

          // Check if modal fits within viewport
          const fitsHorizontally = modalBox.x >= 0 && (modalBox.x + modalBox.width) <= resolution.width;
          const fitsVertically = modalBox.y >= 0 && (modalBox.y + modalBox.height) <= resolution.height;

          console.log(`  Fits horizontally: ${fitsHorizontally}`);
          console.log(`  Fits vertically: ${fitsVertically}`);

          // Check for scrollbars
          const hasVerticalScrollbar = await modalContainer.evaluate(element =>
            element.scrollHeight > element.clientHeight
          );
          const hasHorizontalScrollbar = await modalContainer.evaluate(element =>
            element.scrollWidth > element.clientWidth
          );

          console.log(`  Has vertical scrollbar: ${hasVerticalScrollbar}`);
          console.log(`  Has horizontal scrollbar: ${hasHorizontalScrollbar}`);

          // Check if all form fields are visible without scrolling
          const formFields = [
            '#customer-email',
            '#customer-password',
            '#first-name',
            '#last-name',
            '#date-of-birth',
            '#phone'
          ];

          let allFieldsVisible = true;
          for (const field of formFields) {
            const fieldLocator = page.locator(field);
            if (await fieldLocator.count() > 0) {
              const isVisible = await fieldLocator.isVisible();
              if (!isVisible) {
                allFieldsVisible = false;
                console.log(`  ❌ Field ${field} not visible`);
              }
            }
          }

          if (allFieldsVisible) {
            console.log(`  ✅ All form fields visible`);
          }

          // Check submit button visibility
          const submitBtn = page.locator('button[type="submit"]');
          const submitVisible = await submitBtn.isVisible();
          console.log(`  Submit button visible: ${submitVisible}`);

          if (!fitsVertically && hasVerticalScrollbar) {
            console.log(`  ⚠️ Modal requires scrolling at ${resolution.name}`);
          } else if (fitsVertically && !hasVerticalScrollbar) {
            console.log(`  ✅ Modal fits perfectly at ${resolution.name}`);
          }
        }

        // Close modal
        await page.click('.modal-close');
        await page.waitForTimeout(500);
      } else {
        console.log(`  ❌ Modal failed to open at ${resolution.name}`);
      }
    }
  });

  test('Test customer form content height', async ({ page }) => {
    console.log('🔍 Analyzing customer form content...');

    // Login and open modal
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    await page.click('[data-action="add-customer"]');
    await page.waitForTimeout(1000);

    if (await page.locator('#modal-overlay').isVisible()) {
      // Check form template content
      const modalContent = page.locator('#modal-content');
      const contentHeight = await modalContent.evaluate(element => element.scrollHeight);
      const visibleHeight = await modalContent.evaluate(element => element.clientHeight);

      console.log(`Modal content height: ${contentHeight}px`);
      console.log(`Modal visible height: ${visibleHeight}px`);

      // Count form fields
      const formInputs = await page.locator('.modal-form input, .modal-form select, .modal-form textarea').count();
      console.log(`Number of form fields: ${formInputs}`);

      // Check form field spacing
      const formGap = await page.locator('.modal-form').evaluate(element =>
        window.getComputedStyle(element).gap
      );
      console.log(`Form field gap: ${formGap}`);

      // List all visible form elements
      const formElements = page.locator('.modal-form input, .modal-form select, .modal-form textarea, .modal-form button');
      const elementCount = await formElements.count();

      console.log('\nForm elements found:');
      for (let i = 0; i < elementCount; i++) {
        const element = formElements.nth(i);
        const tagName = await element.evaluate(el => el.tagName);
        const id = await element.getAttribute('id');
        const type = await element.getAttribute('type');
        const placeholder = await element.getAttribute('placeholder');

        console.log(`  ${i + 1}. <${tagName.toLowerCase()}> id="${id}" type="${type}" placeholder="${placeholder}"`);
      }
    }
  });

  test('Test all modal types', async ({ page }) => {
    console.log('🔍 Testing all modal types...');

    // Login first
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    const modalTests = [
      {
        name: 'Customer Registration',
        trigger: () => page.click('[data-action="add-customer"]'),
        expectedFields: ['#customer-email', '#customer-password', '#first-name', '#last-name']
      },
      {
        name: 'Policy Creation',
        trigger: () => page.click('[data-action="add-policy"]'),
        expectedFields: ['#policy-customer', '#policy-type', '#coverage-amount']
      }
    ];

    for (const modalTest of modalTests) {
      console.log(`\nTesting ${modalTest.name} modal...`);

      try {
        await modalTest.trigger();
        await page.waitForTimeout(1000);

        const modalVisible = await page.locator('#modal-overlay').isVisible();
        console.log(`  Modal opens: ${modalVisible}`);

        if (modalVisible) {
          // Check modal dimensions
          const modalContainer = page.locator('.modal-container');
          const box = await modalContainer.boundingBox();
          if (box) {
            console.log(`  Dimensions: ${box.width}x${box.height}`);
          }

          // Close modal
          await page.click('.modal-close');
          await page.waitForTimeout(500);
        }
      } catch (error) {
        console.log(`  ❌ Error testing ${modalTest.name}: ${error.message}`);
      }
    }
  });
});