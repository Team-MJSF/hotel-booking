// This module defines the User model schema and behavior using Sequelize
import { DataTypes, Model } from 'sequelize';
import type { Optional, Association } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

// Interface for User attributes
export interface UserAttributes {
  userId: number;
  fullName: string;
  email: string;
  password: string;
  role: 'Guest' | 'Customer' | 'Admin';
  phoneNumber: string;
}

// Interface for User creation attributes - when creating a new User, the userId is optional
export type UserCreationAttributes = Optional<UserAttributes, 'userId'>

// User model class definition
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public userId!: number;
  public fullName!: string;
  public email!: string;
  public password!: string;
  public role!: 'Guest' | 'Customer' | 'Admin';
  public phoneNumber!: string;

  // Define associations type
  public static associations: {
    bookings: Association<User, any>;
  };

  // Define the association method
  public static associate(models: any): void {
    // One-to-one relationship with Booking
    // One user can have 0 or multiple bookings
    User.hasMany(models.Bookings, {
      foreignKey: 'userId',
      as: 'bookings',
      onDelete: 'CASCADE'
    });
  }
}

// Initialize the User model
User.init({
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
  sequelize,
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

export default User; 