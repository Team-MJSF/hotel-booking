// Import required dependencies
import express from 'express';
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
const app = express();
console.log('App initialized...');

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

console.log('We are about to start the server...');
// Start the server after database initialization
const startServer = async () => {
  try {
    // Initialize database connection and sync models with imported function from database.js
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('Failed to initialize database. Exiting...');
      process.exit(1);
    }

    // Start Express server using environment variable 'PORT' via dotenv object
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Only start the server if not being run for tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

