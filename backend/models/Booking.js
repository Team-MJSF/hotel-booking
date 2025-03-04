// This module defines the Booking model schema and behavior using Sequelize

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js'; // Importing the User model to set up the association

// Define the Booking model with its attributes and configuration
// This model represents the 'Bookings' table in the database and handles all booking-related operations
const Booking = sequelize.define('Booking', {

  // Primary key for booking identification
  // Auto-incrementing integer that uniquely identifies each booking
  idBooking: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'idBooking',
  },

  // The user ID who made the booking
  // Foreign key reference to the 'Users' table
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Refers to the 'User' model
      key: 'idUser', // Refers to the primary key in the 'Users' table
    },
    field: 'userId'
  },

  // The date and time of the booking
  // Date and time when the booking is made or scheduled
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'bookingDate',
  },

  // Status of the booking
  // It can be 'Pending', 'Confirmed', or 'Cancelled'
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending',
    field: 'status',
  }
});

// Set up associations with the User model (foreign key)
Booking.belongsTo(User, { foreignKey: 'userId' });

// Export the Booking model for use in other parts of the application
export default Booking;