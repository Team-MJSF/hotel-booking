// This module defines the Payment model schema using Sequelize

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Bookings from './Booking.js'; // Assuming there's a Booking model

// Define the Payment model with its attributes and configuration
const Payments = sequelize.define('Payments', {
  
  // Primary key for payment identification
  idPayment: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'idPayment',
  },

  // Amount paid
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // Date and time when the payment was made
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

  // Payment method (e.g., Credit Card, PayPal, Bank Transfer, Cash)
  paymentMethod: {
    type: DataTypes.ENUM('Credit Card', 'Debit Card', 'PayPal', 'Cash'),
    allowNull: false,
  },

  // Payment status (Pending, Completed, Failed)
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending',
  },

  // Foreign key linking payment to a booking
  idBooking: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Bookings,
      key: 'idBooking',
    }
  }
}, {
  // Configure table to disable Sequelize's automatic timestamp fields (createdAt, updatedAt)
  tableName: 'Payment',
  timestamps: false
});

// Establish associations
Payments.associate = (models) => {
  // One-to-one relationship with Booking
  // One payment belongs to exactly one booking
  Payments.belongsTo(models.Bookings, {
    foreignkey: 'idBooking',
    as: 'booking',
    onDelete: 'CASCADE' // If booking is deleted, delete associated payment
  });
};

export default Payments;
