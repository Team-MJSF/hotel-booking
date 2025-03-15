// This module defines the Booking model schema and behavior using Sequelize
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import Users from './Users.js';
// Booking model class definition
class Bookings extends Model {
    bookingId;
    userId;
    roomId;
    checkInDate;
    checkOutDate;
    status;
    // Define associations type
    static associations;
    // Define the association method
    static associate(models) {
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
