import { API_URL } from '@/config/constants';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  lastFour?: string;
  expiryDate?: string;
  cardBrand?: string;
  isDefault: boolean;
}

export interface PaymentData {
  bookingId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  cardDetails?: {
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
}

export interface PaymentResponse {
  id: string;
  bookingId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

class PaymentsService {
  private readonly baseUrl = `${API_URL}/payments`;

  async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    // This sends the data to our mock payment endpoint
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Payment failed');
    }

    return response.json();
  }

  async getPaymentByBookingId(bookingId: number): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/booking/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }

    return response.json();
  }

  async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }

    return response.json();
  }

  async getSavedPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await fetch(`${this.baseUrl}/methods`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return response.json();
  }

  async savePaymentMethod(paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(paymentMethodData),
    });

    if (!response.ok) {
      throw new Error('Failed to save payment method');
    }

    return response.json();
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete payment method');
    }

    return response.json();
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/methods/${paymentMethodId}/default`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to set default payment method');
    }

    return response.json();
  }

  async getPaymentHistory(): Promise<PaymentResponse[]> {
    const response = await fetch(`${this.baseUrl}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return response.json();
  }

  async requestRefund(paymentId: string, reason: string): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to request refund');
    }

    return response.json();
  }
}

export const paymentsService = new PaymentsService(); 