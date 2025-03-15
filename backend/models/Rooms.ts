// This module defines the Room model schema and behavior using Sequelize
import { DataTypes, Model } from 'sequelize';
import type { Optional, Association } from 'sequelize';
import { sequelize } from '../config/database.js';

// Interface for Room attributes
export interface RoomAttributes {
  roomId: number;
  roomNumber: string;
  roomType: 'Single' | 'Double' | 'Suite';
  pricePerNight: number;
  maxGuests: number;
  description?: string;
  availabilityStatus: 'Available' | 'Booked' | 'Maintenance';
  amenities?: string[] | Record<string, boolean> | null;
  photoGallery?: string[] | Record<string, string> | null;
}

// Interface for Room creation attributes - when creating a new Room, the roomId is optional
export type RoomCreationAttributes = Optional<RoomAttributes, 'roomId'>

// Room model class definition
class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public roomId!: number;
  public roomNumber!: string;
  public roomType!: 'Single' | 'Double' | 'Suite';
  public pricePerNight!: number;
  public maxGuests!: number;
  public description!: string;
  public availabilityStatus!: 'Available' | 'Booked' | 'Maintenance';
  public amenities!: string[] | Record<string, boolean> | null;
  public photoGallery!: string[] | Record<string, string> | null;

  // Define associations type
  public static associations: {
    bookings: Association<Room, any>;
  };

  // Define the association method
  public static associate(models: any): void {
    // One-to-many relationship with Booking
    // One room can have multiple bookings over time
    Room.hasMany(models.Bookings, {
      foreignKey: 'roomId',
      as: 'bookings',
      onDelete: 'CASCADE'
    });
  }
}

// Initialize the Room model
Room.init({
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
}, {
  tableName: 'Rooms',
  timestamps: false,
  sequelize
});

export default Room; 