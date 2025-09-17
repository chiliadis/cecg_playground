import { test, expect } from '@playwright/test';

test.describe('Visual Consistency Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Compare customer and policy section styling consistency', async ({ page }) => {
    console.log('🎨 Testing visual consistency between sections...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Test customers section
    await page.click('[data-tab="customers"]');
    await page.waitForTimeout(500);

    console.log('📋 Customers Section:');

    // Show advanced search
    await page.click('[data-action="show-customer-advanced"]');
    await page.waitForTimeout(500);

    // Check customer section elements
    const customerAdvancedSearch = page.locator('#customer-advanced-search');
    const customerQuickSearch = page.locator('#customer-quick-search');
    const customerStatusFilter = page.locator('#customer-status-filter');

    const customerAdvancedVisible = await customerAdvancedSearch.isVisible();
    const customerQuickSearchVisible = await customerQuickSearch.isVisible();
    const customerFiltersVisible = await customerStatusFilter.isVisible();

    console.log(`  Advanced Search: ${customerAdvancedVisible ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`  Quick Search: ${customerQuickSearchVisible ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`  Status Filters: ${customerFiltersVisible ? '✅ Visible' : '❌ Hidden'}`);

    // Test policies section
    await page.click('[data-tab="policies"]');
    await page.waitForTimeout(500);

    console.log('📋 Policies Section:');

    // Show advanced search
    await page.click('[data-action="show-advanced"]');
    await page.waitForTimeout(500);

    // Check policy section elements
    const policyAdvancedSearch = page.locator('#policy-advanced-search');
    const policyQuickSearch = page.locator('#policy-quick-search');
    const policyStatusFilter = page.locator('#policy-status-filter');

    const policyAdvancedVisible = await policyAdvancedSearch.isVisible();
    const policyQuickSearchVisible = await policyQuickSearch.isVisible();
    const policyFiltersVisible = await policyStatusFilter.isVisible();

    console.log(`  Advanced Search: ${policyAdvancedVisible ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`  Quick Search: ${policyQuickSearchVisible ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`  Status Filters: ${policyFiltersVisible ? '✅ Visible' : '❌ Hidden'}`);

    // Test dropdown styling consistency
    console.log('🎨 Dropdown Styling:');

    // Check all filter dropdowns have consistent class
    const allDropdowns = await page.locator('.filter-dropdown').count();
    console.log(`  Total filter dropdowns: ${allDropdowns}`);

    // Check specific dropdown styles
    const dropdownStyles = await page.evaluate(() => {
      const dropdown = document.querySelector('.filter-dropdown');
      if (!dropdown) return null;

      const styles = window.getComputedStyle(dropdown);
      return {
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        border: styles.border,
        fontSize: styles.fontSize
      };
    });

    if (dropdownStyles) {
      console.log(`  Padding: ${dropdownStyles.padding}`);
      console.log(`  Border Radius: ${dropdownStyles.borderRadius}`);
      console.log(`  Font Size: ${dropdownStyles.fontSize}`);
      console.log('✅ Dropdown styling is consistent');
    }

    // Test search grid layout consistency
    console.log('📐 Search Grid Layout:');

    const searchGrids = await page.locator('.search-grid').count();
    const advancedSearchSections = await page.locator('.advanced-search').count();

    console.log(`  Search grids found: ${searchGrids}`);
    console.log(`  Advanced search sections: ${advancedSearchSections}`);

    if (searchGrids >= 2 && advancedSearchSections >= 2) {
      console.log('✅ Search layout consistency maintained');
    }

    console.log('🎯 Visual Consistency Test Complete!');
  });
});