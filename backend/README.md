# Hotel Booking Backend

A NestJS backend for a hotel booking system with user authentication, room management, booking system, and payment processing.

## Features

- User Authentication (JWT)
- Room Management
- Booking System
- Payment Processing
- Role-based Access Control
- Environment-specific Configuration
- Database Migrations and Seeding

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Environment Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables in `.env`:
   ```env
   # Environment Configuration
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=hotel_booking_dev

   # Logging Configuration
   LOG_LEVEL=debug

   # Feature Flags
   ENABLE_SWAGGER=true
   ENABLE_LOGGING=true
   ```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

## Database Setup

The project uses TypeORM with migrations for database management. The database will be automatically created if it doesn't exist.

1. Run the development setup (creates database, runs migrations, and seeds data):
   ```bash
   npm run dev:setup
   ```

This will:
- Create the database if it doesn't exist
- Run all migrations to create tables
- Seed the database with initial data

## Available Scripts

- `npm run build` - Build the project
- `npm run start:dev` - Start the server in development mode with hot-reload
- `npm run start:debug` - Start the server in debug mode
- `npm run start:prod` - Start the server in production mode
- `npm run dev:setup` - Set up the development environment (build, migrations, seeding)
- `npm run db:migrate` - Run pending migrations
- `npm run db:revert` - Revert the last migration
- `npm run db:seed` - Seed the database
- `npm run db:reset` - Reset the database (revert migrations, run migrations, seed)
- `npm run db:fresh` - Fresh start (revert migrations, run migrations, seed)
- `npm run db:status` - Show migration status
- `npm run db:drop` - Drop the database schema
- `npm run db:sync` - Sync the database schema with entities
- `npm run dev:clean` - Clean start (drop schema, run setup)

## Database Structure

The database name is configured through the `DB_NAME` environment variable. By default:
- Development: `hotel_booking_dev`
- Production: `hotel_booking_prod`
- Test: `hotel_booking_test`

The database configuration is managed through environment variables and TypeORM configuration, ensuring proper separation between environments.

## API Documentation

When running in development mode, the API documentation is available at:
```
http://localhost:5000/api
```

## Development

1. Start the development server:
   ```bash
   npm run start:dev
   ```

2. The server will be available at `http://localhost:5000`

3. API endpoints will be available at `http://localhost:5000/api`

## Testing

Run the test suite:
```bash
npm test
```

For development with watch mode:
```bash
npm run test:watch
```

## Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start:prod
   ```

Make sure to set up the appropriate environment variables for production in `.env.production`.

## License

This project is licensed under the MIT License.