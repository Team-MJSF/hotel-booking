// This module defines the Booking model schema and behavior using Sequelize

import { DataTypes, Model } from 'sequelize';
import type { Optional, Association } from 'sequelize';
import { sequelize } from '../config/database.js';
import Users from './Users.js';

// Define the booking status type
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

// Interface for booking attributes
export interface BookingAttributes {
  bookingId: number;
  userId: number;
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  status: BookingStatus;
}

// Interface for booking creation attributes
export type BookingCreationAttributes = Optional<BookingAttributes, 'bookingId'>;

// Booking model class definition
class Bookings extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public bookingId!: number;
  public userId!: number;
  public roomId!: number;
  public checkInDate!: Date;
  public checkOutDate!: Date;
  public status!: BookingStatus;

  // Define associations type
  public static associations: {
    Users: Association<Bookings, any>;
    Rooms: Association<Bookings, any>;
  };

  // Define the association method
  public static associate(models: any): void {
    Bookings.belongsTo(models.Users, { foreignKey: 'userId' });
    Bookings.belongsTo(models.Rooms, { foreignKey: 'roomId' });
  }
}

// Initialize the Booking model with its attributes and configuration
Bookings.init({
  // Primary key for booking identification
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
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'checkInDate'
  },
  checkOutDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'checkOutDate'
  },
  // Status of the booking
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending',
    field: 'status'
  }
}, {
  tableName: 'Bookings',
  sequelize
});

export default Bookings; 