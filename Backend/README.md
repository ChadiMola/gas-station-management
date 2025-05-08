# Gas Station Management System Backend

A comprehensive backend API for managing gas station operations built with Node.js, Express.js, PostgreSQL, and Sequelize ORM.

## Features

- User authentication with JWT
- Role-based access control (Admin, Super Admin)
- Pump management
- Transaction tracking and reporting
- Inventory management
- Automated low stock alerts

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **PostgreSQL**: Database
- **Sequelize**: ORM for database operations
- **JWT**: User authentication

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)

## Setup Instructions

### 1. Database Setup

Make sure PostgreSQL is installed and running. Then create a database:

```bash
createdb gas_station_db
```

Or you can create the database using the Sequelize CLI:

```bash
npm run db:create
```

### 2. Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following fields:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Port for the server to run on (default: 5000)

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Migrations and Seed Data

```bash
npm run db:migrate
npm run db:seed
```

This will create all required tables and populate them with initial data including:

- Admin users
- Sample pumps
- Sample inventory items

### 5. Start the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user details

### Pumps

- `GET /api/pumps` - Get all pumps
- `GET /api/pumps/:id` - Get pump details
- `POST /api/pumps` - Create a new pump (Admin only)
- `PUT /api/pumps/:id` - Update a pump (Admin only)
- `DELETE /api/pumps/:id` - Delete a pump (Admin only)

### Transactions

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/report` - Generate sales report

### Inventory

- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get inventory item details
- `POST /api/inventory` - Create a new inventory item (Admin only)
- `PUT /api/inventory/:id` - Update an inventory item (Admin only)
- `DELETE /api/inventory/:id` - Delete an inventory item (Admin only)
- `GET /api/inventory/low-stock` - Get low stock inventory items

## Default Admin Credentials

Use these credentials to login to the system:

- Admin User:

  - Email: admin@gasstation.com
  - Password: Admin123!

- Super Admin:
  - Email: superadmin@gasstation.com
  - Password: SuperAdmin123!

## License

MIT
