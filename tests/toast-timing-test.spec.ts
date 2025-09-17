import { test, expect } from '@playwright/test';

test.describe('Toast Timing Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Loading toast should be dismissed when success toast appears', async ({ page }) => {
    console.log('🔍 Testing toast timing sequence...');

    // Login to access dashboard
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Wait for initial dashboard load to complete
    await page.waitForTimeout(3000);

    // Trigger dashboard reload to test toast sequence
    await page.evaluate(() => {
      loadDashboardData();
    });

    // Check for loading toast immediately
    await page.waitForTimeout(100);
    const loadingToast = page.locator('.toast-loading:has-text("Loading dashboard data")');
    const hasLoadingToast = await loadingToast.count() > 0;
    console.log(`Loading toast appeared: ${hasLoadingToast}`);

    // Wait for operation to complete
    await page.waitForTimeout(2000);

    // Check final toast state
    const successToast = page.locator('.toast-success:has-text("Dashboard loaded successfully")');
    const loadingToastStillVisible = await loadingToast.count() > 0;
    const successToastVisible = await successToast.count() > 0;

    console.log(`Loading toast still visible: ${loadingToastStillVisible}`);
    console.log(`Success toast visible: ${successToastVisible}`);

    // The success toast should be visible and loading toast should be gone
    if (successToastVisible && !loadingToastStillVisible) {
      console.log('✅ Toast sequence is correct - loading dismissed, success showing');
    } else if (loadingToastStillVisible && successToastVisible) {
      console.log('❌ ISSUE: Both loading and success toasts are visible');
    } else {
      console.log('⚠️ Unexpected toast state');
    }
  });

  test('Test toast management with multiple operations', async ({ page }) => {
    console.log('🔍 Testing multiple loading operations...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Wait for initial load
    await page.waitForTimeout(2000);

    // Test load customers
    await page.click('[data-action="view-customers"]');
    await page.waitForTimeout(500);

    // Check for customers loading toast
    const customersLoadingToast = page.locator('.toast-loading:has-text("Loading customers")');
    const hasCustomersLoading = await customersLoadingToast.count() > 0;
    console.log(`Customers loading toast: ${hasCustomersLoading}`);

    // Wait for completion
    await page.waitForTimeout(2000);

    // Check final state
    const successToasts = page.locator('.toast-success');
    const loadingToasts = page.locator('.toast-loading');

    const successCount = await successToasts.count();
    const loadingCount = await loadingToasts.count();

    console.log(`Final state - Success toasts: ${successCount}, Loading toasts: ${loadingCount}`);

    if (loadingCount === 0) {
      console.log('✅ All loading toasts properly dismissed');
    } else {
      console.log('❌ Some loading toasts are still visible');
    }
  });

  test('Test customer registration toast sequence', async ({ page }) => {
    console.log('🔍 Testing customer registration toast sequence...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Open customer form
    await page.click('[data-action="add-customer"]');
    await page.waitForTimeout(1000);

    if (await page.locator('#modal-overlay').isVisible()) {
      // Fill form quickly
      await page.fill('#customer-email', 'test@toast.com');
      await page.fill('#customer-password', 'testpass123');
      await page.fill('#first-name', 'Toast');
      await page.fill('#last-name', 'Test');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait a moment for any loading toast
      await page.waitForTimeout(500);

      // Check for registering toast
      const registeringToast = page.locator('.toast-loading:has-text("Registering customer")');
      const hasRegisteringToast = await registeringToast.count() > 0;
      console.log(`Registering customer toast: ${hasRegisteringToast}`);

      // Wait for completion
      await page.waitForTimeout(3000);

      // Check final toast state
      const allToasts = await page.locator('.toast').count();
      const loadingToasts = await page.locator('.toast-loading').count();
      const successToasts = await page.locator('.toast-success').count();

      console.log(`Final toast count - Total: ${allToasts}, Loading: ${loadingToasts}, Success: ${successToasts}`);

      if (loadingToasts === 0 && successToasts > 0) {
        console.log('✅ Customer registration toast sequence correct');
      } else {
        console.log('❌ Toast sequence issues detected');
      }
    }
  });

  test('Test toast visual behavior', async ({ page }) => {
    console.log('🔍 Testing toast visual behavior...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Monitor toast container
    const toastContainer = page.locator('#toast-container');
    await expect(toastContainer).toBeVisible();

    // Trigger operation that creates loading then success toast
    await page.evaluate(() => {
      // Simulate the problematic sequence
      showToast('Loading test operation...', 'loading', 5000);
      setTimeout(() => {
        showToast('Operation completed successfully', 'success');
      }, 1000);
    });

    await page.waitForTimeout(500);

    // Check immediate state (should have loading toast)
    const initialLoadingCount = await page.locator('.toast-loading').count();
    console.log(`Initial loading toasts: ${initialLoadingCount}`);

    // Wait for success toast
    await page.waitForTimeout(1500);

    // Check final state
    const finalLoadingCount = await page.locator('.toast-loading').count();
    const finalSuccessCount = await page.locator('.toast-success').count();

    console.log(`Final state - Loading: ${finalLoadingCount}, Success: ${finalSuccessCount}`);

    if (finalLoadingCount === 0 && finalSuccessCount > 0) {
      console.log('✅ Toast replacement working correctly');
    } else {
      console.log('❌ Toast replacement not working properly');
    }
  });
});