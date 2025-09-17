# Playwright Tests for Chubb Testing Playground

This directory contains end-to-end tests for the Chubb Insurance Portal login functionality using Playwright with TypeScript.

## Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

3. **Ensure the development server is running**:
   ```bash
   npm run dev
   ```
   The server should be running on `http://localhost:3000`

## Running Tests

### Basic test execution:
```bash
npm test
```

### Run tests with browser UI visible (headed mode):
```bash
npm run test:headed
```

### Open Playwright Test UI for interactive testing:
```bash
npm run test:ui
```

### Debug tests step-by-step:
```bash
npm run test:debug
```

### View test report:
```bash
npm run test:report
```

## Test Structure

### `login.spec.ts`
Comprehensive test suite covering:

1. **Initial Load**
   - Verifies login screen displays on first visit
   - Checks that main app is hidden until login

2. **UI Elements**
   - Validates presence of login form elements
   - Confirms sample credentials are displayed

3. **Valid Login**
   - Tests successful login with correct credentials
   - Verifies navigation to main application
   - Checks user welcome message

4. **Invalid Login**
   - Tests error handling for wrong credentials
   - Validates error messages display correctly

5. **Form Validation**
   - Email format validation
   - Required field validation

6. **Session Management**
   - Login persistence after page refresh
   - Logout functionality

7. **Feature Testing**
   - Tests Load Customers button after login
   - Validates main app functionality

8. **Error Handling**
   - Network error simulation
   - Graceful error handling

## Test Data

The tests use these sample credentials:
- **Email**: `wizard.mcspellcaster@email.com`
- **Password**: `password123`

These correspond to the seeded test data in the application.

## Configuration

### `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Viewport: 1280x720
- Trace collection on retry
- HTML reporter

### `test-setup.ts`
- Custom test fixtures
- Global page configuration
- Default timeouts and viewport settings

## Running Individual Tests

To run specific test cases:

```bash
# Run only login screen tests
npx playwright test --grep "should display login screen"

# Run only validation tests
npx playwright test --grep "validate"

# Run tests for specific browser
npx playwright test --project=chromium
```

## Debugging

1. **Use headed mode** to see tests running:
   ```bash
   npm run test:headed
   ```

2. **Use debug mode** for step-by-step execution:
   ```bash
   npm run test:debug
   ```

3. **View traces** in Playwright UI:
   ```bash
   npm run test:ui
   ```

## Continuous Integration

These tests are designed to run in CI environments. The configuration automatically:
- Retries failed tests 2 times in CI
- Uses single worker in CI for stability
- Fails build if `test.only` is found

## Best Practices

1. **Keep tests isolated** - Each test clears localStorage
2. **Use data-testid attributes** - For reliable element selection
3. **Wait for elements** - Use proper waiting strategies
4. **Test real user flows** - Focus on actual user scenarios
5. **Handle async operations** - Properly wait for API calls and navigation

## Troubleshooting

### Common Issues:

1. **Server not running**:
   - Ensure `npm run dev` is running on port 3000

2. **Browser not found**:
   - Run `npx playwright install`

3. **Test timeouts**:
   - Check server is responsive
   - Increase timeout in playwright.config.ts if needed

4. **Network issues**:
   - Verify database is seeded with test data
   - Check API endpoints are responding