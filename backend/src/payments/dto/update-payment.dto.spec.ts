import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdatePaymentDto } from './update-payment.dto';
import { PaymentStatus, PaymentMethod, Currency } from '../entities/payment.entity';

describe('UpdatePaymentDto', () => {
  describe('validation', () => {
    it('should pass validation with no fields (empty update)', async () => {
      const validData = {};

      const dtoObject = plainToClass(UpdatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with single field update', async () => {
      const validData = {
        amount: 150.50
      };

      const dtoObject = plainToClass(UpdatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with multiple fields update', async () => {
      const validData = {
        status: PaymentStatus.COMPLETED,
        transactionId: 'tx_123456',
        refundReason: 'Customer request'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields populated', async () => {
      const validData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        transactionId: 'tx_123456',
        status: PaymentStatus.COMPLETED,
        refundReason: 'Customer request'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid booking ID', async () => {
      const invalidData = {
        bookingId: 'not-a-number'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('bookingId');
    });

    it('should fail validation with invalid amount', async () => {
      const invalidData = {
        amount: 'not-a-number'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amount');
    });

    it('should fail validation with invalid payment method', async () => {
      const invalidData = {
        paymentMethod: 'invalid_method'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('paymentMethod');
    });

    it('should fail validation with invalid currency', async () => {
      const invalidData = {
        currency: 'invalid_currency'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('currency');
    });

    it('should fail validation with invalid status', async () => {
      const invalidData = {
        status: 'invalid_status'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('status');
    });

    it('should pass validation with valid transaction ID', async () => {
      const validData = {
        transactionId: 'tx_123456'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid refund reason', async () => {
      const validData = {
        refundReason: 'Customer request'
      };

      const dtoObject = plainToClass(UpdatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid enum values', async () => {
      const validData = {
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.COMPLETED
      };

      const dtoObject = plainToClass(UpdatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });
  });
}); 