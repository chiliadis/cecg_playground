import { test, expect } from '@playwright/test';

test.describe('Customer Search and Dropdown Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Test customer advanced search functionality', async ({ page }) => {
    console.log('🔍 Testing customer advanced search...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to customers
    await page.click('[data-tab="customers"]');
    await page.waitForTimeout(500);

    // Test advanced search toggle
    await page.click('[data-action="show-customer-advanced"]');
    await page.waitForTimeout(500);

    const advancedSearch = page.locator('#customer-advanced-search');
    const isVisible = await advancedSearch.isVisible();
    console.log(`Customer advanced search visible: ${isVisible}`);

    if (isVisible) {
      console.log('✅ Customer advanced search toggle working');

      // Test all search fields
      await page.fill('#search-first-name', 'wizard');
      await page.fill('#search-last-name', 'mcspell');
      await page.fill('#search-email', 'wizard');
      await page.selectOption('#customer-status-filter', 'active');
      await page.selectOption('#customer-type-filter', 'individual');

      // Perform search
      await page.click('[data-action="advanced-customer-search"]');
      await page.waitForTimeout(3000);

      // Check results
      const dataModal = page.locator('#data-modal');
      if (await dataModal.isVisible()) {
        const resultsTitle = await page.locator('#data-modal-title').textContent();
        console.log(`Customer search results: ${resultsTitle}`);

        if (resultsTitle?.includes('Customer Search Results')) {
          console.log('✅ Customer advanced search functionality working');
        }

        await page.click('#data-modal .modal-close');
        await page.waitForTimeout(500);
      }

      // Test clear functionality
      await page.click('[data-action="clear-customer-search"]');
      await page.waitForTimeout(500);

      const firstNameValue = await page.locator('#search-first-name').inputValue();
      const emailValue = await page.locator('#search-email').inputValue();

      if (firstNameValue === '' && emailValue === '') {
        console.log('✅ Customer search clear functionality working');
      }
    }
  });

  test('Test customer quick search functionality', async ({ page }) => {
    console.log('🔍 Testing customer quick search...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to customers
    await page.click('[data-tab="customers"]');
    await page.waitForTimeout(500);

    // Test quick search
    const quickSearchInput = page.locator('#customer-quick-search');
    await quickSearchInput.fill('wizard');
    await page.waitForTimeout(2000); // Wait for debounced search

    // Check if search results appeared
    const dataModal = page.locator('#data-modal');
    if (await dataModal.isVisible()) {
      const title = await page.locator('#data-modal-title').textContent();
      console.log(`Customer quick search results: ${title}`);

      if (title?.includes('Customer Quick Search')) {
        console.log('✅ Customer quick search functionality working');
      }

      await page.click('#data-modal .modal-close');
      await page.waitForTimeout(500);
    }
  });

  test('Test dropdown design consistency across application', async ({ page }) => {
    console.log('🔍 Testing dropdown design consistency...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Test customer dropdowns
    await page.click('[data-tab="customers"]');
    await page.waitForTimeout(500);

    const customerStatusFilter = page.locator('#customer-status-filter');
    const customerTypeFilter = page.locator('#customer-type-filter');

    // Check styling consistency
    const customerStatusClass = await customerStatusFilter.getAttribute('class');
    const customerTypeClass = await customerTypeFilter.getAttribute('class');

    console.log(`Customer status filter class: ${customerStatusClass}`);
    console.log(`Customer type filter class: ${customerTypeClass}`);

    if (customerStatusClass?.includes('filter-dropdown') && customerTypeClass?.includes('filter-dropdown')) {
      console.log('✅ Customer dropdowns have consistent styling');
    }

    // Test policy dropdowns
    await page.click('[data-tab="policies"]');
    await page.waitForTimeout(500);

    const policyFilter = page.locator('#policy-filter');
    const policyStatusFilter = page.locator('#policy-status-filter');

    const policyFilterClass = await policyFilter.getAttribute('class');
    const policyStatusClass = await policyStatusFilter.getAttribute('class');

    console.log(`Policy filter class: ${policyFilterClass}`);
    console.log(`Policy status filter class: ${policyStatusClass}`);

    if (policyFilterClass?.includes('filter-dropdown') && policyStatusClass?.includes('filter-dropdown')) {
      console.log('✅ Policy dropdowns have consistent styling');
    }

    // Test advanced search dropdowns
    await page.click('[data-action="show-advanced"]');
    await page.waitForTimeout(500);

    const advancedDropdowns = await page.locator('.advanced-search select.filter-dropdown').count();
    console.log(`Advanced search dropdowns with consistent styling: ${advancedDropdowns}`);

    if (advancedDropdowns > 0) {
      console.log('✅ Advanced search dropdowns have consistent styling');
    }
  });

  test('Test customer filter combinations', async ({ page }) => {
    console.log('🔍 Testing customer filter combinations...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to customers
    await page.click('[data-tab="customers"]');
    await page.waitForTimeout(500);

    // Show advanced search
    await page.click('[data-action="show-customer-advanced"]');
    await page.waitForTimeout(500);

    // Test different search combinations
    const searchTests = [
      {
        name: 'Customer Status Filter',
        filters: { status: 'active' },
        expectedResults: true
      },
      {
        name: 'Customer Type Filter',
        filters: { type: 'individual' },
        expectedResults: true
      },
      {
        name: 'Income Range Filter',
        filters: { income_min: '50000', income_max: '200000' },
        expectedResults: true
      },
      {
        name: 'Combined Filters',
        filters: { status: 'active', type: 'individual', first_name: 'wizard' },
        expectedResults: true
      }
    ];

    for (const test of searchTests) {
      console.log(`Testing: ${test.name}`);

      // Clear previous search
      await page.click('[data-action="clear-customer-search"]');
      await page.waitForTimeout(500);

      // Apply filters
      if (test.filters.status) {
        await page.selectOption('#customer-status-filter', test.filters.status);
      }
      if (test.filters.type) {
        await page.selectOption('#customer-type-filter', test.filters.type);
      }
      if (test.filters.income_min) {
        await page.fill('#search-income-min', test.filters.income_min);
      }
      if (test.filters.income_max) {
        await page.fill('#search-income-max', test.filters.income_max);
      }
      if (test.filters.first_name) {
        await page.fill('#search-first-name', test.filters.first_name);
      }

      // Perform search
      await page.click('[data-action="advanced-customer-search"]');
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

    console.log('✅ All customer search combinations tested');
  });

  test('Test agent dropdown population in customer search', async ({ page }) => {
    console.log('🔍 Testing agent dropdown population...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to customers
    await page.click('[data-tab="customers"]');
    await page.waitForTimeout(500);

    // Show advanced search (should trigger agent loading)
    await page.click('[data-action="show-customer-advanced"]');
    await page.waitForTimeout(2000); // Wait for agents to load

    // Check agent dropdown
    const agentSelect = page.locator('#search-agent');
    const agentOptions = await agentSelect.locator('option').count();

    console.log(`Agent dropdown has ${agentOptions} options`);

    if (agentOptions > 1) { // Should have at least "All Agents" + actual agents
      console.log('✅ Agent dropdown populated successfully');

      // Test selecting an agent
      const secondOption = await agentSelect.locator('option').nth(1).textContent();
      if (secondOption && secondOption !== 'All Agents') {
        await agentSelect.selectOption({ index: 1 });
        console.log(`Selected agent: ${secondOption}`);

        // Perform search with agent filter
        await page.click('[data-action="advanced-customer-search"]');
        await page.waitForTimeout(2000);

        const dataModal = page.locator('#data-modal');
        if (await dataModal.isVisible()) {
          console.log('✅ Agent filter search working');
          await page.click('#data-modal .modal-close');
          await page.waitForTimeout(500);
        }
      }
    }
  });
});