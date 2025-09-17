# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with nodemon auto-reload on port 3000
- `npm run build` - Compile TypeScript to JavaScript (outputs to `dist/`)
- `npm start` - Start production server using compiled JavaScript
- `npm install` - Install dependencies
- `npm test` - Run Playwright end-to-end tests
- `npm run test:headed` - Run tests with browser UI visible
- `npm run test:ui` - Open Playwright Test UI for interactive testing
- `npm run test:debug` - Debug tests step-by-step
- `npm run test:report` - View test report

## Project Architecture

This is a Chubb Insurance testing playground web application built with Express.js, TypeScript, and SQLite, designed for QA engineers and testers to practice automation and manual testing skills in an insurance domain context.

### Core Structure

**Backend (Node.js/Express/TypeScript):**
- `src/server.ts` - Main Express server with security middleware (CORS, Helmet, Morgan)
- `src/database.ts` - SQLite database initialization, table creation, and query helpers
- `src/routes/api.ts` - Complete REST API endpoints for insurance operations
- `src/seedData.ts` - Pre-populated realistic insurance test data

**Database Schema (SQLite):**
- `customers` table - Customer management with KYC status, employment, income
- `agents` table - Insurance agents with territories and commission rates
- `policies` table - Insurance policies with underwriting status and risk scores
- `claims` table - Claims processing with adjuster assignment and status tracking
- `coverage_details` table - Detailed coverage breakdown for policies
- `claim_documents` table - Document management for claims
- `admins` table - Administrative user accounts with role-based access

**Frontend (Vanilla HTML/CSS/JS):**
- `public/index.html` - Comprehensive insurance portal interface
- `public/app.js` - Frontend JavaScript with advanced form validation and API interactions
- `public/styles.css` - Professional insurance portal styling
- `public/simple.html` - Simplified testing interface
- `public/app-simple.js` - Basic functionality for simple interface

**Testing Infrastructure:**
- `tests/login.spec.ts` - Comprehensive Playwright test suite for login functionality
- `tests/test-setup.ts` - Custom test fixtures and global configuration
- `tests/README.md` - Detailed testing documentation
- `playwright.config.ts` - Playwright configuration for multiple browsers

### Key Features

**Insurance Domain:**
- Complete customer lifecycle management
- Policy creation and underwriting workflows
- Claims submission and processing
- Quote calculation engine
- Agent assignment and management
- Risk assessment and scoring

**API Endpoints:** Full REST API with comprehensive error handling, validation, and different response scenarios including authentication, CRUD operations, search functionality, and complex data relationships.

**Database:** SQLite database with proper foreign key relationships, pre-seeded with realistic insurance test data including multiple customer types, policy statuses, and claim scenarios.

**Testing Scenarios:** Built-in support for happy path testing, error handling, edge cases, API testing with intentional validation scenarios, and comprehensive E2E test coverage.

### Customer Management (Full CRUD Operations)

**Create Customers:**
- Comprehensive customer registration form with insurance-specific fields
- Real-time field validation with popup error messages
- Email format validation, password strength requirements
- Phone number formatting and validation
- SSN, employment status, and income validation
- Credit score and KYC status tracking

**Read Customers:**
- View all customers in paginated data tables with agent information
- Individual customer detail views with associated policies and claims
- Advanced search and filter functionality
- Export customer data to CSV format
- Policy and claim count display

**Update Customers:**
- Edit customer information through modal forms
- Validate all fields with real-time feedback
- Optional password updates (leave blank to keep current)
- Update contact information, employment status, income, credit score
- Address and demographic information management

**Delete Customers:**
- Delete customers with confirmation dialogs
- Cascading deletion of associated policies and claims
- Clear warning messages about data relationships
- Referential integrity enforcement

**Reset Database:**
- One-click database reset button in header
- Clears all current data and restores fresh test data
- Includes confirmation dialog with clear warnings
- Automatically refreshes dashboard after reset
- Useful for starting fresh testing scenarios

### Validation Features

**Real-Time Validation:**
- Email validation: Must contain @ symbol and domain with proper format
- Password validation: Minimum 6 characters with at least one number
- Phone validation: 10-digit US format with flexible input formatting
- Name validation: Letters, spaces, hyphens, and apostrophes only
- Date validation: Must be past dates for birth dates
- Numeric validation: Proper formatting for income and amounts
- Real-time validation: Triggers on field blur for immediate feedback
- Visual feedback: Red/green borders and popup messages for invalid/valid fields

**Enhanced Validation Features:**
- Validation icons (✓, ✗, ⚠) for immediate visual feedback
- Context-sensitive error messages
- Form-wide validation before submission
- SSN format validation
- Credit score range validation (300-850)
- Employment status dropdown validation

### Insurance API Endpoints

**Customer Operations:**
- `GET /api/customers` - Get all customers with agent information
- `GET /api/customers/:id` - Get specific customer with policies and claims
- `POST /api/customers` - Create new customer
- `PUT /api/admin/customers/:id` - Update customer information
- `DELETE /api/admin/customers/:id` - Delete customer (cascading)

**Authentication:**
- `POST /api/auth/login` - Customer login authentication
- `POST /api/admin/login` - Admin authentication

**Policy Management:**
- `GET /api/policies` - Get all policies (filterable by customer, type, status)
- `GET /api/policies/:id` - Get specific policy with coverage details
- `GET /api/policies/search` - Search policies by various criteria
- `POST /api/policies` - Create new policy
- `PUT /api/policies/:id/underwriting` - Update underwriting status

**Claims Processing:**
- `GET /api/claims` - Get all claims (filterable by status, priority)
- `GET /api/claims/:id` - Get specific claim with documents
- `POST /api/claims` - Submit new claim
- `PUT /api/claims/:id/status` - Update claim status and approved amounts

**Quoting and Agents:**
- `GET /api/quotes` - Calculate insurance quotes with risk assessment
- `GET /api/agents` - Get all active agents

**Administrative:**
- `POST /api/admin/reset-database` - Reset database to fresh test data
- `GET /api/health` - API health check

### Test Data

The application includes memorable and realistic insurance test data:

**Sample Customers:**
- Wizard McSpellcaster (wizard.mcspellcaster@email.com) - password123
- Captain Awesome (captain.awesome@email.com) - secure456
- Ninja Stealthmaster (ninja.stealthmaster@email.com) - mypass789
- Princess Sparkles (princess.sparkles@email.com) - pass2023
- Bob TheCoolestGuy (bob.thecoolestguy@email.com) - coolpass123
- Lady Dragonslayer (lady.dragonslayer@email.com) - dragonfire99

**Sample Agents:**
- Luna Stormweaver (Northeast territory)
- Phoenix Dragonheart (West Coast territory)
- Aria Moonwhisper (Southeast territory)
- Zara Brightforge (Midwest territory)
- Kai Shadowbane (Southwest territory)

**Admin Credentials:**
- Username: admin, Password: admin (Super Admin access)

### Testing Framework

**Playwright E2E Tests:**
- Comprehensive login functionality testing
- Form validation testing
- Session management testing
- Network error handling
- Multi-browser testing (Chromium, Firefox, WebKit)
- Visual regression testing capabilities
- CI/CD integration ready

**Test Coverage:**
- Initial page load verification
- Authentication workflows (valid/invalid credentials)
- Form validation (email format, required fields)
- Session persistence across page refreshes
- Logout functionality
- Error handling and graceful degradation
- Network failure simulation

### Development Notes

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety
- SQLite database with auto-initialization
- Vanilla JavaScript frontend (no frameworks for maximum compatibility)
- Playwright for end-to-end testing
- Security middleware (Helmet, CORS, Morgan)

**Database:**
- Auto-initializes on startup and seeds with test data
- All TypeScript compiles to `dist/` directory
- Uses CommonJS modules (`type: "commonjs"` in package.json)
- SQLite database file created at `data/insurance.db`
- Foreign key constraints enforced
- Automatic timestamp tracking

**Frontend:**
- Express serves static files from `public/` directory
- Development server includes auto-reload via nodemon
- Responsive design with mobile considerations
- Accessibility features (ARIA labels, keyboard navigation)
- Progressive enhancement approach

**Code Quality:**
- TypeScript strict mode enabled
- Comprehensive error handling
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- XSS protection through proper encoding