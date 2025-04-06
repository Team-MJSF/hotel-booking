'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import PaymentForm from '@/components/payment/PaymentForm';
import { bookingsService } from '@/services/bookings-service';
import { paymentsService, PaymentResponse } from '@/services/payments-service';
import useAuthStore from '@/store/authStore';
import { useSuccessToast, useErrorToast } from '@/context/ToastContext';

interface PaymentPageProps {
  params: {
    id: string;
  };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { id } = params;
  const bookingId = parseInt(id, 10);
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      errorToast(
        'Please log in to access the payment page',
        'Authentication Required',
        4000
      );
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router, errorToast]);

  // Fetch booking details
  const { 
    data: booking, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsService.getBookingById(bookingId),
    enabled: isAuthenticated && !isNaN(bookingId),
  });

  const handlePaymentSuccess = (response: PaymentResponse) => {
    setPaymentStatus('success');
    setPaymentResponse(response);
    
    // Show success toast
    successToast(
      'Your payment was successful. Redirecting to your booking details...',
      'Payment Successful!',
      5000
    );
    
    // Wait for 3 seconds before redirecting to show success message
    setTimeout(() => {
      router.push(`/bookings/${bookingId}?payment=success`);
    }, 3000);
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus('error');
    
    // Error toasts are now handled in the PaymentForm component
    // The parent error handler is called to update the UI state
    
    // Log the error for debugging
    console.error('Payment processing error:', error);
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !booking) {
    return (
      <MainLayout>
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {isNaN(bookingId) ? 'Invalid booking ID' : 'Booking not found'}
              </h1>
              <p className="mt-2 text-gray-600">
                We couldn't find the booking you're trying to pay for.
              </p>
              <button
                onClick={() => router.push('/bookings')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if booking is already paid or cancelled
  if (booking.status === 'cancelled') {
    return (
      <MainLayout>
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                This booking has been cancelled
              </h1>
              <p className="mt-2 text-gray-600">
                You cannot make a payment for a cancelled booking.
              </p>
              <button
                onClick={() => router.push('/bookings')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (booking.status === 'confirmed' || booking.status === 'completed') {
    return (
      <MainLayout>
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                This booking has already been paid
              </h1>
              <p className="mt-2 text-gray-600">
                Your booking is confirmed. No additional payment is required.
              </p>
              <button
                onClick={() => router.push(`/bookings/${bookingId}`)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Booking Details
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
            <p className="mt-2 text-sm text-gray-600">
              Secure checkout for your booking at {booking.room?.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Booking Summary */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h2>
              
              {booking.room && (
                <div className="mb-4">
                  <div className="font-medium text-gray-900">{booking.room.name}</div>
                  <div className="text-sm text-gray-600">{booking.room.type}</div>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {calculateNights(booking.checkInDate, booking.checkOutDate)} night
                    {calculateNights(booking.checkInDate, booking.checkOutDate) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{booking.guestCount}</span>
                </div>
                {booking.room && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Room rate:</span>
                    <span className="font-medium">${booking.room.price.toFixed(2)} / night</span>
                  </div>
                )}
                {booking.specialRequests && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-600 block mb-1">Special Requests:</span>
                    <span className="text-gray-800 italic">{booking.specialRequests}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Form */}
            <div className="md:col-span-3">
              <PaymentForm
                bookingId={bookingId}
                amount={booking.totalPrice}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 