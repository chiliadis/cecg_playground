# Testing Playground

A web application designed for automation testers and analysts to practice their testing skills. Built with Node.js, TypeScript, Express, and SQLite.

## Features

- **User Management**: Create, authenticate, and manage users
- **Product Catalog**: Browse, search, and filter products
- **Order Processing**: Create orders and track status updates
- **API Testing**: Test various endpoints with different scenarios
- **Error Testing**: Practice handling error cases and validation
- **Interactive Frontend**: Web interface for manual testing scenarios

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=term` - Search products
- `POST /api/products` - Create new product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

## Sample Data

The application comes with pre-seeded data including:

### Test Users
- `testuser` / `testpass123` (user role)
- `admin` / `admin123` (admin role)
- `tester1` / `test123` (tester role)
- `analyst1` / `analyst123` (user role)
- `automation` / `auto123` (tester role)

### Sample Products
- Electronics (laptops, mice, keyboards, webcams, headphones)
- Accessories (stands, hubs, lamps)
- Storage devices

### Sample Orders
- Various order statuses (pending, processing, shipped, delivered)
- Different item combinations and quantities

## Testing Scenarios

The playground provides various testing scenarios:

1. **Happy Path Testing**
   - Create users with valid data
   - Login with correct credentials
   - Browse and search products
   - Create orders successfully

2. **Error Testing**
   - Invalid user data
   - Wrong login credentials
   - Non-existent resource requests
   - Invalid product searches

3. **Edge Cases**
   - Empty search queries
   - Negative product prices
   - Large order quantities
   - Special characters in inputs

4. **API Testing**
   - All endpoint responses
   - Error status codes
   - Data validation
   - Response formatting

## Development

### Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

### Project Structure

```
src/
├── server.ts          # Main server file
├── database.ts        # SQLite database setup and helpers
├── seedData.ts        # Sample data for testing
└── routes/
    └── api.ts         # API endpoint definitions

public/
├── index.html         # Frontend interface
├── styles.css         # Styling
└── app.js            # Frontend JavaScript

data/
└── playground.db      # SQLite database (auto-created)
```

## Use Cases

Perfect for:
- **QA Engineers** practicing manual and automated testing
- **Test Automation** learning API testing
- **Performance Testing** with realistic data
- **Security Testing** exploring injection and validation
- **Training Sessions** for new team members
- **Interview Preparation** for testing roles

## Contributing

Feel free to add more test scenarios, improve the UI, or enhance the API endpoints to create more comprehensive testing opportunities.