// Import required dependencies
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import userRoutes from './routes/users.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import roomRoutes from './routes/rooms.routes.js';
import paymentRoutes from './routes/payments.routes.js';

// Load environment variables from .env file into process.env
// This allows secure configuration without hardcoding sensitive data. Passwords and tokens will be stored there and used here.
dotenv.config();

// Initialize express app
const app: Express = express();
console.log('🏨 Hotel Booking API - Initializing application...');

// Middleware:
// Helps manage HTTP requests from different origins (if frontend + backend domains are different)
// Best security practice to define which origins can access API
app.use(cors());
// Specifying that we want our Express request to be JSON
app.use(express.json());

// Configure routes
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);

// Export the app for testing
export default app;

// Start the server after database initialization
const startServer = async (): Promise<void> => {
  try {
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🗄️ Connecting to database...');
    
    // Initialize database connection and sync models with imported function from database.js
    const dbInitialized: boolean = await initializeDatabase();
    if (!dbInitialized) {
      console.error('❌ Failed to initialize database. Exiting...');
      process.exit(1);
    }
    
    console.log('✅ Database initialized successfully');

    // Start Express server using environment variable 'PORT' via dotenv object
    const PORT: number = parseInt(process.env.PORT || '5000', 10);
    app.listen(PORT, () => {
      console.log(`
🚀 Server is running!
📡 API: http://localhost:${PORT}/api
⚙️ Mode: ${process.env.NODE_ENV || 'development'}
      `);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Only start the server if not being run for tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
} 