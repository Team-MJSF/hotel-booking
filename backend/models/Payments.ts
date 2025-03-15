// This module defines the Payment model schema and behavior using Sequelize
import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import type { Association } from 'sequelize';
import { sequelize } from '../config/database.js';

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';

// Interface for Payment attributes
export interface PaymentAttributes {
  paymentId: number;
  bookingId: number;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  processedAt?: Date;
}

// Interface for Payment creation attributes - when creating a new Payment, the paymentId is optional
export type PaymentCreationAttributes = Optional<PaymentAttributes, 'paymentId'>

export interface PaymentInstance extends Model<PaymentAttributes, PaymentCreationAttributes>, PaymentAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the Payment model with its attributes and configuration
const Payments = sequelize.define<PaymentInstance>('Payments', {
  paymentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paymentMethod: {
    type: DataTypes.ENUM('Credit Card', 'Debit Card', 'PayPal', 'Cash'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

export default Payments; 