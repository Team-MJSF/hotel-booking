import { api } from './client';

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal';
  transactionId?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal';
  cardDetails?: {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
}

export interface ProcessRefundRequest {
  bookingId: number;
  amount?: number; // If not provided, full amount will be refunded
  reason?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const paymentsService = {
  getUserPayments: async (page = 1, limit = 10): Promise<PaginatedResponse<Payment>> => {
    const response = await api.get<PaginatedResponse<Payment>>('/payments', {
      params: { page, limit }
    });
    return response.data;
  },
  
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },
  
  getPaymentsByBookingId: async (bookingId: number): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`/payments/booking/${bookingId}`);
    return response.data;
  },
  
  createPayment: async (paymentData: CreatePaymentRequest): Promise<Payment> => {
    const response = await api.post<Payment>('/payments', paymentData);
    return response.data;
  },
  
  processRefund: async (paymentId: number, refundData: ProcessRefundRequest): Promise<Payment> => {
    const response = await api.post<Payment>(`/payments/${paymentId}/refund`, refundData);
    return response.data;
  },
  
  // Admin functions
  getAllPayments: async (page = 1, limit = 10): Promise<PaginatedResponse<Payment>> => {
    const response = await api.get<PaginatedResponse<Payment>>('/payments/all', {
      params: { page, limit }
    });
    return response.data;
  },
  
  updatePaymentStatus: async (
    paymentId: number, 
    status: 'pending' | 'completed' | 'failed' | 'refunded'
  ): Promise<Payment> => {
    const response = await api.patch<Payment>(
      `/payments/${paymentId}/status`, 
      { status }
    );
    return response.data;
  }
};

export default paymentsService; 