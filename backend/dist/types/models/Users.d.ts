import { Model } from 'sequelize';
import type { Optional, Association } from 'sequelize';
export interface UserAttributes {
    userId: number;
    fullName: string;
    email: string;
    password: string;
    role: 'Guest' | 'Customer' | 'Admin';
    phoneNumber: string;
}
export type UserCreationAttributes = Optional<UserAttributes, 'userId'>;
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    userId: number;
    fullName: string;
    email: string;
    password: string;
    role: 'Guest' | 'Customer' | 'Admin';
    phoneNumber: string;
    static associations: {
        bookings: Association<User, any>;
    };
    static associate(models: any): void;
}
export default User;
