// This module defines the User model schema and behavior using Sequelize
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

// Define the User model with its attributes and configuration
// This model represents the 'Users' table in the database and handles all user-related operations
const Users = sequelize.define('Users', {

  // Primary key for user identification
  // Auto-incrementing integer that uniquely identifies each user
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'userId'
  },

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
}, {
  // Configure table to disable Sequelize's automatic timestamp fields (createdAt, updatedAt)
  tableName: 'Users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

Users.associate = (models) => {
  // One-to-one relationship with Booking
  // One user can have 0 or multiple bookings
  Users.hasMany(models.Bookings, {
    foreignKey: 'userId',
    as: 'bookings',
    onDelete: 'CASCADE'
  });
};

export default Users;