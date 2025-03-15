import { Model, Optional, Association } from 'sequelize';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';
export interface BookingAttributes {
    bookingId: number;
    userId: number;
    roomId: number;
    checkInDate: Date;
    checkOutDate: Date;
    status: BookingStatus;
}
export type BookingCreationAttributes = Optional<BookingAttributes, 'bookingId'>;
declare class Bookings extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  bookingId: number;
  userId: number;
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  status: BookingStatus;
  static associations: {
        Users: Association<Bookings, any>;
        Rooms: Association<Bookings, any>;
    };
  static associate(models: any): void;
}
export default Bookings;
