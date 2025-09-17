import { test, expect } from '@playwright/test';

// Test data for brokers
const validBroker = {
  name: 'Test Broker Agency',
  email: 'test.broker@insurance.com',
  phone: '555-123-4567',
  license_number: 'LIC123456789',
  specialization: 'Commercial Insurance',
  address: '123 Business St, New York, NY 10001',
  commission_rate: 5.5
};

const invalidBroker = {
  name: '', // Invalid empty name
  email: 'invalid-email', // Invalid email format
  phone: '123', // Invalid phone format
  license_number: '',
  specialization: '',
  address: '',
  commission_rate: -1 // Invalid negative commission
};

test.describe('Broker Management Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and login as admin
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Login as admin
    await page.fill('#login-email', 'admin@chubb.com');
    await page.fill('#login-password', 'admin');
    await page.click('.login-submit-btn');

    // Wait for main app to load
    await expect(page.locator('#main-app')).toBeVisible();

    // Navigate to brokers section
    await page.click('[data-section="brokers"]');
    await expect(page.locator('#brokers-section')).toBeVisible();
  });

  test('should display brokers section correctly', async ({ page }) => {
    // Verify brokers section elements
    await expect(page.locator('#brokers-section h2')).toContainText('Broker Management');
    await expect(page.locator('#add-broker-btn')).toBeVisible();
    await expect(page.locator('#broker-quick-search')).toBeVisible();
    await expect(page.locator('#broker-results')).toBeVisible();

    // Verify search functionality elements
    await expect(page.locator('#toggle-broker-advanced-search')).toBeVisible();
    await expect(page.locator('#broker-advanced-search')).toBeHidden();
  });

  test('should load and display brokers in the table', async ({ page }) => {
    // Wait for brokers to load
    await page.waitForSelector('.broker-row');

    // Verify broker table has data
    const brokerRows = await page.locator('.broker-row').count();
    expect(brokerRows).toBeGreaterThan(0);

    // Verify table headers
    await expect(page.locator('#broker-results th')).toContainText(['Name', 'Email', 'Phone', 'License', 'Specialization']);

    // Verify first broker row has valid data
    const firstRow = page.locator('.broker-row').first();
    await expect(firstRow.locator('td').first()).not.toBeEmpty();
    await expect(firstRow.locator('td').nth(1)).toContainText('@');
  });

  test('should open add broker modal when clicking add button', async ({ page }) => {
    await page.click('#add-broker-btn');

    // Verify modal opens
    await expect(page.locator('#broker-modal')).toBeVisible();
    await expect(page.locator('#broker-modal h3')).toContainText('Add New Broker');

    // Verify form fields
    await expect(page.locator('#broker-name')).toBeVisible();
    await expect(page.locator('#broker-email')).toBeVisible();
    await expect(page.locator('#broker-phone')).toBeVisible();
    await expect(page.locator('#broker-license')).toBeVisible();
    await expect(page.locator('#broker-specialization')).toBeVisible();
    await expect(page.locator('#broker-address')).toBeVisible();
    await expect(page.locator('#broker-commission')).toBeVisible();

    // Verify modal buttons
    await expect(page.locator('#save-broker-btn')).toBeVisible();
    await expect(page.locator('.modal-close')).toBeVisible();
  });

  test('should validate broker form fields', async ({ page }) => {
    await page.click('#add-broker-btn');
    await expect(page.locator('#broker-modal')).toBeVisible();

    // Try to submit empty form
    await page.click('#save-broker-btn');

    // Verify validation messages appear
    await expect(page.locator('.field-error')).toBeVisible();

    // Fill invalid data
    await page.fill('#broker-name', invalidBroker.name);
    await page.fill('#broker-email', invalidBroker.email);
    await page.fill('#broker-phone', invalidBroker.phone);
    await page.fill('#broker-commission', invalidBroker.commission_rate.toString());

    // Trigger validation
    await page.click('#broker-email');
    await page.click('#broker-phone');

    // Verify email validation
    await expect(page.locator('#broker-email')).toHaveClass(/invalid/);
  });

  test('should successfully create a new broker', async ({ page }) => {
    await page.click('#add-broker-btn');
    await expect(page.locator('#broker-modal')).toBeVisible();

    // Fill valid broker data
    await page.fill('#broker-name', validBroker.name);
    await page.fill('#broker-email', validBroker.email);
    await page.fill('#broker-phone', validBroker.phone);
    await page.fill('#broker-license', validBroker.license_number);
    await page.fill('#broker-specialization', validBroker.specialization);
    await page.fill('#broker-address', validBroker.address);
    await page.fill('#broker-commission', validBroker.commission_rate.toString());

    // Submit form
    await page.click('#save-broker-btn');

    // Verify modal closes
    await expect(page.locator('#broker-modal')).toBeHidden();

    // Verify success toast
    await expect(page.locator('.toast.success')).toContainText('Broker created successfully');

    // Verify broker appears in table
    await page.waitForSelector('.broker-row');
    await expect(page.locator('.broker-row')).toContainText(validBroker.name);
  });

  test('should search brokers using quick search', async ({ page }) => {
    // Wait for brokers to load
    await page.waitForSelector('.broker-row');

    // Get initial broker count
    const initialCount = await page.locator('.broker-row').count();
    expect(initialCount).toBeGreaterThan(0);

    // Search for a specific broker
    await page.fill('#broker-quick-search', 'Luna');

    // Wait for search results
    await page.waitForTimeout(500); // Debounce delay

    // Verify filtered results
    const filteredCount = await page.locator('.broker-row').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // If results found, verify they contain the search term
    if (filteredCount > 0) {
      const firstResult = page.locator('.broker-row').first();
      const text = await firstResult.textContent();
      expect(text?.toLowerCase()).toContain('luna');
    }
  });

  test('should show advanced search options', async ({ page }) => {
    // Toggle advanced search
    await page.click('#toggle-broker-advanced-search');

    // Verify advanced search form appears
    await expect(page.locator('#broker-advanced-search')).toBeVisible();
    await expect(page.locator('#broker-search-name')).toBeVisible();
    await expect(page.locator('#broker-search-specialization')).toBeVisible();
    await expect(page.locator('#broker-search-commission-min')).toBeVisible();
    await expect(page.locator('#broker-search-commission-max')).toBeVisible();

    // Verify search and clear buttons
    await expect(page.locator('#search-brokers-btn')).toBeVisible();
    await expect(page.locator('#clear-broker-search-btn')).toBeVisible();
  });

  test('should filter brokers using advanced search', async ({ page }) => {
    await page.click('#toggle-broker-advanced-search');
    await expect(page.locator('#broker-advanced-search')).toBeVisible();

    // Wait for brokers to load
    await page.waitForSelector('.broker-row');
    const initialCount = await page.locator('.broker-row').count();

    // Search by specialization
    await page.fill('#broker-search-specialization', 'Commercial');
    await page.click('#search-brokers-btn');

    // Wait for search results
    await page.waitForTimeout(500);

    // Verify results are filtered
    const filteredRows = page.locator('.broker-row');
    const filteredCount = await filteredRows.count();

    if (filteredCount > 0) {
      // Verify results contain the specialization
      for (let i = 0; i < filteredCount; i++) {
        const row = filteredRows.nth(i);
        const text = await row.textContent();
        expect(text?.toLowerCase()).toContain('commercial');
      }
    }
  });

  test('should edit an existing broker', async ({ page }) => {
    // Wait for brokers to load
    await page.waitForSelector('.broker-row');

    // Click edit button on first broker
    await page.click('.broker-row .edit-broker-btn');

    // Verify edit modal opens
    await expect(page.locator('#broker-modal')).toBeVisible();
    await expect(page.locator('#broker-modal h3')).toContainText('Edit Broker');

    // Verify form is populated with existing data
    const nameValue = await page.locator('#broker-name').inputValue();
    expect(nameValue).not.toBe('');

    // Update broker name
    const updatedName = 'Updated Broker Name';
    await page.fill('#broker-name', updatedName);

    // Save changes
    await page.click('#save-broker-btn');

    // Verify modal closes and success message
    await expect(page.locator('#broker-modal')).toBeHidden();
    await expect(page.locator('.toast.success')).toContainText('Broker updated successfully');

    // Verify updated name appears in table
    await expect(page.locator('.broker-row')).toContainText(updatedName);
  });

  test('should delete a broker with confirmation', async ({ page }) => {
    // Wait for brokers to load
    await page.waitForSelector('.broker-row');
    const initialCount = await page.locator('.broker-row').count();

    // Click delete button on first broker
    await page.click('.broker-row .delete-broker-btn');

    // Handle confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('delete this broker');
      await dialog.accept();
    });

    // Wait for deletion to complete
    await page.waitForTimeout(500);

    // Verify broker count decreased
    const newCount = await page.locator('.broker-row').count();
    expect(newCount).toBe(initialCount - 1);

    // Verify success message
    await expect(page.locator('.toast.success')).toContainText('Broker deleted successfully');
  });

  test('should require brokers for policy creation', async ({ page }) => {
    // Navigate to policies section
    await page.click('[data-section="policies"]');
    await expect(page.locator('#policies-section')).toBeVisible();

    // Click add policy button
    await page.click('#add-policy-btn');
    await expect(page.locator('#policy-modal')).toBeVisible();

    // Verify broker dropdown exists and is required
    await expect(page.locator('#policy-broker')).toBeVisible();

    // Try to submit without selecting broker
    await page.click('#save-policy-btn');

    // Verify validation error for missing broker
    await expect(page.locator('.field-error')).toContainText('broker');
  });

  test('should clear search results', async ({ page }) => {
    // Perform a search first
    await page.fill('#broker-quick-search', 'test search');
    await page.waitForTimeout(500);

    // Clear the search
    await page.fill('#broker-quick-search', '');
    await page.waitForTimeout(500);

    // Verify all brokers are shown again
    const brokerRows = await page.locator('.broker-row').count();
    expect(brokerRows).toBeGreaterThan(0);
  });
});

test.describe('Broker API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Login as admin
    await page.fill('#login-email', 'admin@chubb.com');
    await page.fill('#login-password', 'admin');
    await page.click('.login-submit-btn');
    await expect(page.locator('#main-app')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock network failure for broker API
    await page.route('**/api/brokers', route => {
      route.abort('failed');
    });

    // Navigate to brokers section
    await page.click('[data-section="brokers"]');

    // Verify error handling
    await expect(page.locator('.toast.error')).toBeVisible();
    await expect(page.locator('#broker-results')).toContainText('No brokers found');
  });

  test('should validate email format on backend', async ({ page }) => {
    await page.click('[data-section="brokers"]');
    await page.click('#add-broker-btn');

    // Fill form with invalid email
    await page.fill('#broker-name', 'Test Broker');
    await page.fill('#broker-email', 'invalid-email-format');
    await page.fill('#broker-phone', '555-123-4567');
    await page.fill('#broker-license', 'LIC123');

    await page.click('#save-broker-btn');

    // Verify backend validation error
    await expect(page.locator('.toast.error')).toContainText('valid email');
  });
});