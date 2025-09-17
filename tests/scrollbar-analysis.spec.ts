import { test, expect } from '@playwright/test';

test.describe('Scrollbar Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Analyze customer form scrollbar issues', async ({ page }) => {
    console.log('🔍 Analyzing customer form scrollbars...');

    // Set common viewport
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
      // Analyze modal container
      const modalContainer = page.locator('#modal-overlay .modal-container').first();

      const containerMetrics = await modalContainer.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          hasVerticalScrollbar: element.scrollHeight > element.clientHeight,
          hasHorizontalScrollbar: element.scrollWidth > element.clientWidth,
          computedStyles: {
            maxHeight: window.getComputedStyle(element).maxHeight,
            overflowY: window.getComputedStyle(element).overflowY,
            padding: window.getComputedStyle(element).padding
          }
        };
      });

      console.log('Modal Container Analysis:');
      console.log(`  Dimensions: ${Math.round(containerMetrics.width)}x${Math.round(containerMetrics.height)}`);
      console.log(`  Content height: ${containerMetrics.scrollHeight}px vs visible: ${containerMetrics.clientHeight}px`);
      console.log(`  Has vertical scrollbar: ${containerMetrics.hasVerticalScrollbar}`);
      console.log(`  Max height: ${containerMetrics.computedStyles.maxHeight}`);
      console.log(`  Overflow-Y: ${containerMetrics.computedStyles.overflowY}`);

      // Analyze form content
      const formMetrics = await page.locator('#modal-content').evaluate(element => {
        const rect = element.getBoundingClientRect();
        return {
          height: rect.height,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          padding: window.getComputedStyle(element).padding
        };
      });

      console.log('Form Content Analysis:');
      console.log(`  Content height: ${formMetrics.scrollHeight}px vs visible: ${formMetrics.clientHeight}px`);
      console.log(`  Padding: ${formMetrics.padding}`);

      // Count form elements
      const formElements = await page.evaluate(() => {
        const modal = document.querySelector('#modal-overlay .modal-container');
        if (!modal) return { total: 0, inputs: 0, labels: 0, buttons: 0 };

        const inputs = modal.querySelectorAll('input, select, textarea').length;
        const labels = modal.querySelectorAll('label').length;
        const buttons = modal.querySelectorAll('button').length;

        return {
          total: inputs + labels + buttons,
          inputs,
          labels,
          buttons
        };
      });

      console.log('Form Elements Count:');
      console.log(`  Total elements: ${formElements.total}`);
      console.log(`  Inputs: ${formElements.inputs}, Labels: ${formElements.labels}, Buttons: ${formElements.buttons}`);

      // Check if submit button is visible without scrolling
      const submitButtonVisible = await page.evaluate(() => {
        const modal = document.querySelector('#modal-overlay .modal-container');
        const submitBtn = modal?.querySelector('button[type="submit"]');
        if (!submitBtn) return false;

        const modalRect = modal.getBoundingClientRect();
        const btnRect = submitBtn.getBoundingClientRect();

        return btnRect.bottom <= modalRect.bottom;
      });

      console.log(`Submit button visible without scrolling: ${submitButtonVisible}`);

      await page.click('.modal-close');
    }
  });

  test('Analyze claims section double scrollbars', async ({ page }) => {
    console.log('🔍 Analyzing claims double scrollbars...');

    // Set viewport
    await page.setViewportSize({ width: 1366, height: 768 });

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to claims
    await page.click('[data-tab="claims"]');
    await page.waitForTimeout(500);

    // Try to load claims data
    try {
      await page.click('[data-action="view-claims"]');
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('Claims load button not found, checking existing claims display');
    }

    // Check for claims section scrollbars
    const claimsSection = page.locator('#claims');
    if (await claimsSection.isVisible()) {
      const sectionMetrics = await claimsSection.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          hasVerticalScrollbar: element.scrollHeight > element.clientHeight,
          hasHorizontalScrollbar: element.scrollWidth > element.clientWidth,
          computedStyles: {
            overflow: window.getComputedStyle(element).overflow,
            overflowX: window.getComputedStyle(element).overflowX,
            overflowY: window.getComputedStyle(element).overflowY,
            maxHeight: window.getComputedStyle(element).maxHeight,
            height: window.getComputedStyle(element).height
          }
        };
      });

      console.log('Claims Section Analysis:');
      console.log(`  Dimensions: ${Math.round(sectionMetrics.width)}x${Math.round(sectionMetrics.height)}`);
      console.log(`  Content vs visible - Height: ${sectionMetrics.scrollHeight} vs ${sectionMetrics.clientHeight}`);
      console.log(`  Content vs visible - Width: ${sectionMetrics.scrollWidth} vs ${sectionMetrics.clientWidth}`);
      console.log(`  Has vertical scrollbar: ${sectionMetrics.hasVerticalScrollbar}`);
      console.log(`  Has horizontal scrollbar: ${sectionMetrics.hasHorizontalScrollbar}`);
      console.log(`  Overflow styles: ${sectionMetrics.computedStyles.overflow}`);
      console.log(`  Overflow-X: ${sectionMetrics.computedStyles.overflowX}`);
      console.log(`  Overflow-Y: ${sectionMetrics.computedStyles.overflowY}`);
    }

    // Check for data modal scrollbars if it exists
    const dataModal = page.locator('#data-modal');
    if (await dataModal.isVisible()) {
      const modalMetrics = await dataModal.evaluate(element => {
        const container = element.querySelector('.modal-container');
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        return {
          hasVerticalScrollbar: container.scrollHeight > container.clientHeight,
          hasHorizontalScrollbar: container.scrollWidth > container.clientWidth,
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
          computedStyles: {
            overflow: window.getComputedStyle(container).overflow,
            maxHeight: window.getComputedStyle(container).maxHeight
          }
        };
      });

      if (modalMetrics) {
        console.log('Claims Data Modal Analysis:');
        console.log(`  Modal has vertical scrollbar: ${modalMetrics.hasVerticalScrollbar}`);
        console.log(`  Modal has horizontal scrollbar: ${modalMetrics.hasHorizontalScrollbar}`);
        console.log(`  Content height: ${modalMetrics.scrollHeight} vs visible: ${modalMetrics.clientHeight}`);
      }
    }
  });

  test('Check viewport and main app scrolling', async ({ page }) => {
    console.log('🔍 Analyzing main app scrolling behavior...');

    // Set viewport
    await page.setViewportSize({ width: 1366, height: 768 });

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Check main app scrolling
    const mainAppMetrics = await page.locator('#main-app').evaluate(element => {
      const rect = element.getBoundingClientRect();
      return {
        hasVerticalScrollbar: element.scrollHeight > element.clientHeight,
        hasHorizontalScrollbar: element.scrollWidth > element.clientWidth,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        computedStyles: {
          overflow: window.getComputedStyle(element).overflow,
          height: window.getComputedStyle(element).height
        }
      };
    });

    console.log('Main App Scrolling:');
    console.log(`  Has vertical scrollbar: ${mainAppMetrics.hasVerticalScrollbar}`);
    console.log(`  Has horizontal scrollbar: ${mainAppMetrics.hasHorizontalScrollbar}`);
    console.log(`  Content height: ${mainAppMetrics.scrollHeight} vs visible: ${mainAppMetrics.clientHeight}`);
    console.log(`  Overflow: ${mainAppMetrics.computedStyles.overflow}`);

    // Check body scrolling
    const bodyMetrics = await page.evaluate(() => {
      return {
        hasVerticalScrollbar: document.body.scrollHeight > document.body.clientHeight,
        hasHorizontalScrollbar: document.body.scrollWidth > document.body.clientWidth,
        scrollHeight: document.body.scrollHeight,
        clientHeight: document.body.clientHeight,
        windowHeight: window.innerHeight
      };
    });

    console.log('Body Scrolling:');
    console.log(`  Body has vertical scrollbar: ${bodyMetrics.hasVerticalScrollbar}`);
    console.log(`  Body height: ${bodyMetrics.scrollHeight} vs window: ${bodyMetrics.windowHeight}`);
  });
});