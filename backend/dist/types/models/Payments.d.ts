import { Model } from 'sequelize';
import type { Optional } from 'sequelize';
export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';
export interface PaymentAttributes {
    paymentId: number;
    bookingId: number;
    amount: number;
    paymentDate: Date;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    processedAt?: Date;
}
export type PaymentCreationAttributes = Optional<PaymentAttributes, 'paymentId'>;
export interface PaymentInstance extends Model<PaymentAttributes, PaymentCreationAttributes>, PaymentAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Payments: import("sequelize").ModelCtor<PaymentInstance>;
export default Payments;
