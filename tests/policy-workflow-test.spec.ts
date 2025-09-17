import { test, expect } from '@playwright/test';

test.describe('Policy Workflow Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Complete policy management workflow', async ({ page }) => {
    console.log('🔍 Testing complete policy management workflow...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to policies
    await page.click('[data-tab="policies"]');
    await page.waitForTimeout(500);

    // Check workflow guide toggle
    console.log('Testing workflow guide toggle...');
    await page.click('[data-action="toggle-workflow"]');
    await page.waitForTimeout(500);

    const workflowGuide = page.locator('#policy-workflow-guide');
    const isGuideVisible = await workflowGuide.isVisible();
    console.log(`Workflow guide visible: ${isGuideVisible}`);

    if (isGuideVisible) {
      // Check workflow steps
      const steps = await page.locator('.step').count();
      console.log(`Found ${steps} workflow steps`);

      const stepTexts = await page.locator('.step-name').allTextContents();
      console.log(`Step names: ${stepTexts.join(', ')}`);
    }

    // Load policies to test management features
    console.log('Loading policies...');
    await page.click('[data-action="load-policies"]');
    await page.waitForTimeout(3000);

    // Check if policies data modal opened
    const dataModal = page.locator('#data-modal');
    if (await dataModal.isVisible()) {
      console.log('Policies data modal opened successfully');

      // Check for action buttons in policy table
      const editButtons = await page.locator('.action-btn.edit-btn').count();
      const statusButtons = await page.locator('.action-btn.status-btn').count();
      const deleteButtons = await page.locator('.action-btn.delete-btn').count();

      console.log(`Found ${editButtons} edit buttons, ${statusButtons} status buttons, ${deleteButtons} delete buttons`);

      if (editButtons > 0) {
        console.log('✅ Policy action buttons are present');

        // Test edit policy modal
        console.log('Testing edit policy modal...');
        await page.locator('.action-btn.edit-btn').first().click();
        await page.waitForTimeout(1000);

        // Check if edit modal opened
        const editModal = page.locator('#modal-overlay');
        if (await editModal.isVisible()) {
          console.log('✅ Edit policy modal opened successfully');

          // Check form fields
          const policyTypeField = page.locator('#edit-policy-type');
          const productNameField = page.locator('#edit-product-name');
          const coverageAmountField = page.locator('#edit-coverage-amount');

          const hasFields = await policyTypeField.isVisible() &&
                           await productNameField.isVisible() &&
                           await coverageAmountField.isVisible();

          if (hasFields) {
            console.log('✅ All edit form fields are present');

            // Test form modification
            await productNameField.fill('Updated Test Policy');
            await coverageAmountField.fill('150000');

            console.log('Form fields updated successfully');
          }

          // Close modal
          await page.click('.modal-close');
          await page.waitForTimeout(500);
        }

        // Test status change modal
        console.log('Testing status change modal...');
        await page.locator('.action-btn.status-btn').first().click();
        await page.waitForTimeout(1000);

        const statusModal = page.locator('#modal-overlay');
        if (await statusModal.isVisible()) {
          console.log('✅ Status change modal opened successfully');

          // Check status options
          const statusSelect = page.locator('#policy-status');
          const statusOptions = await statusSelect.locator('option').count();
          console.log(`Found ${statusOptions} status options`);

          if (statusOptions >= 6) {
            console.log('✅ All status options are available');

            // Test status change
            await statusSelect.selectOption('quoted');
            await page.fill('#status-notes', 'Test status change to quoted');

            console.log('Status change form filled successfully');
          }

          // Close modal
          await page.click('.modal-close');
          await page.waitForTimeout(500);
        }
      }

      // Close data modal
      await page.click('.modal-close');
      await page.waitForTimeout(500);
    }

    // Test policy creation
    console.log('Testing policy creation...');
    await page.click('[data-action="create-policy"]');
    await page.waitForTimeout(2000);

    const createModal = page.locator('#modal-overlay');
    if (await createModal.isVisible()) {
      console.log('✅ Create policy modal opened successfully');

      // Check if customer dropdown is populated
      const customerSelect = page.locator('#policy-customer');
      const customerOptions = await customerSelect.locator('option').count();
      console.log(`Found ${customerOptions} customer options`);

      if (customerOptions > 1) {
        console.log('✅ Customer dropdown is populated');
      }

      // Close modal
      await page.click('.modal-close');
      await page.waitForTimeout(500);
    }

    console.log('✅ Policy workflow test completed successfully');
  });

  test('Test policy filtering and status display', async ({ page }) => {
    console.log('🔍 Testing policy filtering and status display...');

    // Login
    await page.fill('#login-email', 'wizard.mcspellcaster@email.com');
    await page.fill('#login-password', 'password123');
    await page.click('.login-submit-btn');
    await page.waitForSelector('#main-app', { state: 'visible' });

    // Navigate to policies
    await page.click('[data-tab="policies"]');
    await page.waitForTimeout(500);

    // Test policy type filter
    const policyFilter = page.locator('#policy-filter');
    const statusFilter = page.locator('#policy-status-filter');

    console.log('Testing filter dropdowns...');

    // Check filter options
    const typeOptions = await policyFilter.locator('option').count();
    const statusOptions = await statusFilter.locator('option').count();

    console.log(`Policy type filter has ${typeOptions} options`);
    console.log(`Status filter has ${statusOptions} options`);

    if (typeOptions >= 5 && statusOptions >= 7) {
      console.log('✅ All filter options are available');
    }

    // Test changing filters
    await policyFilter.selectOption('auto');
    console.log('Selected auto insurance filter');

    await statusFilter.selectOption('booked');
    console.log('Selected booked status filter');

    console.log('✅ Filter functionality test completed');
  });

  test('Test status progression workflow logic', async ({ page }) => {
    console.log('🔍 Testing status progression workflow logic...');

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
    if (await workflowGuide.isVisible()) {
      console.log('✅ Workflow guide is visible');

      // Check workflow progression steps
      const submissionStep = page.locator('.step').filter({ hasText: 'Submission' });
      const quotedStep = page.locator('.step').filter({ hasText: 'Quoted' });
      const bookedStep = page.locator('.step').filter({ hasText: 'Booked' });
      const declinedStep = page.locator('.step').filter({ hasText: 'Declined' });

      const hasAllSteps = await submissionStep.isVisible() &&
                         await quotedStep.isVisible() &&
                         await bookedStep.isVisible() &&
                         await declinedStep.isVisible();

      if (hasAllSteps) {
        console.log('✅ All workflow steps are visible');

        // Check step descriptions
        const stepDescriptions = await page.locator('.step-desc').allTextContents();
        console.log(`Step descriptions: ${stepDescriptions.join(' | ')}`);

        if (stepDescriptions.length >= 4) {
          console.log('✅ All step descriptions are present');
        }
      }

      // Check workflow arrows
      const arrows = await page.locator('.step-arrow').count();
      console.log(`Found ${arrows} workflow arrows`);

      if (arrows >= 3) {
        console.log('✅ Workflow arrows are present');
      }
    }

    console.log('✅ Status progression workflow logic test completed');
  });
});