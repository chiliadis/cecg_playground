import { test, expect } from '@playwright/test';

test.describe('Verify Modal Improvements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Test modal fits at common resolutions', async ({ page }) => {
    const commonResolutions = [
      { width: 1920, height: 1080, name: '1920x1080 (Full HD)' },
      { width: 1366, height: 768, name: '1366x768 (Most Common)' },
      { width: 1280, height: 720, name: '1280x720 (720p)' },
      { width: 1024, height: 768, name: '1024x768 (Standard)' },
      { width: 1440, height: 900, name: '1440x900 (MacBook Air)' }
    ];

    // Login first
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    for (const resolution of commonResolutions) {
      console.log(`\n🔍 Testing ${resolution.name}`);

      // Set viewport
      await page.setViewportSize({ width: resolution.width, height: resolution.height });
      await page.waitForTimeout(500);

      // Open Add Customer modal
      await page.click('[data-action="add-customer"]');
      await page.waitForTimeout(1000);

      const modalOverlay = page.locator('#modal-overlay');
      const modalContainer = page.locator('#modal-overlay .modal-container').first();

      if (await modalOverlay.isVisible()) {
        // Get modal dimensions
        const modalBox = await modalContainer.boundingBox();
        if (modalBox) {
          const fitsInViewport = modalBox.height <= resolution.height && modalBox.width <= resolution.width;
          const hasReasonableMargin = modalBox.y >= 10 && (modalBox.y + modalBox.height) <= (resolution.height - 10);

          console.log(`  Modal dimensions: ${Math.round(modalBox.width)}x${Math.round(modalBox.height)}`);
          console.log(`  Viewport usage: ${Math.round((modalBox.height / resolution.height) * 100)}% height`);
          console.log(`  Fits in viewport: ${fitsInViewport}`);
          console.log(`  Has margins: ${hasReasonableMargin}`);

          // Check for scrollbar
          const needsScrolling = await modalContainer.evaluate(element =>
            element.scrollHeight > element.clientHeight
          );
          console.log(`  Needs internal scrolling: ${needsScrolling}`);

          // Verify all form fields are accessible
          const allFieldsVisible = await page.evaluate(() => {
            const modal = document.querySelector('#modal-overlay .modal-container');
            if (!modal) return false;

            const fields = modal.querySelectorAll('input, select, textarea, button[type="submit"]');
            for (const field of fields) {
              const rect = field.getBoundingClientRect();
              const modalRect = modal.getBoundingClientRect();

              // Check if field is within modal bounds
              if (rect.bottom > modalRect.bottom || rect.top < modalRect.top) {
                console.log('Field outside modal bounds:', field.id || field.name);
                return false;
              }
            }
            return true;
          });

          console.log(`  All fields accessible: ${allFieldsVisible}`);

          if (fitsInViewport && hasReasonableMargin && allFieldsVisible) {
            console.log(`  ✅ PASS: Modal renders properly at ${resolution.name}`);
          } else {
            console.log(`  ⚠️ ISSUES: Modal needs attention at ${resolution.name}`);
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

  test('Test modal responsiveness with CSS media queries', async ({ page }) => {
    console.log('🔍 Testing CSS media query responsiveness...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    const testSizes = [
      { width: 1024, height: 600, expectedBehavior: 'compact styling for short viewport' },
      { width: 1366, height: 768, expectedBehavior: 'standard styling' },
      { width: 600, height: 800, expectedBehavior: 'narrow width responsive' }
    ];

    for (const size of testSizes) {
      console.log(`\nTesting ${size.width}x${size.height} - ${size.expectedBehavior}`);

      await page.setViewportSize(size);
      await page.waitForTimeout(300);

      // Open modal
      await page.click('[data-action="add-customer"]');
      await page.waitForTimeout(1000);

      if (await page.locator('#modal-overlay').isVisible()) {
        // Check applied styles
        const modalContainer = page.locator('#modal-overlay .modal-container').first();

        const styles = await modalContainer.evaluate(element => {
          const computed = window.getComputedStyle(element);
          return {
            maxHeight: computed.maxHeight,
            padding: computed.padding,
            margin: computed.margin,
            width: computed.width
          };
        });

        const titleStyles = await page.locator('.modal-title').evaluate(element => {
          const computed = window.getComputedStyle(element);
          return {
            fontSize: computed.fontSize,
            marginBottom: computed.marginBottom
          };
        });

        console.log(`  Modal container styles:`, styles);
        console.log(`  Title styles:`, titleStyles);

        // Close modal
        await page.click('.modal-close');
        await page.waitForTimeout(300);
      }
    }
  });

  test('Test form completion without scrolling', async ({ page }) => {
    console.log('🔍 Testing form completion workflow...');

    // Set common laptop resolution
    await page.setViewportSize({ width: 1366, height: 768 });

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Open customer form
    await page.click('[data-action="add-customer"]');
    await page.waitForTimeout(1000);

    if (await page.locator('#modal-overlay').isVisible()) {
      console.log('Modal opened successfully');

      // Fill form completely
      await page.fill('#customer-email', 'test@example.com');
      console.log('✅ Email field accessible');

      await page.fill('#customer-password', 'testpass123');
      console.log('✅ Password field accessible');

      await page.fill('#first-name', 'Test');
      console.log('✅ First name field accessible');

      await page.fill('#last-name', 'User');
      console.log('✅ Last name field accessible');

      await page.fill('#date-of-birth', '1990-01-01');
      console.log('✅ Date of birth field accessible');

      await page.fill('#phone', '555-123-4567');
      console.log('✅ Phone field accessible');

      // Check if submit button is visible and clickable
      const submitBtn = page.locator('button[type="submit"]');
      const submitVisible = await submitBtn.isVisible();
      console.log(`✅ Submit button visible: ${submitVisible}`);

      if (submitVisible) {
        // Check if button is in viewport without scrolling
        const buttonInViewport = await submitBtn.evaluate(element => {
          const rect = element.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        });
        console.log(`✅ Submit button in viewport: ${buttonInViewport}`);
      }

      // Close modal
      await page.click('.modal-close');
      console.log('✅ Modal closed successfully');
    }
  });
});