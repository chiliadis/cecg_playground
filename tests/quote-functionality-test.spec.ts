import { test, expect } from '@playwright/test';

test.describe('Quote Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and login
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');

    await expect(page.locator('#main-app')).toBeVisible();

    // Navigate to quotes section
    await page.click('[data-tab="quotes"]');
    await expect(page.locator('#quotes')).toBeVisible();
  });

  test('should display quote calculator with proper styling', async ({ page }) => {
    // Verify quote section elements
    await expect(page.locator('#quotes h2')).toContainText('Insurance Quote Calculator');

    // Check form container styling
    const formContainer = page.locator('.form-container');
    await expect(formContainer).toBeVisible();

    // Verify all form fields are present
    await expect(page.locator('#quote-policy-type')).toBeVisible();
    await expect(page.locator('#quote-coverage')).toBeVisible();
    await expect(page.locator('#quote-age')).toBeVisible();
    await expect(page.locator('#quote-zip')).toBeVisible();

    // Check button styling
    const calculateBtn = page.locator('button[data-action="calculate-quote"]');
    await expect(calculateBtn).toBeVisible();
    await expect(calculateBtn).toHaveClass(/action-button/);

    // Verify quote result is present but hidden initially
    const quoteResult = page.locator('#quote-result');
    await expect(quoteResult).toBeHidden();
  });

  test('should calculate quote with valid inputs', async ({ page }) => {
    // Fill out quote form
    await page.selectOption('#quote-coverage-type', 'auto');
    await page.fill('#quote-coverage-amount', '50000');
    await page.fill('#quote-age', '30');
    await page.selectOption('#quote-location', 'urban');
    await page.selectOption('#quote-history', 'clean');

    // Calculate quote
    await page.click('#calculate-quote-btn');

    // Wait for quote result
    await page.waitForTimeout(500);

    // Verify quote card appears
    const quoteCard = page.locator('.quote-card');
    await expect(quoteCard).toBeVisible();

    // Verify quote details are displayed
    await expect(quoteCard.locator('h3')).toContainText('Your Insurance Quote');

    // Check quote details structure
    const quoteDetails = quoteCard.locator('.quote-details');
    await expect(quoteDetails).toBeVisible();

    // Verify key details are shown
    await expect(quoteDetails).toContainText('Coverage Type');
    await expect(quoteDetails).toContainText('Coverage Amount');
    await expect(quoteDetails).toContainText('Risk Score');
    await expect(quoteDetails).toContainText('Base Premium');
    await expect(quoteDetails).toContainText('Total Premium');

    // Verify numeric values are reasonable
    const totalPremium = await quoteDetails.locator('.detail-row.highlight .value').textContent();
    expect(totalPremium).toMatch(/\$\d+/); // Should contain dollar amount
  });

  test('should validate required fields', async ({ page }) => {
    // Try to calculate without filling required fields
    await page.click('#calculate-quote-btn');

    // Wait for validation
    await page.waitForTimeout(200);

    // Verify validation errors appear
    await expect(page.locator('.field-error')).toHaveCount(5); // All fields required
  });

  test('should validate numeric fields', async ({ page }) => {
    // Fill invalid numeric values
    await page.fill('#quote-coverage-amount', 'invalid');
    await page.fill('#quote-age', '-5');

    // Trigger validation
    await page.click('#quote-coverage-type');

    // Verify validation feedback
    const coverageAmountField = page.locator('#quote-coverage-amount');
    const ageField = page.locator('#quote-age');

    await expect(coverageAmountField).toHaveClass(/invalid/);
    await expect(ageField).toHaveClass(/invalid/);
  });

  test('should calculate different quotes for different coverage types', async ({ page }) => {
    const testCases = [
      { type: 'auto', amount: '25000', expectedText: 'Auto' },
      { type: 'home', amount: '200000', expectedText: 'Home' },
      { type: 'life', amount: '100000', expectedText: 'Life' }
    ];

    for (const testCase of testCases) {
      // Clear form first
      await page.click('#clear-quote-btn');
      await page.waitForTimeout(200);

      // Fill form for this test case
      await page.selectOption('#quote-coverage-type', testCase.type);
      await page.fill('#quote-coverage-amount', testCase.amount);
      await page.fill('#quote-age', '35');
      await page.selectOption('#quote-location', 'suburban');
      await page.selectOption('#quote-history', 'minor');

      // Calculate quote
      await page.click('#calculate-quote-btn');
      await page.waitForTimeout(500);

      // Verify quote appears with correct coverage type
      const quoteCard = page.locator('.quote-card');
      await expect(quoteCard).toBeVisible();
      await expect(quoteCard).toContainText(testCase.expectedText);

      // Verify premium is calculated (non-zero)
      const totalPremium = await quoteCard.locator('.detail-row.highlight .value').textContent();
      expect(totalPremium).toMatch(/\$[1-9]\d*/); // Should be non-zero dollar amount
    }
  });

  test('should show different premiums based on risk factors', async ({ page }) => {
    // Test high risk scenario
    await page.selectOption('#quote-coverage-type', 'auto');
    await page.fill('#quote-coverage-amount', '50000');
    await page.fill('#quote-age', '18'); // Young driver
    await page.selectOption('#quote-location', 'urban'); // High risk location
    await page.selectOption('#quote-history', 'violations'); // Poor history

    await page.click('#calculate-quote-btn');
    await page.waitForTimeout(500);

    // Get high risk premium
    const highRiskPremium = await page.locator('.detail-row.highlight .value').textContent();
    const highRiskAmount = parseFloat(highRiskPremium?.replace(/[$,]/g, '') || '0');

    // Clear and test low risk scenario
    await page.click('#clear-quote-btn');
    await page.waitForTimeout(200);

    await page.selectOption('#quote-coverage-type', 'auto');
    await page.fill('#quote-coverage-amount', '50000');
    await page.fill('#quote-age', '40'); // Experienced driver
    await page.selectOption('#quote-location', 'rural'); // Low risk location
    await page.selectOption('#quote-history', 'clean'); // Good history

    await page.click('#calculate-quote-btn');
    await page.waitForTimeout(500);

    // Get low risk premium
    const lowRiskPremium = await page.locator('.detail-row.highlight .value').textContent();
    const lowRiskAmount = parseFloat(lowRiskPremium?.replace(/[$,]/g, '') || '0');

    // High risk should cost more than low risk
    expect(highRiskAmount).toBeGreaterThan(lowRiskAmount);
  });

  test('should clear quote form properly', async ({ page }) => {
    // Fill out form
    await page.selectOption('#quote-coverage-type', 'home');
    await page.fill('#quote-coverage-amount', '150000');
    await page.fill('#quote-age', '45');
    await page.selectOption('#quote-location', 'suburban');
    await page.selectOption('#quote-history', 'clean');

    // Calculate quote
    await page.click('#calculate-quote-btn');
    await page.waitForTimeout(500);

    // Verify quote is displayed
    await expect(page.locator('.quote-card')).toBeVisible();

    // Clear form
    await page.click('#clear-quote-btn');
    await page.waitForTimeout(200);

    // Verify form is cleared
    await expect(page.locator('#quote-coverage-type')).toHaveValue('');
    await expect(page.locator('#quote-coverage-amount')).toHaveValue('');
    await expect(page.locator('#quote-age')).toHaveValue('');
    await expect(page.locator('#quote-location')).toHaveValue('');
    await expect(page.locator('#quote-history')).toHaveValue('');

    // Verify quote result is hidden
    await expect(page.locator('.quote-card')).toBeHidden();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/quotes*', route => {
      route.abort('failed');
    });

    // Fill form and try to calculate
    await page.selectOption('#quote-coverage-type', 'auto');
    await page.fill('#quote-coverage-amount', '25000');
    await page.fill('#quote-age', '30');
    await page.selectOption('#quote-location', 'urban');
    await page.selectOption('#quote-history', 'clean');

    await page.click('#calculate-quote-btn');
    await page.waitForTimeout(500);

    // Verify error message appears
    await expect(page.locator('.toast.error')).toContainText('Failed to calculate quote');
  });

  test('should display risk assessment correctly', async ({ page }) => {
    // Fill form with moderate risk
    await page.selectOption('#quote-coverage-type', 'auto');
    await page.fill('#quote-coverage-amount', '30000');
    await page.fill('#quote-age', '25');
    await page.selectOption('#quote-location', 'suburban');
    await page.selectOption('#quote-history', 'minor');

    await page.click('#calculate-quote-btn');
    await page.waitForTimeout(500);

    // Check risk score is displayed
    const riskScore = await page.locator('.detail-row').filter({ hasText: 'Risk Score' }).locator('.value').textContent();
    expect(riskScore).toMatch(/\d+/); // Should be a number

    // Risk score should be reasonable (0-100 scale)
    const riskNumber = parseFloat(riskScore || '0');
    expect(riskNumber).toBeGreaterThanOrEqual(0);
    expect(riskNumber).toBeLessThanOrEqual(100);
  });

  test('should show quote in proper currency format', async ({ page }) => {
    // Calculate a quote
    await page.selectOption('#quote-coverage-type', 'life');
    await page.fill('#quote-coverage-amount', '75000');
    await page.fill('#quote-age', '30');
    await page.selectOption('#quote-location', 'urban');
    await page.selectOption('#quote-history', 'clean');

    await page.click('#calculate-quote-btn');
    await page.waitForTimeout(500);

    // Check all monetary values are properly formatted
    const monetaryValues = page.locator('.detail-row .value').filter({ hasText: /^\$/ });
    const valueCount = await monetaryValues.count();

    for (let i = 0; i < valueCount; i++) {
      const value = await monetaryValues.nth(i).textContent();
      expect(value).toMatch(/^\$[\d,]+(\.\d{2})?$/); // Should match currency format
    }
  });
});

test.describe('Quote API Integration', () => {
  test('should send correct parameters to quote API', async ({ page }) => {
    let requestBody: any = null;

    // Intercept API call
    await page.route('**/api/quotes*', async (route) => {
      const request = route.request();
      const url = request.url();

      // Parse query parameters
      const urlObj = new URL(url);
      requestBody = {
        coverage_type: urlObj.searchParams.get('coverage_type'),
        coverage_amount: urlObj.searchParams.get('coverage_amount'),
        age: urlObj.searchParams.get('age'),
        location: urlObj.searchParams.get('location'),
        history: urlObj.searchParams.get('history')
      };

      route.continue();
    });

    await page.goto('/');
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.click('[data-tab="quotes"]');

    // Fill and submit form
    await page.selectOption('#quote-coverage-type', 'auto');
    await page.fill('#quote-coverage-amount', '40000');
    await page.fill('#quote-age', '28');
    await page.selectOption('#quote-location', 'urban');
    await page.selectOption('#quote-history', 'clean');

    await page.click('#calculate-quote-btn');
    await page.waitForTimeout(1000);

    // Verify correct parameters were sent
    expect(requestBody).not.toBeNull();
    expect(requestBody.coverage_type).toBe('auto');
    expect(requestBody.coverage_amount).toBe('40000');
    expect(requestBody.age).toBe('28');
    expect(requestBody.location).toBe('urban');
    expect(requestBody.history).toBe('clean');
  });
});