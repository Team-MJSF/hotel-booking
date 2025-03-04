// This module defines the Payment model schema using Sequelize

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Bookings from './Bookings.js'; // Importing the Bookings model

// Define the Payment model with its attributes and configuration
const Payments = sequelize.define('Payments', {
  
  // Primary key for payment identification
  paymentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'paymentId'
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Bookings,
      key: 'bookingId'
    },
    field: 'bookingId'
  },
  
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'paymentDate'
  },
  
  paymentMethod: {
    type: DataTypes.ENUM('Credit Card', 'Debit Card', 'PayPal', 'Cash'),
    allowNull: false,
    field: 'paymentMethod'
  },
  
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  
  idBooking: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Bookings,
      key: 'bookingId'
    },
    field: 'bookingId'
  }
}, {
  // Configure table to disable Sequelize's automatic timestamp fields (createdAt, updatedAt)
  tableName: 'Payments',
  timestamps: false
});

// Establish associations
Payments.associate = (models) => {
  // One-to-one relationship with Booking
  // One payment belongs to exactly one booking
  Payments.belongsTo(models.Bookings, {
    foreignKey: 'bookingId',
    as: 'booking',
    onDelete: 'CASCADE'
  });
};

export default Payments;
