import { Model, Optional, Association } from 'sequelize';
export interface PaymentAttributes {
    paymentId: number;
    bookingId: number;
    amount: number;
    paymentDate: Date;
    paymentMethod: 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash';
    status: 'Pending' | 'Completed' | 'Failed';
}
export type PaymentCreationAttributes = Optional<PaymentAttributes, 'paymentId'>
declare class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  paymentId: number;
  bookingId: number;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash';
  status: 'Pending' | 'Completed' | 'Failed';
  static associations: {
        booking: Association<Payment, any>;
    };
  static associate(models: any): void;
}
export default Payment;
