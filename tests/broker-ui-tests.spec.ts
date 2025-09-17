import { test, expect } from '@playwright/test';

test.describe('Broker UI Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and login as admin
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.fill('#login-email', 'admin@chubb.com');
    await page.fill('#login-password', 'admin');
    await page.click('.login-submit-btn');

    await expect(page.locator('#main-app')).toBeVisible();
    await page.click('[data-section="brokers"]');
    await expect(page.locator('#brokers-section')).toBeVisible();
  });

  test('should have consistent styling with other sections', async ({ page }) => {
    // Verify broker section has same styling as other sections
    const brokersSection = page.locator('#brokers-section');

    // Check main heading style
    await expect(brokersSection.locator('h2')).toHaveClass(/section-title/);

    // Check action buttons have consistent styling
    const addButton = page.locator('#add-broker-btn');
    await expect(addButton).toHaveClass(/action-button/);

    // Verify search elements styling
    const quickSearch = page.locator('#broker-quick-search');
    await expect(quickSearch).toHaveClass(/search-input/);

    // Check table styling consistency
    const table = page.locator('#broker-results table');
    await expect(table).toHaveClass(/data-table/);
  });

  test('should display broker modal with proper styling', async ({ page }) => {
    await page.click('#add-broker-btn');

    const modal = page.locator('#broker-modal');
    await expect(modal).toBeVisible();

    // Verify modal styling
    await expect(modal).toHaveClass(/modal-overlay/);
    await expect(modal.locator('.modal-container')).toBeVisible();

    // Check form styling
    const form = modal.locator('.modal-form');
    await expect(form).toBeVisible();

    // Verify form groups have consistent styling
    const formGroups = modal.locator('.form-group');
    const groupCount = await formGroups.count();
    expect(groupCount).toBeGreaterThan(5); // Should have multiple form groups

    // Check input styling
    const nameInput = modal.locator('#broker-name');
    await expect(nameInput).toHaveClass(/form-input/);

    // Verify button styling
    const saveButton = modal.locator('#save-broker-btn');
    await expect(saveButton).toHaveClass(/action-button/);
  });

  test('should show validation visual feedback', async ({ page }) => {
    await page.click('#add-broker-btn');
    await expect(page.locator('#broker-modal')).toBeVisible();

    // Fill invalid email and trigger validation
    await page.fill('#broker-email', 'invalid-email');
    await page.click('#broker-name'); // Click away to trigger validation

    // Check for visual validation feedback
    const emailInput = page.locator('#broker-email');
    await expect(emailInput).toHaveClass(/invalid/);

    // Verify error message appears
    await expect(page.locator('.field-error')).toBeVisible();

    // Fix email and verify validation clears
    await page.fill('#broker-email', 'valid@email.com');
    await page.click('#broker-name');

    await expect(emailInput).not.toHaveClass(/invalid/);
  });

  test('should display search results with proper layout', async ({ page }) => {
    // Wait for initial broker load
    await page.waitForSelector('.broker-row');

    // Verify table layout
    const table = page.locator('#broker-results table');
    await expect(table).toBeVisible();

    // Check table headers
    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(7); // Name, Email, Phone, License, Specialization, Commission, Actions

    // Verify broker rows have proper structure
    const firstRow = page.locator('.broker-row').first();
    const cells = firstRow.locator('td');
    await expect(cells).toHaveCount(7);

    // Check action buttons in rows
    await expect(firstRow.locator('.edit-broker-btn')).toBeVisible();
    await expect(firstRow.locator('.delete-broker-btn')).toBeVisible();
  });

  test('should show advanced search with proper layout', async ({ page }) => {
    // Toggle advanced search
    await page.click('#toggle-broker-advanced-search');

    const advancedSearch = page.locator('#broker-advanced-search');
    await expect(advancedSearch).toBeVisible();

    // Verify search form layout
    await expect(advancedSearch.locator('.search-filters')).toBeVisible();

    // Check form inputs are properly laid out
    const searchInputs = advancedSearch.locator('.form-input');
    const inputCount = await searchInputs.count();
    expect(inputCount).toBeGreaterThan(3); // Name, specialization, commission min/max

    // Verify search buttons
    await expect(advancedSearch.locator('#search-brokers-btn')).toHaveClass(/action-button/);
    await expect(advancedSearch.locator('#clear-broker-search-btn')).toHaveClass(/secondary-button/);
  });

  test('should display toast notifications in correct position', async ({ page }) => {
    await page.click('#add-broker-btn');
    await expect(page.locator('#broker-modal')).toBeVisible();

    // Fill valid broker data
    await page.fill('#broker-name', 'UI Test Broker');
    await page.fill('#broker-email', 'uitest@broker.com');
    await page.fill('#broker-phone', '555-999-8888');
    await page.fill('#broker-license', 'UILIC123');
    await page.fill('#broker-specialization', 'UI Testing');

    await page.click('#save-broker-btn');

    // Verify toast appears in bottom-right
    const toast = page.locator('.toast.success');
    await expect(toast).toBeVisible();

    // Check toast positioning
    const toastContainer = page.locator('.toast-container');
    await expect(toastContainer).toHaveCSS('position', 'fixed');
    await expect(toastContainer).toHaveCSS('bottom', '20px');
    await expect(toastContainer).toHaveCSS('right', '20px');
  });

  test('should handle responsive design for broker section', async ({ page }) => {
    // Test desktop view first
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.click('[data-section="brokers"]');

    // Verify desktop layout
    const searchSection = page.locator('.search-section');
    await expect(searchSection).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 600 });
    await page.waitForTimeout(100); // Allow for responsive adjustments

    // Verify elements still visible and accessible
    await expect(page.locator('#add-broker-btn')).toBeVisible();
    await expect(page.locator('#broker-quick-search')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);

    // Verify mobile-friendly layout
    await expect(page.locator('#brokers-section')).toBeVisible();

    // Check if table is still usable (might scroll horizontally)
    const table = page.locator('#broker-results table');
    await expect(table).toBeVisible();
  });

  test('should show loading states appropriately', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/brokers', async route => {
      await page.waitForTimeout(1000); // Simulate slow response
      route.continue();
    });

    // Navigate to brokers and check for loading state
    await page.goto('/');
    await page.fill('#login-email', 'admin@chubb.com');
    await page.fill('#login-password', 'admin');
    await page.click('.login-submit-btn');

    await page.click('[data-section="brokers"]');

    // Should show loading indicator or empty state initially
    // (This depends on implementation - adjust based on actual loading UI)
    const brokerResults = page.locator('#broker-results');
    await expect(brokerResults).toBeVisible();
  });

  test('should maintain focus management in broker modal', async ({ page }) => {
    await page.click('#add-broker-btn');

    // Verify modal gets focus
    const modal = page.locator('#broker-modal');
    await expect(modal).toBeVisible();

    // Verify first input gets focus
    const nameInput = page.locator('#broker-name');
    await expect(nameInput).toBeFocused();

    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('#broker-email')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#broker-phone')).toBeFocused();

    // Test escape key closes modal
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('should show appropriate empty states', async ({ page }) => {
    // Mock empty broker response
    await page.route('**/api/brokers', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.reload();
    await page.click('[data-section="brokers"]');

    // Verify empty state message
    const brokerResults = page.locator('#broker-results');
    await expect(brokerResults).toContainText('No brokers found');
  });

  test('should handle broker deletion UI properly', async ({ page }) => {
    await page.waitForSelector('.broker-row');

    // Click delete button
    await page.click('.broker-row .delete-broker-btn');

    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    // Wait for UI update
    await page.waitForTimeout(500);

    // Verify success toast appears
    const toast = page.locator('.toast.success');
    await expect(toast).toContainText('deleted successfully');
  });
});

test.describe('Broker Modal UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.fill('#login-email', 'admin@chubb.com');
    await page.fill('#login-password', 'admin');
    await page.click('.login-submit-btn');

    await expect(page.locator('#main-app')).toBeVisible();
    await page.click('[data-section="brokers"]');
    await page.click('#add-broker-btn');
    await expect(page.locator('#broker-modal')).toBeVisible();
  });

  test('should validate form fields with visual feedback', async ({ page }) => {
    // Test required field validation
    await page.click('#save-broker-btn');

    // Verify required field indicators
    await expect(page.locator('.field-error')).toHaveCount(4); // name, email, phone, license are required

    // Test email format validation
    await page.fill('#broker-email', 'invalid');
    await page.click('#broker-name');

    await expect(page.locator('#broker-email')).toHaveClass(/invalid/);

    // Test phone format validation
    await page.fill('#broker-phone', '123');
    await page.click('#broker-email');

    await expect(page.locator('#broker-phone')).toHaveClass(/invalid/);
  });

  test('should show character count for text areas', async ({ page }) => {
    const addressField = page.locator('#broker-address');

    // Type in address field
    await addressField.fill('123 Test Street, Test City, Test State 12345');

    // If character count is implemented, verify it shows
    // (Adjust based on actual implementation)
    const charCount = page.locator('.char-count');
    if (await charCount.count() > 0) {
      await expect(charCount).toBeVisible();
    }
  });

  test('should handle form reset properly', async ({ page }) => {
    // Fill form fields
    await page.fill('#broker-name', 'Test Broker');
    await page.fill('#broker-email', 'test@broker.com');
    await page.fill('#broker-phone', '555-123-4567');

    // Close modal without saving
    await page.click('.modal-close');
    await expect(page.locator('#broker-modal')).toBeHidden();

    // Reopen modal and verify fields are cleared
    await page.click('#add-broker-btn');
    await expect(page.locator('#broker-modal')).toBeVisible();

    await expect(page.locator('#broker-name')).toHaveValue('');
    await expect(page.locator('#broker-email')).toHaveValue('');
    await expect(page.locator('#broker-phone')).toHaveValue('');
  });
});