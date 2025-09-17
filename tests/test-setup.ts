import { test as base } from '@playwright/test';

// Extend basic test by providing a "page" fixture with pre-configured settings
export const test = base.extend({
  page: async ({ page }, use) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });

    // Set timeout for actions
    page.setDefaultTimeout(10000);

    // Add any global page setup here
    await use(page);
  },
});

export { expect } from '@playwright/test';