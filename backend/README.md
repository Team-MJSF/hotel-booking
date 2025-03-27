# Hotel Booking System - Backend

This is the backend service for the Hotel Booking System, built with NestJS.

## Architecture

The backend follows a modular architecture with the following key components:

### Modules

1. **Users Module**
   - User management
   - Authentication
   - Authorization
   - Profile management

2. **Rooms Module**
   - Room management
   - Availability tracking
   - Room types and pricing
   - Amenities management

3. **Bookings Module**
   - Reservation management
   - Availability checking
   - Booking status tracking
   - Guest information

4. **Payments Module**
   - Payment processing
   - Transaction management
   - Payment status tracking
   - Refund handling

### Database Design

The application uses MySQL with TypeORM for database operations. Key features:

- Entity relationships with proper foreign key constraints
- Enum types for status fields
- Timestamps for auditing
- Soft delete support where applicable
- Indexed fields for performance

### API Design

The API follows RESTful principles:

- Resource-based URLs
- HTTP methods for operations (GET, POST, PUT, DELETE)
- Proper status codes
- Consistent error handling
- Swagger documentation

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file with:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hotel_booking
   JWT_SECRET=your_jwt_secret
   ```

   ### Environment Variables
   
   | Variable | Description | Default | Required |
   |----------|-------------|---------|----------|
   | `DB_HOST` | Database host | localhost | Yes |
   | `DB_PORT` | Database port | 3306 | Yes |
   | `DB_USER` | Database username | root | Yes |
   | `DB_PASSWORD` | Database password | - | Yes |
   | `DB_NAME` | Database name | hotel_booking | Yes |
   | `JWT_SECRET` | Secret for JWT token generation | - | Yes |
   | `JWT_EXPIRATION` | JWT token expiration time | 24h | No |
   | `PORT` | Application port | 3000 | No |
   | `NODE_ENV` | Environment (development/production) | development | No |
   | `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3001 | No |
   | `LOG_LEVEL` | Logging level (error/warn/log/debug) | log | No |

3. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE hotel_booking;
   
   # Run migrations
   npm run db:migrate
   
   # If you need to reset the database
   npm run dev:reset
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Testing

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- src/users/users.service.spec.ts
```

### Test Structure
```
src/
├── users/
│   ├── users.controller.ts
│   ├── users.controller.spec.ts
│   ├── users.service.ts
│   └── users.service.spec.ts
├── rooms/
│   ├── rooms.controller.ts
│   ├── rooms.controller.spec.ts
│   ├── rooms.service.ts
│   └── rooms.service.spec.ts
├── bookings/
│   ├── bookings.controller.ts
│   ├── bookings.controller.spec.ts
│   ├── bookings.service.ts
│   └── bookings.service.spec.ts
└── payments/
    ├── payments.controller.ts
    ├── payments.controller.spec.ts
    ├── payments.service.ts
    └── payments.service.spec.ts
```

### Writing Tests
```typescript
// Example test file (users.service.spec.ts)
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = { id: 1, ...createUserDto };
      jest.spyOn(repository, 'create').mockReturnValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      const result = await service.create(createUserDto);

      expect(result).toEqual(user);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test file
npm run test:e2e -- test/users.e2e-spec.ts
```

### Test Coverage
```bash
# Generate coverage report
npm run test:cov

# Coverage report will be available at:
# coverage/lcov-report/index.html
```

### Test Environment
- Tests use a separate test database
- Each test suite runs in isolation
- Database is cleaned between tests
- Mock external services and dependencies

## API Documentation

The API documentation is available at `http://localhost:3000/api` when running in development mode.

### Authentication

The API uses JWT for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Users
- `POST /users` - Create user
  ```json
  // Request
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "USER"
  }
  
  // Response (201 Created)
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-15T10:00:00Z"
  }
  ```

- `GET /users` - List users
  ```json
  // Response (200 OK)
  {
    "data": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "USER",
        "createdAt": "2024-03-15T10:00:00Z",
        "updatedAt": "2024-03-15T10:00:00Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
  ```

- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Rooms
- `POST /rooms` - Create room
  ```json
  // Request
  {
    "roomNumber": "101",
    "type": "DOUBLE",
    "pricePerNight": 100,
    "maxGuests": 2,
    "description": "Comfortable double room",
    "amenities": {
      "wifi": true,
      "tv": true,
      "airConditioning": true
    }
  }
  ```

- `GET /rooms` - List rooms
- `GET /rooms/:id` - Get room details
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

#### Bookings
- `POST /bookings` - Create booking
  ```json
  // Request
  {
    "userId": 1,
    "roomId": 1,
    "checkInDate": "2024-03-20",
    "checkOutDate": "2024-03-25",
    "numberOfGuests": 2
  }
  ```

- `GET /bookings` - List bookings
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

#### Payments
- `POST /payments` - Create payment
  ```json
  // Request
  {
    "bookingId": 1,
    "amount": 500,
    "paymentMethod": "CREDIT_CARD",
    "transactionId": "txn_123456"
  }
  ```

- `GET /payments` - List payments
- `GET /payments/:id` - Get payment details
- `PUT /payments/:id` - Update payment
- `DELETE /payments/:id` - Delete payment

## Error Handling

The API uses a consistent error response format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error type"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Logging

The application uses NestJS's built-in logger with the following levels:
- ERROR: For error messages
- WARN: For warning messages
- LOG: For general information
- DEBUG: For detailed debugging information

## Performance Considerations

1. **Database Indexing**
   - Primary keys are automatically indexed
   - Foreign keys are indexed for faster joins
   - Frequently queried fields are indexed

2. **Caching**
   - Room availability is cached
   - User sessions are cached
   - Static data is cached

3. **Query Optimization**
   - Use of TypeORM relations
   - Proper join strategies
   - Pagination for large datasets

## Security

1. **Authentication**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Token expiration

2. **Authorization**
   - Role-based access control
   - Resource-level permissions
   - API endpoint protection

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection

## Deployment

### Prerequisites
- Node.js v16 or higher
- MySQL v8 or higher
- PM2 (for production process management)
- Nginx (for reverse proxy)

### Production Environment Setup

1. **Build the Application**
   ```bash
   # Install dependencies
   npm ci --only=production

   # Build the application
   npm run build
   ```

2. **Environment Configuration**
   Create a `.env.production` file:
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=your-production-db-host
   DB_PORT=3306
   DB_USERNAME=your-production-db-user
   DB_PASSWORD=your-production-db-password
   DB_DATABASE=hotel_booking_prod
   JWT_SECRET=your-production-jwt-secret
   JWT_EXPIRATION=24h
   CORS_ORIGIN=https://your-frontend-domain.com
   LOG_LEVEL=error
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   npm run migration:run
   ```

4. **Start the Application**
   ```bash
   # Using PM2
   pm2 start dist/main.js --name hotel-booking

   # Or using Node directly
   node dist/main.js
   ```

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t hotel-booking-backend .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name hotel-booking-backend \
     -p 3000:3000 \
     --env-file .env.production \
     --restart unless-stopped \
     hotel-booking-backend
   ```

3. **Docker Compose**
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       env_file:
         - .env.production
       depends_on:
         - db
       restart: unless-stopped

     db:
       image: mysql:8
       environment:
         MYSQL_ROOT_PASSWORD: your_root_password
         MYSQL_DATABASE: hotel_booking_prod
       volumes:
         - mysql_data:/var/lib/mysql
       restart: unless-stopped

   volumes:
     mysql_data:
   ```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/hotel-booking
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Monitoring and Logging

1. **PM2 Monitoring**
   ```bash
   # Monitor application
   pm2 monit

   # View logs
   pm2 logs hotel-booking
   ```

2. **Health Checks**
   ```bash
   # Health check endpoint
   curl http://localhost:3000/health
   ```

### Backup and Recovery

1. **Database Backup**
   ```bash
   # Create backup
   mysqldump -u root -p hotel_booking_prod > backup.sql

   # Restore backup
   mysql -u root -p hotel_booking_prod < backup.sql
   ```

2. **Application Backup**
   ```bash
   # Backup environment files
   cp .env.production .env.production.backup

   # Backup database migrations
   cp -r src/migrations migrations.backup
   ```

### Scaling

1. **Horizontal Scaling**
   - Use a load balancer (e.g., Nginx)
   - Deploy multiple instances behind the load balancer
   - Use sticky sessions if needed

2. **Vertical Scaling**
   - Increase server resources
   - Optimize database queries
   - Implement caching

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License.