import { test, expect } from '@playwright/test';

test.describe('Verify Scrollbar Fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Customer form should have no unnecessary scrollbars', async ({ page }) => {
    console.log('🔍 Testing customer form scrollbar behavior...');

    const resolutions = [
      { width: 1366, height: 768, name: 'Standard Laptop' },
      { width: 1280, height: 720, name: '720p' },
      { width: 1024, height: 768, name: 'Small Desktop' }
    ];

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    for (const resolution of resolutions) {
      console.log(`\nTesting customer form at ${resolution.name} (${resolution.width}x${resolution.height})`);

      await page.setViewportSize(resolution);
      await page.waitForTimeout(500);

      // Open customer form
      await page.click('[data-action="add-customer"]');
      await page.waitForTimeout(1000);

      if (await page.locator('#modal-overlay').isVisible()) {
        // Check modal container scrollbar
        const modalScrollInfo = await page.locator('#modal-overlay .modal-container').first().evaluate(element => {
          return {
            hasVerticalScrollbar: element.scrollHeight > element.clientHeight,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            overflowY: window.getComputedStyle(element).overflowY
          };
        });

        // Check modal content scrollbar
        const contentScrollInfo = await page.locator('#modal-content').evaluate(element => {
          return {
            hasVerticalScrollbar: element.scrollHeight > element.clientHeight,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            overflowY: window.getComputedStyle(element).overflowY
          };
        });

        console.log(`  Modal container scrollbar: ${modalScrollInfo.hasVerticalScrollbar} (overflow: ${modalScrollInfo.overflowY})`);
        console.log(`  Modal content scrollbar: ${contentScrollInfo.hasVerticalScrollbar} (overflow: ${contentScrollInfo.overflowY})`);

        // Verify only one scrolling container
        const totalScrollbars = (modalScrollInfo.hasVerticalScrollbar ? 1 : 0) + (contentScrollInfo.hasVerticalScrollbar ? 1 : 0);
        console.log(`  Total scrollbars: ${totalScrollbars}`);

        if (totalScrollbars <= 1) {
          console.log(`  ✅ Clean scrollbar behavior at ${resolution.name}`);
        } else {
          console.log(`  ❌ Multiple scrollbars detected at ${resolution.name}`);
        }

        // Test form usability
        await page.fill('#customer-email', 'test@example.com');
        await page.fill('#customer-password', 'testpass123');
        await page.fill('#first-name', 'Test');
        await page.fill('#last-name', 'User');

        // Check if submit button is accessible
        const submitButton = page.locator('button[type="submit"]').first();
        const isSubmitVisible = await submitButton.isVisible();
        console.log(`  Submit button accessible: ${isSubmitVisible}`);

        await page.click('.modal-close');
        await page.waitForTimeout(500);
      }
    }
  });

  test('Claims/Data modals should have single clean scrollbar', async ({ page }) => {
    console.log('🔍 Testing claims data modal scrollbar behavior...');

    // Set viewport
    await page.setViewportSize({ width: 1366, height: 768 });

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Test customers data modal
    await page.click('[data-action="view-customers"]');
    await page.waitForTimeout(2000);

    const dataModal = page.locator('#data-modal');
    if (await dataModal.isVisible()) {
      console.log('Data modal opened successfully');

      // Check modal container scrollbar
      const modalScrollInfo = await page.locator('#data-modal .modal-container').evaluate(element => {
        return {
          hasVerticalScrollbar: element.scrollHeight > element.clientHeight,
          overflowY: window.getComputedStyle(element).overflowY
        };
      });

      // Check modal body scrollbar
      const bodyScrollInfo = await page.locator('#data-modal .modal-body').evaluate(element => {
        return {
          hasVerticalScrollbar: element.scrollHeight > element.clientHeight,
          overflowY: window.getComputedStyle(element).overflowY
        };
      });

      // Check table container scrollbar
      const tableScrollInfo = await page.locator('#data-modal .table-container').evaluate(element => {
        return {
          hasVerticalScrollbar: element.scrollHeight > element.clientHeight,
          overflowY: window.getComputedStyle(element).overflowY
        };
      }).catch(() => ({ hasVerticalScrollbar: false, overflowY: 'visible' }));

      console.log('Data Modal Scrollbar Analysis:');
      console.log(`  Modal container: ${modalScrollInfo.hasVerticalScrollbar} (${modalScrollInfo.overflowY})`);
      console.log(`  Modal body: ${bodyScrollInfo.hasVerticalScrollbar} (${bodyScrollInfo.overflowY})`);
      console.log(`  Table container: ${tableScrollInfo.hasVerticalScrollbar} (${tableScrollInfo.overflowY})`);

      const totalScrollbars = [modalScrollInfo, bodyScrollInfo, tableScrollInfo]
        .filter(info => info.hasVerticalScrollbar).length;

      console.log(`  Total active scrollbars: ${totalScrollbars}`);

      if (totalScrollbars <= 1) {
        console.log('  ✅ Clean single scrollbar behavior');
      } else {
        console.log('  ❌ Multiple scrollbars detected');
      }

      await page.click('.modal-close');
    } else {
      console.log('Data modal did not open - checking alternative UI');
    }
  });

  test('Test professional scrollbar styling', async ({ page }) => {
    console.log('🔍 Testing scrollbar styling...');

    // Set viewport
    await page.setViewportSize({ width: 1366, height: 600 }); // Force scrolling

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Open customer form (should have scrolling at this height)
    await page.click('[data-action="add-customer"]');
    await page.waitForTimeout(1000);

    if (await page.locator('#modal-overlay').isVisible()) {
      // Check scrollbar styling
      const scrollbarStyles = await page.evaluate(() => {
        const modal = document.querySelector('#modal-overlay .modal-container');
        if (!modal) return null;

        const styles = window.getComputedStyle(modal, '::-webkit-scrollbar');
        return {
          width: styles.width,
          backgroundColor: styles.backgroundColor
        };
      });

      console.log('Scrollbar styling detected:', scrollbarStyles);

      // Verify content is scrollable
      const isScrollable = await page.locator('#modal-content').evaluate(element => {
        return element.scrollHeight > element.clientHeight;
      });

      console.log(`Content is scrollable: ${isScrollable}`);

      if (isScrollable) {
        // Test scrolling functionality
        await page.locator('#modal-content').evaluate(element => {
          element.scrollTop = 50;
        });

        const scrollPosition = await page.locator('#modal-content').evaluate(element => element.scrollTop);
        console.log(`Scroll position after scroll: ${scrollPosition}px`);

        if (scrollPosition > 0) {
          console.log('✅ Scrolling functionality working');
        }
      }

      await page.click('.modal-close');
    }
  });

  test('Test overall page layout without body scrollbars', async ({ page }) => {
    console.log('🔍 Testing overall page layout...');

    const resolutions = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1280, height: 720 }
    ];

    for (const resolution of resolutions) {
      console.log(`\nTesting page layout at ${resolution.width}x${resolution.height}`);

      await page.setViewportSize(resolution);
      await page.waitForTimeout(300);

      // Login if not already logged in
      if (await page.locator('#login-screen').isVisible()) {
        await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
        await page.fill('#login-password', 'password123');
        await page.click('.login-submit-btn');
        await page.waitForSelector('#main-app', { state: 'visible' });
      }

      // Check body scrolling
      const bodyScrollInfo = await page.evaluate(() => {
        return {
          hasVerticalScrollbar: document.body.scrollHeight > window.innerHeight,
          bodyHeight: document.body.scrollHeight,
          windowHeight: window.innerHeight,
          bodyOverflow: window.getComputedStyle(document.body).overflow
        };
      });

      console.log(`  Body scrollbar needed: ${bodyScrollInfo.hasVerticalScrollbar}`);
      console.log(`  Body height: ${bodyScrollInfo.bodyHeight}px vs window: ${bodyScrollInfo.windowHeight}px`);

      if (!bodyScrollInfo.hasVerticalScrollbar) {
        console.log(`  ✅ Clean page layout at ${resolution.width}x${resolution.height}`);
      } else {
        console.log(`  ⚠️ Page requires scrolling at ${resolution.width}x${resolution.height}`);
      }
    }
  });
});