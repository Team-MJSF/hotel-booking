// This module defines the Booking model schema and behavior using Sequelize

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Users from './Users.js'; // Importing the User model to set up the association

// Define the Booking model with its attributes and configuration
// This model represents the 'Bookings' table in the database and handles all booking-related operations
const Bookings = sequelize.define('Bookings', {

  // Primary key for booking identification
  // Auto-incrementing integer that uniquely identifies each booking
  bookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'bookingId'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: 'userId'
    },
    field: 'userId'
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Rooms',
      key: 'roomId'
    },
    field: 'roomId'
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'bookingDate'
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

// Set up associations with the User and Room models
Bookings.associate = (models) => {
  Bookings.belongsTo(models.Users, { foreignKey: 'userId' });
  Bookings.belongsTo(models.Rooms, { foreignKey: 'roomId' });
};

// Export the Booking model for use in other parts of the application
export default Bookings;