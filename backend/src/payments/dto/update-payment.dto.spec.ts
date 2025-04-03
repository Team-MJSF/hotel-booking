import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdatePaymentDto } from './update-payment.dto';
import { PaymentStatus, PaymentMethod, Currency } from '../entities/payment.entity';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('UpdatePaymentDto', () => {
  let updatePaymentDto: UpdatePaymentDto;

  beforeEach(() => {
    updatePaymentDto = new UpdatePaymentDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid DTO case with all fields
      updatePaymentDto.bookingId = 1;
      updatePaymentDto.amount = 100.50;
      updatePaymentDto.paymentMethod = PaymentMethod.CREDIT_CARD;
      updatePaymentDto.currency = Currency.USD;
      updatePaymentDto.status = PaymentStatus.PENDING;
      updatePaymentDto.transactionId = 'tx_123';
      updatePaymentDto.refundReason = 'Customer request';

      const errors = await validate(updatePaymentDto);
      expect(errors).toHaveLength(0);

      // Valid DTO case with partial fields
      updatePaymentDto = new UpdatePaymentDto();
      updatePaymentDto.amount = 150.75;
      updatePaymentDto.status = PaymentStatus.COMPLETED;

      const partialErrors = await validate(updatePaymentDto);
      expect(partialErrors).toHaveLength(0);

      // Valid DTO case with empty object
      updatePaymentDto = new UpdatePaymentDto();
      const emptyErrors = await validate(updatePaymentDto);
      expect(emptyErrors).toHaveLength(0);

      // Invalid bookingId case
      updatePaymentDto = new UpdatePaymentDto();
      updatePaymentDto.bookingId = 'not-a-number' as any;
      const bookingIdErrors = await validate(updatePaymentDto);
      expect(bookingIdErrors.length).toBeGreaterThan(0);
      expect(bookingIdErrors.some(error => error.property === 'bookingId')).toBe(true);

      // Invalid amount case
      updatePaymentDto = new UpdatePaymentDto();
      updatePaymentDto.amount = 'invalid-amount' as any;
      const amountErrors = await validate(updatePaymentDto);
      expect(amountErrors.length).toBeGreaterThan(0);
      expect(amountErrors.some(error => error.property === 'amount')).toBe(true);

      // Invalid payment method case
      updatePaymentDto = new UpdatePaymentDto();
      updatePaymentDto.paymentMethod = 'INVALID_METHOD' as any;
      const paymentMethodErrors = await validate(updatePaymentDto);
      expect(paymentMethodErrors.length).toBeGreaterThan(0);
      expect(paymentMethodErrors.some(error => error.property === 'paymentMethod')).toBe(true);

      // Invalid currency case
      updatePaymentDto = new UpdatePaymentDto();
      updatePaymentDto.currency = 'INVALID_CURRENCY' as any;
      const currencyErrors = await validate(updatePaymentDto);
      expect(currencyErrors.length).toBeGreaterThan(0);
      expect(currencyErrors.some(error => error.property === 'currency')).toBe(true);

      // Invalid status case
      updatePaymentDto = new UpdatePaymentDto();
      updatePaymentDto.status = 'INVALID_STATUS' as any;
      const statusErrors = await validate(updatePaymentDto);
      expect(statusErrors.length).toBeGreaterThan(0);
      expect(statusErrors.some(error => error.property === 'status')).toBe(true);
    });
  });

  describe('transformation', () => {
    it('should handle all transformation scenarios', () => {
      // Basic transformation
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

      // String to number conversion
      const numberStringData = {
        bookingId: '1',
        amount: '100.50'
      };

      const numberStringDto = plainToClass(UpdatePaymentDto, numberStringData);
      expect(typeof numberStringDto.bookingId).toBe('number');
      expect(typeof numberStringDto.amount).toBe('number');
      expect(numberStringDto.bookingId).toBe(1);
      expect(numberStringDto.amount).toBe(100.50);

      // String to enum conversion
      const enumStringData = {
        paymentMethod: 'CREDIT_CARD',
        currency: 'USD',
        status: 'PENDING'
      };

      const enumStringDto = plainToClass(UpdatePaymentDto, enumStringData);
      expect(enumStringDto.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
      expect(enumStringDto.currency).toBe(Currency.USD);
      expect(enumStringDto.status).toBe(PaymentStatus.PENDING);

      // Undefined values
      const undefinedData = {
        bookingId: undefined,
        amount: undefined,
        paymentMethod: undefined,
        currency: undefined,
        status: undefined,
        transactionId: undefined,
        refundReason: undefined
      };

      const undefinedDto = plainToClass(UpdatePaymentDto, undefinedData);
      expect(undefinedDto.bookingId).toBeUndefined();
      expect(undefinedDto.amount).toBeUndefined();
      expect(undefinedDto.paymentMethod).toBeUndefined();
      expect(undefinedDto.currency).toBeUndefined();
      expect(undefinedDto.status).toBeUndefined();
      expect(undefinedDto.transactionId).toBeUndefined();
      expect(undefinedDto.refundReason).toBeUndefined();

      // Null values
      const nullData = {
        bookingId: null,
        amount: null,
        paymentMethod: null,
        currency: null,
        status: null,
        transactionId: null,
        refundReason: null
      };

      const nullDto = plainToClass(UpdatePaymentDto, nullData);
      expect(nullDto.bookingId).toBeNull();
      expect(nullDto.amount).toBeNull();
      expect(nullDto.paymentMethod).toBeNull();
      expect(nullDto.currency).toBeNull();
      expect(nullDto.status).toBeNull();
      expect(nullDto.transactionId).toBeNull();
      expect(nullDto.refundReason).toBeNull();

      // Empty string values
      const emptyStringData = {
        bookingId: '',
        amount: '',
        paymentMethod: '',
        currency: '',
        status: '',
        transactionId: '',
        refundReason: ''
      };

      const emptyStringDto = plainToClass(UpdatePaymentDto, emptyStringData);
      expect(emptyStringDto.bookingId).toBe('');
      expect(emptyStringDto.amount).toBe('');
      expect(emptyStringDto.paymentMethod).toBe('');
      expect(emptyStringDto.currency).toBe('');
      expect(emptyStringDto.status).toBe('');
      expect(emptyStringDto.transactionId).toBe('');
      expect(emptyStringDto.refundReason).toBe('');

      // Extra properties
      const extraPropsData = {
        bookingId: 1,
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        extraField: 'extra value'
      };

      const extraPropsDto = plainToClass(UpdatePaymentDto, extraPropsData);
      expect(extraPropsDto.bookingId).toBe(extraPropsData.bookingId);
      expect(extraPropsDto.amount).toBe(extraPropsData.amount);
      expect(extraPropsDto.paymentMethod).toBe(extraPropsData.paymentMethod);
      expect(extraPropsDto.currency).toBe(extraPropsData.currency);
      expect(extraPropsDto.status).toBe(extraPropsData.status);
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 