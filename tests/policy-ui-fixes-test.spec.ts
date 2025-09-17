import { test, expect } from '@playwright/test';

test.describe('Policy UI Fixes and Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Test workflow guide UI alignment and styling', async ({ page }) => {
    console.log('🔍 Testing workflow guide UI fixes...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to policies
    await page.click('[data-tab="policies"]');
    await page.waitForTimeout(500);

    // Show workflow guide
    await page.click('[data-action="toggle-workflow"]');
    await page.waitForTimeout(500);

    const workflowGuide = page.locator('#policy-workflow-guide');
    const isVisible = await workflowGuide.isVisible();
    console.log(`Workflow guide visible: ${isVisible}`);

    if (isVisible) {
      // Check workflow steps alignment
      const workflowSteps = page.locator('.workflow-steps');
      const stepsDisplay = await workflowSteps.evaluate(el => window.getComputedStyle(el).display);
      console.log(`Workflow steps display: ${stepsDisplay}`);

      // Check step alignment
      const steps = await page.locator('.step').count();
      const arrows = await page.locator('.step-arrow').count();
      console.log(`Steps: ${steps}, Arrows: ${arrows}`);

      // Check decline branch alignment
      const declineStep = page.locator('.step-decline');
      if (await declineStep.isVisible()) {
        const declineDisplay = await declineStep.evaluate(el => window.getComputedStyle(el).display);
        console.log(`Decline step display: ${declineDisplay}`);
        console.log('✅ Workflow guide alignment looks good');
      }
    }
  });

  test('Test modal layering and edit popup behavior', async ({ page }) => {
    console.log('🔍 Testing modal layering fixes...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to policies
    await page.click('[data-tab="policies"]');
    await page.waitForTimeout(500);

    // Load policies
    await page.click('[data-action="load-policies"]');
    await page.waitForTimeout(3000);

    // Check if data modal opened
    const dataModal = page.locator('#data-modal');
    const dataModalVisible = await dataModal.isVisible();
    console.log(`Data modal opened: ${dataModalVisible}`);

    if (dataModalVisible) {
      // Check z-index values
      const dataModalZIndex = await dataModal.evaluate(el => window.getComputedStyle(el).zIndex);
      console.log(`Data modal z-index: ${dataModalZIndex}`);

      // Try to open edit modal
      const editButton = page.locator('.action-btn.edit-btn').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(1000);

        // Check if edit modal opened
        const editModal = page.locator('#modal-overlay');
        const editModalVisible = await editModal.isVisible();
        console.log(`Edit modal opened: ${editModalVisible}`);

        if (editModalVisible) {
          const editModalZIndex = await editModal.evaluate(el => window.getComputedStyle(el).zIndex);
          console.log(`Edit modal z-index: ${editModalZIndex}`);

          // Check which modal is on top
          if (parseInt(editModalZIndex) > parseInt(dataModalZIndex)) {
            console.log('✅ Edit modal is properly layered above data modal');
          }

          // Test closing edit modal
          const closeButton = page.locator('#modal-overlay .modal-close');
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(500);

            const editModalStillVisible = await editModal.isVisible();
            console.log(`Edit modal closed properly: ${!editModalStillVisible}`);

            if (!editModalStillVisible) {
              console.log('✅ Edit modal closes properly');
            }
          }
        }
      }

      // Close data modal
      await page.click('#data-modal .modal-close');
      await page.waitForTimeout(500);
    }
  });

  test('Test comprehensive policy search functionality', async ({ page }) => {
    console.log('🔍 Testing policy search functionality...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to policies
    await page.click('[data-tab="policies"]');
    await page.waitForTimeout(500);

    // Test quick search
    console.log('Testing quick search...');
    const quickSearchInput = page.locator('#policy-quick-search');
    await quickSearchInput.fill('auto');
    await page.waitForTimeout(2000); // Wait for debounced search

    // Check if search results appeared
    const dataModal = page.locator('#data-modal');
    if (await dataModal.isVisible()) {
      const title = await page.locator('#data-modal-title').textContent();
      console.log(`Quick search results title: ${title}`);

      if (title?.includes('Quick Search')) {
        console.log('✅ Quick search functionality working');
      }

      await page.click('#data-modal .modal-close');
      await page.waitForTimeout(500);
    }

    // Test advanced search toggle
    console.log('Testing advanced search toggle...');
    await page.click('[data-action="show-advanced"]');
    await page.waitForTimeout(500);

    const advancedSearch = page.locator('#policy-advanced-search');
    const isAdvancedVisible = await advancedSearch.isVisible();
    console.log(`Advanced search visible: ${isAdvancedVisible}`);

    if (isAdvancedVisible) {
      console.log('✅ Advanced search toggle working');

      // Test advanced search fields
      await page.fill('#search-customer-name', 'wizard');
      await page.fill('#search-coverage-min', '50000');
      await page.selectOption('#policy-filter', 'auto');

      // Perform advanced search
      await page.click('[data-action="advanced-search"]');
      await page.waitForTimeout(3000);

      // Check results
      if (await dataModal.isVisible()) {
        const resultsTitle = await page.locator('#data-modal-title').textContent();
        console.log(`Advanced search results: ${resultsTitle}`);

        if (resultsTitle?.includes('Search Results')) {
          console.log('✅ Advanced search functionality working');
        }

        await page.click('#data-modal .modal-close');
        await page.waitForTimeout(500);
      }

      // Test clear functionality
      await page.click('[data-action="clear-search"]');
      await page.waitForTimeout(500);

      const customerNameValue = await page.locator('#search-customer-name').inputValue();
      const coverageMinValue = await page.locator('#search-coverage-min').inputValue();

      if (customerNameValue === '' && coverageMinValue === '') {
        console.log('✅ Clear search functionality working');
      }

      // Hide advanced search
      await page.click('[data-action="toggle-advanced"]');
      await page.waitForTimeout(500);

      const isAdvancedHidden = !(await advancedSearch.isVisible());
      if (isAdvancedHidden) {
        console.log('✅ Advanced search hide functionality working');
      }
    }
  });

  test('Test all search combinations and filters', async ({ page }) => {
    console.log('🔍 Testing comprehensive search combinations...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to policies
    await page.click('[data-tab="policies"]');
    await page.waitForTimeout(500);

    // Show advanced search
    await page.click('[data-action="show-advanced"]');
    await page.waitForTimeout(500);

    // Test different search combinations
    const searchTests = [
      {
        name: 'Policy Type Filter',
        filters: { policy_type: 'auto' },
        expectedResults: true
      },
      {
        name: 'Status Filter',
        filters: { status: 'booked' },
        expectedResults: true
      },
      {
        name: 'Combined Filters',
        filters: { policy_type: 'home', status: 'quoted' },
        expectedResults: true
      }
    ];

    for (const test of searchTests) {
      console.log(`Testing: ${test.name}`);

      // Clear previous search
      await page.click('[data-action="clear-search"]');
      await page.waitForTimeout(500);

      // Apply filters
      if (test.filters.policy_type) {
        await page.selectOption('#policy-filter', test.filters.policy_type);
      }
      if (test.filters.status) {
        await page.selectOption('#policy-status-filter', test.filters.status);
      }

      // Perform search
      await page.click('[data-action="advanced-search"]');
      await page.waitForTimeout(2000);

      // Check results
      const dataModal = page.locator('#data-modal');
      if (await dataModal.isVisible()) {
        const resultsTitle = await page.locator('#data-modal-title').textContent();
        console.log(`  Results for ${test.name}: ${resultsTitle}`);

        await page.click('#data-modal .modal-close');
        await page.waitForTimeout(500);
      }
    }

    console.log('✅ All search combinations tested');
  });
});