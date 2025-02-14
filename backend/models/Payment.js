// This module defines the Payment model schema using Sequelize

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';
import Booking from './Booking.js'; // Assuming there's a Booking model

// Define the Payment model with its attributes and configuration
const Payment = sequelize.define('Payment', {
  
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
    type: DataTypes.ENUM('Credit Card', 'PayPal', 'Bank Transfer', 'Cash'),
    allowNull: false,
  },

  // Payment status (Pending, Completed, Failed)
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending',
  },

  // Foreign key linking payment to a user
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'idUser',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },

  // Foreign key linking payment to a booking
  idBooking: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Booking,
      key: 'idBooking',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },

});

// Establish associations
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

Booking.hasMany(Payment, { foreignKey: 'idBooking' });
Payment.belongsTo(Booking, { foreignKey: 'idBooking' });

export default Payment;
