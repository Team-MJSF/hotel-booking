'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import useAuthStore from '@/store/authStore';
import { bookingsService } from '@/services/bookings-service';
import { Booking } from '@/types/booking';
import Image from 'next/image';
import { useSuccessToast, useErrorToast, useInfoToast } from '@/context/ToastContext';

interface BookingDetailsPageProps {
  params: {
    id: string;
  };
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { id } = params;
  const bookingId = parseInt(id, 10);
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();

  // Show payment success toast if redirected from payment page
  useEffect(() => {
    if (paymentSuccess) {
      successToast(
        'Your payment was processed successfully. Your booking is now confirmed.',
        'Payment Successful!',
        5000
      );
    }
  }, [paymentSuccess, successToast]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      infoToast(
        'Please log in to view your booking details',
        'Authentication Required',
        4000
      );
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router, infoToast]);

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsService.getBookingById(bookingId),
    enabled: isAuthenticated && !!user && !isNaN(bookingId),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    // Show a confirmation dialog
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsService.cancelBooking(bookingId);
      
      // Show success toast
      successToast(
        'Your booking has been cancelled successfully.',
        'Booking Cancelled',
        5000
      );
      
      router.refresh();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      
      // Show error toast
      errorToast(
        'Failed to cancel booking. Please try again.',
        'Cancellation Failed',
        8000
      );
    }
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
                We couldn't find the booking you're looking for.
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

  return (
    <MainLayout>
      <div className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.id}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Reserved on {formatDate(booking.createdAt)}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Booking Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div className="md:col-span-2">
                <div className="overflow-hidden rounded-lg">
                  {booking.room?.images && booking.room.images.length > 0 ? (
                    <div className="relative h-64 w-full">
                      <Image
                        src={booking.room.images[0]}
                        alt={booking.room?.name || 'Room image'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-gray-200 flex justify-center items-center rounded-lg">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold">{booking.room?.name}</h3>
                  <p className="mt-2 text-gray-600">{booking.room?.description}</p>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Room Details</h4>
                      <ul className="mt-2 text-sm text-gray-600 space-y-2">
                        <li>Type: {booking.room?.type}</li>
                        <li>Size: {booking.room?.size} m²</li>
                        <li>Capacity: {booking.room?.capacity} {booking.room?.capacity === 1 ? 'person' : 'people'}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Amenities</h4>
                      <ul className="mt-2 text-sm text-gray-600 space-y-2">
                        {booking.room?.amenities?.map((amenity, index) => (
                          <li key={index}>{amenity}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-md">
                      <h4 className="font-medium text-blue-900">Special Requests</h4>
                      <p className="mt-2 text-blue-700">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600">Length of stay</span>
                      <span className="font-medium">
                        {calculateNights(booking.checkInDate, booking.checkOutDate)} night
                        {calculateNights(booking.checkInDate, booking.checkOutDate) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests</span>
                      <span className="font-medium">{booking.guestCount}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600">Room rate</span>
                      <span className="font-medium">${booking.room?.price?.toFixed(2)} / night</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${booking.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => router.push(`/bookings/payment/${booking.id}`)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Pay Now
                    </button>
                  )}
                  
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <button
                      onClick={handleCancelBooking}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push('/bookings')}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Bookings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 