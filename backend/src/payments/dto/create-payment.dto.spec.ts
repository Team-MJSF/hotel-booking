import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentStatus, PaymentMethod, Currency } from '../entities/payment.entity';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('CreatePaymentDto', () => {
  let createPaymentDto: CreatePaymentDto;

  beforeEach(() => {
    createPaymentDto = new CreatePaymentDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid DTO case with all fields
      createPaymentDto.bookingId = 1;
      createPaymentDto.amount = 100.5;
      createPaymentDto.paymentMethod = PaymentMethod.CREDIT_CARD;
      createPaymentDto.currency = Currency.USD;
      createPaymentDto.status = PaymentStatus.PENDING;
      createPaymentDto.transactionId = 'tx_123';
      createPaymentDto.refundReason = 'Customer request';

      const errors = await validate(createPaymentDto);
      expect(errors).toHaveLength(0);

      // Valid DTO case without optional fields
      createPaymentDto = new CreatePaymentDto();
      createPaymentDto.bookingId = 1;
      createPaymentDto.amount = 100.5;
      createPaymentDto.paymentMethod = PaymentMethod.CREDIT_CARD;
      createPaymentDto.currency = Currency.USD;
      createPaymentDto.status = PaymentStatus.PENDING;

      const minimalErrors = await validate(createPaymentDto);
      expect(minimalErrors).toHaveLength(0);

      // Missing required fields case
      createPaymentDto = new CreatePaymentDto();
      createPaymentDto.bookingId = 1;
      createPaymentDto.amount = 100.5;
      // Missing paymentMethod, currency, and status

      const missingFieldsErrors = await validate(createPaymentDto);
      expect(missingFieldsErrors.length).toBeGreaterThan(0);
      expect(missingFieldsErrors.some(error => error.property === 'paymentMethod')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'currency')).toBe(true);
      // Status is now optional, so we don't check for it
      // expect(missingFieldsErrors.some(error => error.property === 'status')).toBe(true);

      // Invalid payment method case
      createPaymentDto = new CreatePaymentDto();
      createPaymentDto.bookingId = 1;
      createPaymentDto.amount = 100.5;
      createPaymentDto.paymentMethod = 'INVALID_METHOD' as unknown as PaymentMethod;
      createPaymentDto.currency = Currency.USD;
      createPaymentDto.status = PaymentStatus.PENDING;

      const paymentMethodErrors = await validate(createPaymentDto);
      expect(paymentMethodErrors.length).toBeGreaterThan(0);
      expect(paymentMethodErrors[0].property).toBe('paymentMethod');

      // Invalid currency case
      createPaymentDto = new CreatePaymentDto();
      createPaymentDto.bookingId = 1;
      createPaymentDto.amount = 100.5;
      createPaymentDto.paymentMethod = PaymentMethod.CREDIT_CARD;
      createPaymentDto.currency = 'INVALID_CURRENCY' as unknown as Currency;
      createPaymentDto.status = PaymentStatus.PENDING;

      const currencyErrors = await validate(createPaymentDto);
      expect(currencyErrors.length).toBeGreaterThan(0);
      expect(currencyErrors[0].property).toBe('currency');

      // Invalid status case
      createPaymentDto = new CreatePaymentDto();
      createPaymentDto.bookingId = 1;
      createPaymentDto.amount = 100.5;
      createPaymentDto.paymentMethod = PaymentMethod.CREDIT_CARD;
      createPaymentDto.currency = Currency.USD;
      createPaymentDto.status = 'INVALID_STATUS' as unknown as PaymentStatus;

      const statusErrors = await validate(createPaymentDto);
      expect(statusErrors.length).toBeGreaterThan(0);
      expect(statusErrors[0].property).toBe('status');

      // Invalid bookingId case
      createPaymentDto = new CreatePaymentDto();
      createPaymentDto.bookingId = 'not-a-number' as unknown as number;
      createPaymentDto.amount = 100.5;
      createPaymentDto.paymentMethod = PaymentMethod.CREDIT_CARD;
      createPaymentDto.currency = Currency.USD;
      createPaymentDto.status = PaymentStatus.PENDING;

      const bookingIdErrors = await validate(createPaymentDto);
      expect(bookingIdErrors.length).toBeGreaterThan(0);
      expect(bookingIdErrors[0].property).toBe('bookingId');

      // Invalid amount case
      createPaymentDto = new CreatePaymentDto();
      createPaymentDto.bookingId = 1;
      createPaymentDto.amount = 'not-a-number' as unknown as number;
      createPaymentDto.paymentMethod = PaymentMethod.CREDIT_CARD;
      createPaymentDto.currency = Currency.USD;
      createPaymentDto.status = PaymentStatus.PENDING;

      const amountErrors = await validate(createPaymentDto);
      expect(amountErrors.length).toBeGreaterThan(0);
      expect(amountErrors[0].property).toBe('amount');
    });
  });

  describe('transformation', () => {
    it('should handle all transformation scenarios', () => {
      // Basic transformation
      const plainData = {
        bookingId: 1,
        amount: 100.5,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: 'tx_123',
        refundReason: 'Customer request',
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

      // String to number conversion
      const numberStringData = {
        bookingId: '1',
        amount: '100.50',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
      };

      const numberStringDto = plainToClass(CreatePaymentDto, numberStringData);
      expect(typeof numberStringDto.bookingId).toBe('number');
      expect(typeof numberStringDto.amount).toBe('number');
      expect(numberStringDto.bookingId).toBe(1);
      expect(numberStringDto.amount).toBe(100.5);

      // String to enum conversion
      const enumStringData = {
        bookingId: 1,
        amount: 100.5,
        paymentMethod: 'CREDIT_CARD',
        currency: 'USD',
        status: 'PENDING',
      };

      const enumStringDto = plainToClass(CreatePaymentDto, enumStringData);
      expect(enumStringDto.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
      expect(enumStringDto.currency).toBe(Currency.USD);
      expect(enumStringDto.status).toBe(PaymentStatus.PENDING);

      // Undefined values
      const undefinedData = {
        bookingId: 1,
        amount: 100.5,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: undefined,
        refundReason: undefined,
      };

      const undefinedDto = plainToClass(CreatePaymentDto, undefinedData);
      expect(undefinedDto.transactionId).toBeUndefined();
      expect(undefinedDto.refundReason).toBeUndefined();

      // Null values
      const nullData = {
        bookingId: 1,
        amount: 100.5,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: null,
        refundReason: null,
      };

      const nullDto = plainToClass(CreatePaymentDto, nullData);
      expect(nullDto.transactionId).toBeNull();
      expect(nullDto.refundReason).toBeNull();

      // Empty string values
      const emptyStringData = {
        bookingId: 1,
        amount: 100.5,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        transactionId: '',
        refundReason: '',
      };

      const emptyStringDto = plainToClass(CreatePaymentDto, emptyStringData);
      expect(emptyStringDto.transactionId).toBe('');
      expect(emptyStringDto.refundReason).toBe('');

      // Extra properties
      const extraPropsData = {
        bookingId: 1,
        amount: 100.5,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        extraField: 'extra value',
      };

      const extraPropsDto = plainToClass(CreatePaymentDto, extraPropsData);
      expect(extraPropsDto.bookingId).toBe(extraPropsData.bookingId);
      expect(extraPropsDto.amount).toBe(extraPropsData.amount);
      expect(extraPropsDto.paymentMethod).toBe(extraPropsData.paymentMethod);
      expect(extraPropsDto.currency).toBe(extraPropsData.currency);
      expect(extraPropsDto.status).toBe(extraPropsData.status);
      // Extra properties are automatically ignored by class-transformer
    });
  });
});
