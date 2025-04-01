import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentStatus, PaymentMethod, Currency } from '../entities/payment.entity';

describe('CreatePaymentDto', () => {
  describe('validation', () => {
    it('should pass validation with all required fields', async () => {
      const validData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields including optional ones', async () => {
      const validData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: 'tx_123456',
        refundReason: 'Customer request'
      };

      const dtoObject = plainToClass(CreatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        bookingId: 1,
        amount: 150.50,
        // paymentMethod, currency, and status are missing
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'paymentMethod')).toBe(true);
      expect(errors.some(error => error.property === 'currency')).toBe(true);
      expect(errors.some(error => error.property === 'status')).toBe(true);
    });

    it('should fail validation with invalid booking ID', async () => {
      const invalidData = {
        bookingId: 'not-a-number',
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('bookingId');
    });

    it('should fail validation with invalid amount', async () => {
      const invalidData = {
        bookingId: 1,
        amount: 'not-a-number',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amount');
    });

    it('should fail validation with invalid payment method', async () => {
      const invalidData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: 'invalid_method',
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('paymentMethod');
    });

    it('should fail validation with invalid currency', async () => {
      const invalidData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'invalid_currency',
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('currency');
    });

    it('should fail validation with invalid status', async () => {
      const invalidData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: 'invalid_status'
      };

      const dtoObject = plainToClass(CreatePaymentDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('status');
    });

    it('should pass validation with valid transaction ID', async () => {
      const validData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: 'tx_123456'
      };

      const dtoObject = plainToClass(CreatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid refund reason', async () => {
      const validData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        refundReason: 'Customer request'
      };

      const dtoObject = plainToClass(CreatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid enum values', async () => {
      const validData = {
        bookingId: 1,
        amount: 150.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING
      };

      const dtoObject = plainToClass(CreatePaymentDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });
  });
}); 