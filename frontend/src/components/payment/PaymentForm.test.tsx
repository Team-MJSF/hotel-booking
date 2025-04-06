import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import PaymentForm from './PaymentForm';

// Mock the module
const mockProcessPayment = jest.fn();
const mockGetSavedPaymentMethods = jest.fn();
const mockSavePaymentMethod = jest.fn();

jest.mock('@/services/payments-service', () => ({
  paymentsService: {
    getSavedPaymentMethods: (...args: any[]) => mockGetSavedPaymentMethods(...args),
    savePaymentMethod: (...args: any[]) => mockSavePaymentMethod(...args),
    processPayment: (...args: any[]) => mockProcessPayment(...args),
  }
}));

// Mock toast context
const mockErrorToast = jest.fn();
const mockWarningToast = jest.fn();
const mockSuccessToast = jest.fn();

jest.mock('@/context/ToastContext', () => ({
  useSuccessToast: () => mockSuccessToast,
  useErrorToast: () => mockErrorToast,
  useWarningToast: () => mockWarningToast,
}));

// Helper to suppress console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (args[0]?.includes('React does not recognize the')) return;
    if (args[0]?.includes('An update to PaymentForm inside a test was not wrapped in act')) return;
    if (args[0]?.includes('Warning: validateDOMNesting')) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('PaymentForm', () => {
  const mockProps = {
    bookingId: 123,
    amount: 100,
    currency: 'USD',
    onPaymentSuccess: jest.fn(),
    onPaymentError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSavedPaymentMethods.mockResolvedValue([]);
    mockProcessPayment.mockResolvedValue({
      id: 'payment_123',
      bookingId: 123,
      amount: 100,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'credit_card',
      transactionId: 'txn_123',
      createdAt: new Date().toISOString()
    });
  });

  it('renders correctly with all UI elements and handles currency display', async () => {
    await act(async () => {
      render(<PaymentForm {...mockProps} />);
    });
    
    // Test headings and payment options
    expect(screen.getByText('Payment Information')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    
    // Test form fields
    expect(screen.getByLabelText(/Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cardholder Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Expiry Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CVV/i)).toBeInTheDocument();
    
    // Test amount and payment button
    expect(screen.getByText(/Total Amount:/i)).toBeInTheDocument();
    expect(screen.getByText(`USD ${mockProps.amount.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Pay USD ${mockProps.amount.toFixed(2)}`)).toBeInTheDocument();
    
    // Test payment methods display and styling
    const paymentMethods = screen.getAllByText(/Credit Card|PayPal|Bank Transfer/);
    
    // Credit Card should be the first option
    const creditCardMethod = paymentMethods[0];
    
    // Find the parent container that has the border styling
    const creditCardContainer = creditCardMethod.closest('div')?.parentElement;
    expect(creditCardContainer).toHaveClass('border-blue-500');
    
    // Find the PayPal and Bank Transfer containers 
    const paypalMethod = paymentMethods[1];
    const bankTransferMethod = paymentMethods[2];
    
    const paypalContainer = paypalMethod.closest('div')?.parentElement;
    const bankTransferContainer = bankTransferMethod.closest('div')?.parentElement;
    
    // Verify they have the opacity class applied
    expect(paypalContainer).toHaveClass('opacity-50');
    expect(bankTransferContainer).toHaveClass('opacity-50');
    
    // Verify the "Coming soon" text is displayed for disabled options
    expect(screen.getAllByText('Coming soon').length).toBe(2);
    
    // Test with different currency
    const customProps = {
      ...mockProps,
      currency: 'EUR',
      amount: 150,
    };
    
    // Re-render with different currency
    await act(async () => {
      render(<PaymentForm {...customProps} />);
    });
    
    // Verify currency is displayed correctly
    expect(screen.getByText(`EUR ${customProps.amount.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Pay EUR ${customProps.amount.toFixed(2)}`)).toBeInTheDocument();
  });

  it('validates form inputs and formats card number correctly', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<PaymentForm {...mockProps} />);
    });
    
    // Test card number formatting
    const cardNumberInput = screen.getByLabelText(/Card Number/i);
    await user.type(cardNumberInput, '4111222233334444');
    expect(cardNumberInput).toHaveValue('4111 2222 3333 4444');
    
    // Test validation on empty form submission
    const payButton = screen.getByText(`Pay USD ${mockProps.amount.toFixed(2)}`);
    await user.clear(cardNumberInput); // Clear the card number
    await user.click(payButton);
    
    // Check for validation errors on empty form
    await waitFor(() => {
      expect(screen.getByText(/Card number must be at least 16 digits/i)).toBeInTheDocument();
    });
    
    // Test cardholder name validation
    await user.type(cardNumberInput, '4111222233334444');
    await user.click(payButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Cardholder name is required/i)).toBeInTheDocument();
    });
    
    // Fill cardholder name and test CVV validation
    await user.type(screen.getByLabelText(/Cardholder Name/i), 'John Doe');
    await user.click(payButton);
    
    await waitFor(() => {
      expect(screen.getByText(/CVV must be 3 or 4 digits/i)).toBeInTheDocument();
    });
    
    // Fill CVV and test expiry date validation
    await user.type(screen.getByLabelText(/CVV/i), '123');
    await user.click(payButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Expiry month is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Expiry year is required/i)).toBeInTheDocument();
    });
  });

  it('handles saved cards functionality', async () => {
    // Test save card checkbox functionality
    const user = userEvent.setup();
    
    await act(async () => {
      render(<PaymentForm {...mockProps} />);
    });
    
    // Locate and click the save card checkbox
    const saveCardCheckbox = screen.getByLabelText(/Save this card for future bookings/i);
    expect(saveCardCheckbox).not.toBeChecked();
    
    // Check the checkbox
    await user.click(saveCardCheckbox);
    expect(saveCardCheckbox).toBeChecked();
    
    // Uncheck the checkbox
    await user.click(saveCardCheckbox);
    expect(saveCardCheckbox).not.toBeChecked();
    
    // Test saved cards display - single card
    const mockSavedCards = [
      {
        id: 'card_123',
        type: 'credit_card' as const,
        lastFour: '1234',
        expiryDate: '12/25',
        cardBrand: 'Visa',
        isDefault: true
      }
    ];
    
    // Unmount previous component to avoid state interference
    await act(async () => {
      render(<PaymentForm {...mockProps} />, { container: document.body }); // Use a fresh container
    });
    
    // Mock before component checks for saved cards
    mockGetSavedPaymentMethods.mockResolvedValue(mockSavedCards);
    
    // Completely remount the component to get fresh state
    const { unmount, rerender } = render(<PaymentForm {...mockProps} />);
    
    // Wait for saved cards checkbox to appear (showing that saved cards were loaded)
    await waitFor(() => {
      expect(screen.getByLabelText(/Use a saved card/i)).toBeInTheDocument();
    });
    
    // Toggle the saved card option
    await user.click(screen.getByLabelText(/Use a saved card/i));
    
    // Check if the saved card is displayed
    await waitFor(() => {
      expect(screen.getByText('Visa')).toBeInTheDocument();
      expect(screen.getByText(/•••• 1234/)).toBeInTheDocument();
    });
    
    // Clean up this render before testing multiple cards
    unmount();
    
    // Test multiple saved cards
    const multipleCards = [
      {
        id: 'card_123',
        type: 'credit_card' as const,
        lastFour: '1234',
        expiryDate: '12/25',
        cardBrand: 'Visa',
        isDefault: true
      },
      {
        id: 'card_456',
        type: 'credit_card' as const,
        lastFour: '5678',
        expiryDate: '10/26',
        cardBrand: 'MasterCard',
        isDefault: false
      }
    ];
    
    mockGetSavedPaymentMethods.mockResolvedValue(multipleCards);
    
    // Create a new component instance completely
    render(<PaymentForm {...mockProps} />);
    
    // Wait for saved cards checkbox to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Use a saved card/i)).toBeInTheDocument();
    });
    
    // Toggle the saved card option
    await user.click(screen.getByLabelText(/Use a saved card/i));
    
    // Check if both saved cards are displayed
    await waitFor(() => {
      expect(screen.getByText('Visa')).toBeInTheDocument();
      expect(screen.getByText(/•••• 1234/)).toBeInTheDocument();
      expect(screen.getByText('MasterCard')).toBeInTheDocument();
      expect(screen.getByText(/•••• 5678/)).toBeInTheDocument();
    });
    
    // Wait for radio buttons to be available
    await waitFor(() => {
      expect(screen.getAllByRole('radio').length).toBe(2);
    });
    
    // Select second card
    const secondCardRadio = screen.getAllByRole('radio')[1];
    await user.click(secondCardRadio);
    
    // Verify the radio button is selected
    expect(secondCardRadio).toBeChecked();
  });
}); 