/**
 * Payment Controller Module
 *
 * This module provides the business logic for all payment-related operations in the hotel booking system.
 * It handles retrieving, creating, updating, and deleting payments, as well as processing payments
 * through an external payment system.
 *
 * The controller implements payment management operations:
 * - Get all payments (with associated booking details)
 * - Get payment by ID
 * - Create new payment (with validation)
 * - Update existing payment
 * - Delete payment
 * - Process payment through external payment system
 *
 * Error handling is implemented throughout with appropriate HTTP status codes.
 *
 * This controller uses dependency injection for better testability and maintainability.
 */
import type { Request, Response } from 'express';
import type { ValidationError, Result } from 'express-validator';
import type { Model, ModelStatic } from 'sequelize';
import type { PaymentAttributes } from '../models/Payments.js';
export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';
export type PaymentCreationAttributes = {
    bookingId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    status?: PaymentStatus;
    paymentDate?: Date;
    transactionId?: string;
    processedAt?: Date;
};
interface PaymentModel extends Model<PaymentAttributes, PaymentCreationAttributes> {
    paymentId: number;
    bookingId: number;
    amount: number;
    paymentDate: Date;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    processedAt?: Date;
    toJSON: () => PaymentAttributes;
}
interface PaymentSystemResponse {
    success: boolean;
    transactionId?: string;
    status?: PaymentStatus;
    error?: string;
}
interface PaymentSystem {
    processPayment: (paymentData: {
        amount: number;
        paymentMethod: PaymentMethod;
        bookingId: number;
    }) => Promise<PaymentSystemResponse>;
}
interface ControllerDependencies {
    Payments?: ModelStatic<PaymentModel>;
    Bookings?: ModelStatic<any>;
    validator?: (req: Request) => Result<ValidationError>;
    paymentSystem?: PaymentSystem;
}
/**
 * Create a Payment Controller factory
 *
 * This factory function creates payment controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 *
 * @param {ControllerDependencies} deps - Dependencies to inject
 * @returns {Object} - Controller methods
 */
export declare const createPaymentsController: (deps?: ControllerDependencies) => {
    getAllPayments: (request: Request, response: Response) => Promise<void>;
    getPaymentById: (request: Request, response: Response) => Promise<void>;
    createPayment: (request: Request, response: Response) => Promise<void>;
    updatePayment: (request: Request, response: Response) => Promise<void>;
    deletePayment: (request: Request, response: Response) => Promise<void>;
    processPayment: (request: Request, response: Response) => Promise<void>;
};
export declare const getAllPayments: (request: Request, response: Response) => Promise<void>, getPaymentById: (request: Request, response: Response) => Promise<void>, createPayment: (request: Request, response: Response) => Promise<void>, updatePayment: (request: Request, response: Response) => Promise<void>, deletePayment: (request: Request, response: Response) => Promise<void>, processPayment: (request: Request, response: Response) => Promise<void>;
export {};
