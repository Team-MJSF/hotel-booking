'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import useAuthStore from '@/store/authStore';
import { bookingsService } from '@/services/bookings-service';
import { Booking, BookingStatus } from '@/types/booking';
import Link from 'next/link';
import { useInfoToast } from '@/context/ToastContext';

export default function BookingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
  const infoToast = useInfoToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      infoToast(
        'Please log in to view your bookings',
        'Authentication Required',
        4000
      );
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router, infoToast]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: () => bookingsService.getBookings(statusFilter),
    enabled: isAuthenticated && !!user,
  });

  const statusOptions: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-gray-600">
              View and manage all your hotel bookings
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter(undefined)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === undefined
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {bookings?.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="mt-2 text-gray-600">
                {statusFilter
                  ? `You don't have any ${statusFilter} bookings.`
                  : "You haven't made any bookings yet."}
              </p>
              <div className="mt-6">
                <Link
                  href="/rooms"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Rooms
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {bookings?.map((booking: Booking) => (
                  <li key={booking.id}>
                    <Link href={`/bookings/${booking.id}`}>
                      <div className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="truncate">
                              <div className="flex">
                                <p className="font-medium text-blue-600 truncate">
                                  {booking.room?.name || `Room #${booking.roomId}`}
                                </p>
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <span>
                                    {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              <div className="mt-2 text-sm font-medium text-gray-900">
                                ${booking.totalPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {booking.status === 'pending' && (
                            <div className="mt-2">
                              <span className="inline-flex items-center text-xs text-yellow-600">
                                <svg
                                  className="mr-1 h-4 w-4"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Payment required
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 