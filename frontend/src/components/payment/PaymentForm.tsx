'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentData, paymentsService } from '@/services/payments-service';
import { useWarningToast, useErrorToast } from '@/context/ToastContext';

// Validation schema for payment form
const paymentSchema = z.object({
  cardNumber: z.string()
    .min(16, 'Card number must be at least 16 digits')
    .max(19, 'Card number cannot exceed 19 digits')
    .regex(/^[0-9]+$/, 'Card number must contain only digits'),
  cardholderName: z.string()
    .min(3, 'Cardholder name is required')
    .max(100, 'Cardholder name is too long'),
  expiryMonth: z.string()
    .min(1, 'Expiry month is required')
    .max(2, 'Invalid expiry month'),
  expiryYear: z.string()
    .min(2, 'Expiry year is required')
    .max(4, 'Invalid expiry year'),
  cvv: z.string()
    .min(3, 'CVV must be 3 or 4 digits')
    .max(4, 'CVV must be 3 or 4 digits')
    .regex(/^[0-9]+$/, 'CVV must contain only digits'),
  saveCard: z.boolean().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  bookingId: number;
  amount: number;
  currency?: string;
  onPaymentSuccess: (response: any) => void;
  onPaymentError: (error: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  currency = 'USD',
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  
  // Toast hooks
  const warningToast = useWarningToast();
  const errorToast = useErrorToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      saveCard: false,
    },
  });

  React.useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        const cards = await paymentsService.getSavedPaymentMethods();
        setSavedCards(cards.filter(card => card.type === 'credit_card'));
      } catch (error) {
        console.error('Error fetching saved payment methods:', error);
      }
    };

    fetchSavedCards();
  }, []);

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  const validateExpiryDate = (month: string, year: string) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Validate month is between 1-12
    const expiryMonth = parseInt(month, 10);
    if (isNaN(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
      warningToast(
        'Please enter a valid month (1-12)',
        'Invalid Month',
        3000
      );
      return false;
    }

    // Convert 2-digit year to 4-digit
    const expiryYear = parseInt(year.length === 2 ? `20${year}` : year, 10);
    
    // Validate year format
    if (isNaN(expiryYear)) {
      warningToast(
        'Please enter a valid year',
        'Invalid Year',
        3000
      );
      return false;
    }

    // Check if card is expired
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      errorToast(
        'The card has expired. Please use a different card.',
        'Card Expired',
        4000
      );
      return false;
    }
    
    return true;
  };

  // Function to validate Luhn algorithm (credit card checksum)
  const validateCardNumber = (cardNumber: string): boolean => {
    // Remove spaces
    const value = cardNumber.replace(/\s+/g, '');
    
    // Check if contains only digits
    if (!/^\d+$/.test(value)) {
      warningToast(
        'Card number should contain only digits',
        'Invalid Card Number',
        3000
      );
      return false;
    }
    
    // Check length (most cards are 16 digits, AmEx is 15)
    if (value.length < 15 || value.length > 19) {
      warningToast(
        'Card number should be between 15-19 digits',
        'Invalid Card Length',
        3000
      );
      return false;
    }
    
    // Implement basic Luhn algorithm check
    let sum = 0;
    let shouldDouble = false;
    
    // Loop from right to left
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    // If sum is divisible by 10, card number is valid
    if (sum % 10 !== 0) {
      errorToast(
        'The card number you entered is invalid. Please check and try again.',
        'Invalid Card Number',
        4000
      );
      return false;
    }
    
    return true;
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);

    try {
      // Additional client-side validation
      if (!validateCardNumber(data.cardNumber)) {
        setIsProcessing(false);
        return;
      }
      
      // Validate expiry date
      if (!validateExpiryDate(data.expiryMonth, data.expiryYear)) {
        setIsProcessing(false);
        return;
      }

      // Prepare payment data
      const paymentData: PaymentData = {
        bookingId,
        amount,
        currency,
        paymentMethod,
      };

      if (useSavedCard && selectedCardId) {
        paymentData.paymentMethod = selectedCardId;
      } else {
        paymentData.cardDetails = {
          cardNumber: data.cardNumber.replace(/\s/g, ''),
          cardholderName: data.cardholderName,
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          cvv: data.cvv,
        };

        // Save card if requested
        if (data.saveCard) {
          try {
            await paymentsService.savePaymentMethod({
              type: 'credit_card',
              lastFour: data.cardNumber.slice(-4),
              expiryDate: `${data.expiryMonth}/${data.expiryYear}`,
              cardBrand: getCardType(data.cardNumber),
              isDefault: savedCards.length === 0,
            });
          } catch (error) {
            console.error('Error saving card:', error);
          }
        }
      }

      // Process the payment
      const response = await paymentsService.processPayment(paymentData);
      
      // Handle success
      onPaymentSuccess(response);
      reset();
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Display appropriate error toast based on error message
      if (error.message?.includes('insufficient funds')) {
        errorToast(
          'Your card has insufficient funds for this transaction.',
          'Payment Failed: Insufficient Funds',
          5000
        );
      } else if (error.message?.includes('declined')) {
        errorToast(
          'Your card was declined. Please try a different payment method.',
          'Payment Failed: Card Declined',
          5000
        );
      } else if (error.message?.includes('invalid')) {
        errorToast(
          'Your payment information is invalid. Please check your card details.',
          'Payment Failed: Invalid Information',
          5000
        );
      } else {
        // Generic error handling
        errorToast(
          error.message || 'There was a problem processing your payment. Please try again.',
          'Payment Error',
          5000
        );
      }
      
      // Call the parent error handler
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardType = (cardNumber: string): string => {
    // Simple card type detection
    const cleanedNumber = cardNumber.replace(/\s+/g, '');
    if (cleanedNumber.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanedNumber)) return 'MasterCard';
    if (/^3[47]/.test(cleanedNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanedNumber)) return 'Discover';
    return 'Unknown';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Information</h2>
      
      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <div className="grid grid-cols-3 gap-4">
          <div
            className={`border rounded-md p-4 text-center cursor-pointer ${
              paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => setPaymentMethod('credit_card')}
          >
            <div className="text-xl mb-1">💳</div>
            <div className="text-sm font-medium">Credit Card</div>
          </div>
          <div
            className={`border rounded-md p-4 text-center cursor-pointer ${
              paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 opacity-50'
            }`}
            onClick={() => {}} // Disabled for this project
          >
            <div className="text-xl mb-1">🅿️</div>
            <div className="text-sm font-medium">PayPal</div>
            <div className="text-xs text-gray-500 mt-1">Coming soon</div>
          </div>
          <div
            className={`border rounded-md p-4 text-center cursor-pointer ${
              paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 opacity-50'
            }`}
            onClick={() => {}} // Disabled for this project
          >
            <div className="text-xl mb-1">🏦</div>
            <div className="text-sm font-medium">Bank Transfer</div>
            <div className="text-xs text-gray-500 mt-1">Coming soon</div>
          </div>
        </div>
      </div>

      {/* Saved Cards Section */}
      {paymentMethod === 'credit_card' && savedCards.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <input
              id="useSavedCard"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={useSavedCard}
              onChange={(e) => setUseSavedCard(e.target.checked)}
            />
            <label htmlFor="useSavedCard" className="ml-2 block text-sm font-medium text-gray-700">
              Use a saved card
            </label>
          </div>

          {useSavedCard && (
            <div className="space-y-3">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className={`border rounded-md p-3 flex items-center cursor-pointer ${
                    selectedCardId === card.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={() => setSelectedCardId(card.id)}
                >
                  <input
                    type="radio"
                    name="savedCard"
                    id={`card-${card.id}`}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={selectedCardId === card.id}
                    onChange={() => setSelectedCardId(card.id)}
                  />
                  <label htmlFor={`card-${card.id}`} className="ml-3 flex-1 flex items-center">
                    <span className="font-medium text-gray-700 mr-2">{card.cardBrand}</span>
                    <span className="text-gray-600">•••• {card.lastFour}</span>
                    <span className="text-gray-500 text-sm ml-auto">Expires: {card.expiryDate}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Credit Card Form */}
      {paymentMethod === 'credit_card' && !useSavedCard && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              {...register('cardNumber')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              onChange={(e) => {
                e.target.value = formatCardNumber(e.target.value);
              }}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              id="cardholderName"
              type="text"
              {...register('cardholderName')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.cardholderName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {errors.cardholderName && (
              <p className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    id="expiryMonth"
                    type="text"
                    {...register('expiryMonth')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="MM"
                    maxLength={2}
                  />
                  {errors.expiryMonth && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryMonth.message}</p>
                  )}
                </div>
                <div>
                  <input
                    id="expiryYear"
                    type="text"
                    {...register('expiryYear')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="YY"
                    maxLength={2}
                  />
                  {errors.expiryYear && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryYear.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                id="cvv"
                type="password"
                {...register('cvv')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123"
                maxLength={4}
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="saveCard"
              type="checkbox"
              {...register('saveCard')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
              Save this card for future bookings
            </label>
          </div>
        </form>
      )}

      {/* Amount Summary */}
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center text-gray-800 font-medium">
          <span>Total Amount:</span>
          <span className="text-lg">{currency} {amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isProcessing || (useSavedCard && !selectedCardId)}
          className={`w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isProcessing || (useSavedCard && !selectedCardId) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            `Pay ${currency} ${amount.toFixed(2)}`
          )}
        </button>
      </div>

      {/* Security Note */}
      <div className="mt-4 text-xs text-gray-500 text-center flex items-center justify-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by industry standard encryption. Your payment details are safe.
      </div>
    </div>
  );
};

export default PaymentForm; 