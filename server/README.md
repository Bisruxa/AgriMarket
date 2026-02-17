# AgriMarket Backend API

Node.js Express backend for the AgriMarket agricultural marketplace platform using **Neon PostgreSQL** with **Prisma ORM**.

## Setup

### Prerequisites
- Node.js (v18 or higher)
- Neon PostgreSQL account (https://neon.tech)

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
Create a `.env` file in the server root with the following variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/agrimarket?sslmode=require"
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

> **Getting your Neon DATABASE_URL:**
> 1. Go to https://neon.tech and create a free account
> 2. Create a new project called "agrimarket"
> 3. Copy the connection string from the dashboard
> 4. Paste it as your DATABASE_URL

4. Generate Prisma Client and push schema to database:
```bash
npm run db:generate
npm run db:push
```

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Update password
- `DELETE /api/users/:id` - Delete user (Admin)

### Products
- `GET /api/products` - Get all products (with filtering & pagination)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/farmer/:farmerId` - Get products by farmer
- `POST /api/products` - Create product (Farmer)
- `PUT /api/products/:id` - Update product (Farmer)
- `DELETE /api/products/:id` - Delete product (Farmer)

### Query Parameters for Products
- `category` - Filter by category (vegetables, fruits, grains, etc.)
- `available` - Filter by availability (true/false)
- `organic` - Filter organic products (true/false)
- `minPrice` / `maxPrice` - Filter by price range
- `search` - Search by name/description
- `page` / `limit` - Pagination

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/
│   │   └── db.js           # Prisma client setup
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── product.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   └── User.model.js   # Password helpers
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── product.routes.js
│   └── index.js            # Entry point
├── .env
├── .gitignore
├── package.json
└── README.md
```

## User Roles

| Role | Permissions |
|------|-------------|
| `BUYER` | Browse products, view farmers |
| `FARMER` | Create/update/delete own products |
| `ADMIN` | Full access to all resources |
