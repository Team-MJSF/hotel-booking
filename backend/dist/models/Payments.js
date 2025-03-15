// This module defines the Payment model schema and behavior using Sequelize
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
// Define the Payment model with its attributes and configuration
const Payments = sequelize.define('Payments', {
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
