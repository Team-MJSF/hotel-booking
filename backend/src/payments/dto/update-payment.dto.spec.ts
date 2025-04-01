import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdatePaymentDto } from './update-payment.dto';
import { PaymentStatus, PaymentMethod, Currency } from '../entities/payment.entity';

describe('UpdatePaymentDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: 'tx_123',
        refundReason: 'Customer request'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial data', async () => {
      const partialData = {
        amount: 150.75,
        status: PaymentStatus.COMPLETED
      };

      const dtoObject = plainToClass(UpdatePaymentDto, partialData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty object', async () => {
      const emptyData = {};

      const dtoObject = plainToClass(UpdatePaymentDto, emptyData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid number format', async () => {
      const invalidData = {
        bookingId: 'not-a-number',
        amount: 'invalid-amount'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'bookingId')).toBe(true);
      expect(errors.some(error => error.property === 'amount')).toBe(true);
    });

    it('should fail validation with invalid enum values', async () => {
      const invalidData = {
        paymentMethod: 'INVALID_METHOD',
        currency: 'INVALID_CURRENCY',
        status: 'INVALID_STATUS'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'paymentMethod')).toBe(true);
      expect(errors.some(error => error.property === 'currency')).toBe(true);
      expect(errors.some(error => error.property === 'status')).toBe(true);
    });
  });

  describe('transformation', () => {
    it('should transform plain object to UpdatePaymentDto instance', () => {
      const plainData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: 'tx_123',
        refundReason: 'Customer request'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdatePaymentDto);
      expect(dtoObject.bookingId).toBe(plainData.bookingId);
      expect(dtoObject.amount).toBe(plainData.amount);
      expect(dtoObject.paymentMethod).toBe(plainData.paymentMethod);
      expect(dtoObject.currency).toBe(plainData.currency);
      expect(dtoObject.status).toBe(plainData.status);
      expect(dtoObject.transactionId).toBe(plainData.transactionId);
      expect(dtoObject.refundReason).toBe(plainData.refundReason);
    });

    it('should handle undefined values', () => {
      const plainData = {
        bookingId: undefined,
        amount: undefined,
        paymentMethod: undefined,
        currency: undefined,
        status: undefined,
        transactionId: undefined,
        refundReason: undefined
      };

      const dtoObject = plainToClass(UpdatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdatePaymentDto);
      expect(dtoObject.bookingId).toBeUndefined();
      expect(dtoObject.amount).toBeUndefined();
      expect(dtoObject.paymentMethod).toBeUndefined();
      expect(dtoObject.currency).toBeUndefined();
      expect(dtoObject.status).toBeUndefined();
      expect(dtoObject.transactionId).toBeUndefined();
      expect(dtoObject.refundReason).toBeUndefined();
    });

    it('should handle null values', () => {
      const plainData = {
        bookingId: null,
        amount: null,
        paymentMethod: null,
        currency: null,
        status: null,
        transactionId: null,
        refundReason: null
      };

      const dtoObject = plainToClass(UpdatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdatePaymentDto);
      expect(dtoObject.bookingId).toBeNull();
      expect(dtoObject.amount).toBeNull();
      expect(dtoObject.paymentMethod).toBeNull();
      expect(dtoObject.currency).toBeNull();
      expect(dtoObject.status).toBeNull();
      expect(dtoObject.transactionId).toBeNull();
      expect(dtoObject.refundReason).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        bookingId: '',
        amount: '',
        paymentMethod: '',
        currency: '',
        status: '',
        transactionId: '',
        refundReason: ''
      };

      const dtoObject = plainToClass(UpdatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdatePaymentDto);
      expect(dtoObject.bookingId).toBe('');
      expect(dtoObject.amount).toBe('');
      expect(dtoObject.paymentMethod).toBe('');
      expect(dtoObject.currency).toBe('');
      expect(dtoObject.status).toBe('');
      expect(dtoObject.transactionId).toBe('');
      expect(dtoObject.refundReason).toBe('');
    });

    it('should handle number conversion', () => {
      const plainData = {
        bookingId: '1',
        amount: '100.50'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdatePaymentDto);
      expect(typeof dtoObject.bookingId).toBe('number');
      expect(typeof dtoObject.amount).toBe('number');
      expect(dtoObject.bookingId).toBe(1);
      expect(dtoObject.amount).toBe(100.50);
    });

    it('should handle enum values', () => {
      const plainData = {
        paymentMethod: 'CREDIT_CARD',
        currency: 'USD',
        status: 'PENDING'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdatePaymentDto);
      expect(dtoObject.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
      expect(dtoObject.currency).toBe(Currency.USD);
      expect(dtoObject.status).toBe(PaymentStatus.PENDING);
    });

    it('should ignore extra properties', () => {
      const plainData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdatePaymentDto);
      expect(dtoObject.bookingId).toBe(plainData.bookingId);
      expect(dtoObject.amount).toBe(plainData.amount);
      expect(dtoObject.paymentMethod).toBe(plainData.paymentMethod);
      expect(dtoObject.currency).toBe(plainData.currency);
      expect(dtoObject.status).toBe(plainData.status);
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 