import { Model, Optional, Association } from 'sequelize';
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
export type RoomCreationAttributes = Optional<RoomAttributes, 'roomId'>
declare class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  roomId: number;
  roomNumber: string;
  roomType: 'Single' | 'Double' | 'Suite';
  pricePerNight: number;
  maxGuests: number;
  description: string;
  availabilityStatus: 'Available' | 'Booked' | 'Maintenance';
  amenities: string[] | Record<string, boolean> | null;
  photoGallery: string[] | Record<string, string> | null;
  static associations: {
        bookings: Association<Room, any>;
    };
  static associate(models: any): void;
}
export default Room;
