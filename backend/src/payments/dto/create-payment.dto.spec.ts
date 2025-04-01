import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentStatus, PaymentMethod, Currency } from '../entities/payment.entity';

describe('CreatePaymentDto', () => {
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

      const dtoObject = plainToClass(CreatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation without optional fields', async () => {
      const validData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        bookingId: 1,
        amount: 100.50
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('paymentMethod');
    });

    it('should fail validation with invalid enum values', async () => {
      const invalidData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: 'INVALID_METHOD',
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('paymentMethod');
    });

    it('should fail validation with invalid number format', async () => {
      const invalidData = {
        bookingId: 'not-a-number',
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('bookingId');
    });
  });

  describe('transformation', () => {
    it('should transform plain object to CreatePaymentDto instance', () => {
      const plainData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: 'tx_123',
        refundReason: 'Customer request'
      };

      const dtoObject = plainToClass(CreatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreatePaymentDto);
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
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: undefined,
        refundReason: undefined
      };

      const dtoObject = plainToClass(CreatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreatePaymentDto);
      expect(dtoObject.transactionId).toBeUndefined();
      expect(dtoObject.refundReason).toBeUndefined();
    });

    it('should handle null values', () => {
      const plainData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: null,
        refundReason: null
      };

      const dtoObject = plainToClass(CreatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreatePaymentDto);
      expect(dtoObject.transactionId).toBeNull();
      expect(dtoObject.refundReason).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: '',
        refundReason: ''
      };

      const dtoObject = plainToClass(CreatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreatePaymentDto);
      expect(dtoObject.transactionId).toBe('');
      expect(dtoObject.refundReason).toBe('');
    });

    it('should handle number conversion', () => {
      const plainData = {
        bookingId: '1',
        amount: '100.50',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreatePaymentDto);
      expect(typeof dtoObject.bookingId).toBe('number');
      expect(typeof dtoObject.amount).toBe('number');
      expect(dtoObject.bookingId).toBe(1);
      expect(dtoObject.amount).toBe(100.50);
    });

    it('should handle enum values', () => {
      const plainData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: 'CREDIT_CARD',
        currency: 'USD',
        status: 'PENDING'
      };

      const dtoObject = plainToClass(CreatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreatePaymentDto);
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

      const dtoObject = plainToClass(CreatePaymentDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreatePaymentDto);
      expect(dtoObject.bookingId).toBe(plainData.bookingId);
      expect(dtoObject.amount).toBe(plainData.amount);
      expect(dtoObject.paymentMethod).toBe(plainData.paymentMethod);
      expect(dtoObject.currency).toBe(plainData.currency);
      expect(dtoObject.status).toBe(plainData.status);
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 