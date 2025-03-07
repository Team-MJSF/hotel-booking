// This module defines the Room model schema and behavior using Sequelize

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Define the Room model with its attributes and configuration
// This model represents the 'Rooms' table in the database and handles all room-related operations
const Rooms = sequelize.define('Rooms', {

  // Primary key for room identification
  // Auto-incrementing integer that uniquely identifies each room
  roomId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'roomId'
  },

  roomNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    field: 'roomNumber'
  },
  // Type of room (e.g., Single, Double, Suite)
  roomType: {
    type: DataTypes.ENUM('Single', 'Double', 'Suite'),
    allowNull: false
  },

  // Price per night for the room
  pricePerNight: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  // Maximum number of guests allowed in the room
  maxGuests: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Detailed description of the room
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Availability status of the room
  // Indicates whether the room is available, booked, or under maintenance
  availabilityStatus: {
    type: DataTypes.ENUM('Available', 'Booked', 'Maintenance'),
    allowNull: false,
    defaultValue: 'Available'
  },

  // List of amenities provided in the room
  // Stored as a JSON object to allow flexibility
  amenities: {
    type: DataTypes.JSON,
    allowNull: true
  },

  // JSON object containing URLs or file paths for the room's photo gallery
  photoGallery: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

Rooms.associate = (models) => {
  // One-to-many relationship with Booking
  // One room can have multiple bookings over time
  Rooms.hasMany(models.Bookings, {
    foreignKey: 'roomId',
    as: 'bookings',
    onDelete: 'CASCADE'
  });
};

export default Rooms;
