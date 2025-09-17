# Chubb Insurance Testing Playground - Architecture Document

## Overview

The Chubb Insurance Testing Playground is a comprehensive web application designed specifically for QA engineers and testers to practice automation and manual testing skills within an insurance domain context. This document provides a detailed technical architecture overview of the system.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                       │
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │   Main Interface    │  │     Test Interface           │ │
│  │   (index.html)      │  │    (simple.html)             │ │
│  │   - Login/Auth      │  │    - Basic Functionality     │ │
│  │   - Customer CRUD   │  │    - Testing Focus           │ │
│  │   - Policy Mgmt     │  │                               │ │
│  │   - Claims Process  │  │                               │ │
│  │   - Quote Calc      │  │                               │ │
│  └─────────────────────┘  └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Server                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Security Middleware                        │ │
│  │   - Helmet (Security Headers)                          │ │
│  │   - CORS (Cross-Origin Resource Sharing)               │ │
│  │   - Morgan (HTTP Request Logging)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  API Router                             │ │
│  │   - Authentication Endpoints                           │ │
│  │   - Customer Management                                │ │
│  │   - Policy Operations                                  │ │
│  │   - Claims Processing                                  │ │
│  │   - Quote Generation                                   │ │
│  │   - Administrative Functions                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               Static File Server                        │ │
│  │   - HTML/CSS/JS Assets                                 │ │
│  │   - Public Directory Serving                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              │
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 Insurance Schema                        │ │
│  │   - customers (Customer data & KYC)                    │ │
│  │   - agents (Insurance agents)                          │ │
│  │   - policies (Insurance policies)                      │ │
│  │   - claims (Claims processing)                         │ │
│  │   - coverage_details (Policy coverage)                 │ │
│  │   - claim_documents (Document mgmt)                    │ │
│  │   - admins (Administrative users)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | Latest LTS | JavaScript runtime environment |
| **Framework** | Express.js | ^5.1.0 | Web application framework |
| **Language** | TypeScript | ^5.9.2 | Type-safe JavaScript development |
| **Database** | SQLite3 | ^5.1.7 | Embedded database for data persistence |
| **Security** | Helmet | ^8.1.0 | Security headers middleware |
| **CORS** | CORS | ^2.8.5 | Cross-origin resource sharing |
| **Logging** | Morgan | ^1.10.1 | HTTP request logging |

### Frontend Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Language** | Vanilla JavaScript | Maximum compatibility, no framework dependencies |
| **Styling** | CSS3 | Modern styling with responsive design |
| **HTML** | HTML5 | Semantic markup with accessibility features |
| **Validation** | Custom JS | Real-time form validation with visual feedback |

### Testing Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **E2E Testing** | Playwright | ^1.55.0 | Cross-browser end-to-end testing |
| **Test Runner** | Playwright Test | ^1.55.0 | Test execution and reporting |
| **Type Support** | @types/* | Various | TypeScript type definitions |

### Development Tools

| Tool | Purpose |
|------|---------|
| **nodemon** | Development server with auto-reload |
| **TypeScript Compiler** | Source code compilation |
| **ts-node** | TypeScript execution for development |

## Database Architecture

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     admins      │       │     agents      │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ username        │       │ agent_code      │
│ password        │       │ first_name      │
│ email           │       │ last_name       │
│ first_name      │       │ email           │
│ last_name       │       │ phone           │
│ role            │       │ license_number  │
│ is_super_admin  │       │ commission_rate │
│ is_active       │       │ territory       │
│ created_at      │       │ status          │
│ updated_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘
                                   │
                                   │ 1:N
                                   │
┌─────────────────────────────────────────────────────────────┐
│                      customers                               │
│─────────────────────────────────────────────────────────────│
│ id (PK)                                                     │
│ customer_number                                             │
│ email                                                       │
│ password                                                    │
│ first_name, last_name                                       │
│ date_of_birth                                               │
│ phone, address, city, state, zip_code                       │
│ ssn                                                         │
│ employment_status, annual_income, credit_score              │
│ kyc_status, customer_type                                   │
│ agent_id (FK) → agents.id                                   │
│ created_at, updated_at                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              │
┌─────────────────────────────────────────────────────────────┐
│                       policies                              │
│─────────────────────────────────────────────────────────────│
│ id (PK)                                                     │
│ policy_number                                               │
│ customer_id (FK) → customers.id                             │
│ policy_type, product_name                                   │
│ coverage_amount, premium_amount, deductible                 │
│ policy_term                                                 │
│ start_date, end_date                                        │
│ status, underwriting_status, risk_score                     │
│ notes                                                       │
│ created_at, updated_at                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N                    1:N
                              │                         │
            ┌─────────────────────┐          ┌─────────────────┐
            │   coverage_details   │          │     claims      │
            │─────────────────────│          │─────────────────│
            │ id (PK)             │          │ id (PK)         │
            │ policy_id (FK)      │          │ claim_number    │
            │ coverage_type       │          │ policy_id (FK)  │
            │ coverage_limit      │          │ customer_id (FK)│
            │ deductible          │          │ claim_type      │
            │ premium_portion     │          │ incident_date   │
            │ is_active           │          │ reported_date   │
            └─────────────────────┘          │ claim_amount    │
                                            │ approved_amount │
                                            │ status, priority│
                                            │ adjuster_id     │
                                            │ description     │
                                            │ incident_location│
                                            │ police_report_no│
                                            │ witness_info    │
                                            │ created_at      │
                                            │ updated_at      │
                                            └─────────────────┘
                                                      │
                                                      │ 1:N
                                                      │
                                            ┌─────────────────┐
                                            │ claim_documents │
                                            │─────────────────│
                                            │ id (PK)         │
                                            │ claim_id (FK)   │
                                            │ document_type   │
                                            │ file_name       │
                                            │ file_path       │
                                            │ file_size       │
                                            │ uploaded_at     │
                                            └─────────────────┘
```

### Database Design Principles

1. **Referential Integrity**: All foreign key relationships are properly defined and enforced
2. **Normalization**: Database is normalized to 3NF to minimize redundancy
3. **Audit Trail**: All tables include created_at and updated_at timestamps
4. **Flexible Schema**: Design accommodates various insurance products and claim types
5. **Data Security**: Sensitive data (SSN, passwords) are handled appropriately

## API Architecture

### RESTful Design Principles

The API follows REST conventions with proper HTTP methods and status codes:

- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update existing resources
- **DELETE**: Remove resources

### API Endpoint Structure

```
/api
├── /health                    # Health check
├── /auth
│   ├── /login                # Customer authentication
│   └── /admin/login          # Admin authentication
├── /customers
│   ├── /                     # Customer CRUD operations
│   ├── /:id                  # Individual customer operations
│   └── /admin/*              # Administrative customer operations
├── /policies
│   ├── /                     # Policy management
│   ├── /:id                  # Individual policy operations
│   ├── /search               # Policy search functionality
│   └── /:id/underwriting     # Underwriting status updates
├── /claims
│   ├── /                     # Claims management
│   ├── /:id                  # Individual claim operations
│   └── /:id/status           # Claim status updates
├── /quotes                   # Quote calculation
├── /agents                   # Agent information
└── /admin
    ├── /customers/*          # Administrative customer operations
    └── /reset-database       # Database reset functionality
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "count": number (for collections),
  "error": string (if applicable)
}
```

## Frontend Architecture

### Component Structure

```
public/
├── index.html              # Main application interface
├── simple.html             # Simplified testing interface
├── test.html               # Additional testing interface
├── styles.css              # Comprehensive styling
├── app.js                  # Main application logic
└── app-simple.js           # Simplified application logic
```

### JavaScript Architecture

The frontend follows a modular approach with separation of concerns:

1. **Application Initialization**
   - DOM content loaded event handlers
   - User session management
   - Navigation setup

2. **Authentication Module**
   - Login/logout functionality
   - Session persistence
   - User state management

3. **UI Management**
   - Modal system
   - Navigation handling
   - Toast notifications
   - Form management

4. **Data Management**
   - API communication
   - Data display and formatting
   - CRUD operations

5. **Validation Engine**
   - Real-time form validation
   - Custom validation rules
   - Visual feedback system

### Key Frontend Features

1. **Responsive Design**: Mobile-first approach with progressive enhancement
2. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Error Handling**: Graceful degradation and user-friendly error messages
5. **Real-time Validation**: Immediate feedback for form inputs

## Security Architecture

### Security Measures Implemented

1. **HTTP Security Headers**
   - Helmet.js provides comprehensive security headers
   - Content Security Policy (CSP)
   - X-Frame-Options protection
   - X-XSS-Protection enabled

2. **Input Validation**
   - Server-side validation for all inputs
   - Parameterized queries prevent SQL injection
   - Client-side validation for user experience

3. **Authentication**
   - Simple password-based authentication (suitable for testing environment)
   - Session management with localStorage
   - Role-based access control (admin vs. customer)

4. **Data Protection**
   - Sensitive data handling (SSN, passwords)
   - CORS configuration for cross-origin requests
   - Secure defaults for all configurations

### Security Considerations for Testing Environment

- **Simplified Authentication**: Designed for testing, not production security
- **Clear Credentials**: Test credentials are visible for easy testing access
- **Reset Functionality**: Database can be reset for fresh testing scenarios
- **Audit Logging**: HTTP request logging for debugging and testing

## Testing Architecture

### Test Strategy

The application implements a comprehensive testing strategy:

1. **End-to-End Testing**: Playwright tests covering user workflows
2. **Cross-Browser Testing**: Support for Chromium, Firefox, and WebKit
3. **Visual Testing**: Screenshot comparison capabilities
4. **Performance Testing**: Load time and responsiveness validation

### Test Structure

```
tests/
├── login.spec.ts           # Login functionality tests
├── test-setup.ts           # Test configuration and fixtures
├── README.md               # Testing documentation
└── (future test files)     # Additional test suites
```

### Test Coverage Areas

1. **Authentication Workflows**
   - Valid/invalid login scenarios
   - Session persistence
   - Logout functionality

2. **Form Validation**
   - Input format validation
   - Required field validation
   - Real-time validation feedback

3. **UI Functionality**
   - Navigation between sections
   - Modal operations
   - Data loading and display

4. **Error Handling**
   - Network failure simulation
   - Invalid data scenarios
   - Graceful error recovery

## Performance Considerations

### Frontend Performance

1. **Minimal Dependencies**: Vanilla JavaScript reduces bundle size
2. **Lazy Loading**: Content loaded on demand
3. **Efficient DOM Manipulation**: Minimal reflows and repaints
4. **Optimized Assets**: Compressed CSS and optimized images

### Backend Performance

1. **SQLite Efficiency**: Fast local database operations
2. **Connection Pooling**: Efficient database connection management
3. **Middleware Optimization**: Minimal overhead in request processing
4. **Static File Serving**: Efficient asset delivery

### Database Performance

1. **Indexed Queries**: Proper indexing on frequently queried columns
2. **Query Optimization**: Efficient SQL queries with proper joins
3. **Connection Management**: Single connection instance for SQLite
4. **Data Seeding**: Pre-populated test data for immediate testing

## Deployment Architecture

### Development Environment

```
Development Setup:
├── npm run dev             # Start development server
├── TypeScript compilation  # Auto-compilation with nodemon
├── Live reload            # Automatic server restart
├── Database auto-init     # Automatic schema creation
└── Test data seeding      # Pre-populated test data
```

### Production Considerations

For production deployment, consider:

1. **Environment Variables**: Configuration management
2. **Process Management**: PM2 or similar process manager
3. **Reverse Proxy**: Nginx or Apache for static file serving
4. **Database**: Consider PostgreSQL or MySQL for production
5. **Security**: Enhanced authentication and authorization
6. **Monitoring**: Application and database monitoring
7. **Logging**: Centralized logging solution

## Extensibility and Maintenance

### Code Organization

1. **Modular Structure**: Clear separation of concerns
2. **TypeScript Types**: Strong typing for maintainability
3. **Consistent Patterns**: Standardized code patterns throughout
4. **Documentation**: Comprehensive inline and external documentation

### Extension Points

1. **Additional Test Cases**: Easy to add new Playwright tests
2. **New API Endpoints**: RESTful structure supports expansion
3. **Enhanced Validation**: Modular validation system
4. **Additional Insurance Products**: Flexible schema design
5. **Advanced Features**: Modal system supports complex workflows

### Maintenance Considerations

1. **Database Migrations**: Consider migration system for schema changes
2. **API Versioning**: Plan for API evolution
3. **Test Automation**: Continuous integration ready
4. **Dependency Management**: Regular security updates
5. **Performance Monitoring**: Track application performance over time

## Conclusion

The Chubb Insurance Testing Playground provides a robust, well-architected platform for testing and training in an insurance domain context. The architecture balances simplicity with functionality, making it ideal for educational and testing purposes while maintaining professional standards and best practices.

The system's modular design, comprehensive testing framework, and clear documentation make it an excellent tool for QA engineers to develop and practice their automation and manual testing skills in a realistic insurance application environment.