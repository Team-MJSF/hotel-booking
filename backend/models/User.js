// User.js - User Model Definition
// This module defines the User model schema and behavior using Sequelize ORM

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Define the User model with its attributes and configuration
// This model represents the 'Users' table in the database and handles all user-related operations
const User = sequelize.define('User', {
  // Primary key for user identification
  // Auto-incrementing integer that uniquely identifies each user
  idUser: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'idUser',
  },
  // User's full name
  // Required field that stores the complete name of the user
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'fullName'
  },
  // User's email address
  // Unique identifier used for authentication and communication
  // Includes email format validation
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  // User's password
  // Stored as a hashed string using bcrypt
  // Never stored or transmitted in plain text
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  // User's role for access control
  // Determines user permissions and available features
  // Default role is 'Guest'
  role: {
    type: DataTypes.ENUM('Guest', 'Customer', 'Admin'),
    allowNull: false,
    defaultValue: 'Guest'
  },
  // User's contact number
  // Required field for booking communications
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'phoneNumber'
  }
});

export default User;