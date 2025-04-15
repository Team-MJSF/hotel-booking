'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Booking, Room, RoomType } from '@/types';
import { bookingService } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Calendar, CheckCircle, AlertTriangle, X, Check, Info } from 'lucide-react';

// Sample room images (in a real app, these would come from API)
const ROOM_IMAGES: Record<string, string> = {
  '1': '/images/deluxe-suite.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/standard-room.jpg',
  '5': '/images/premium-suite.jpg',
};

// Function to get mock bookings data (would be fetched from API in production)
const getMockBookings = (): Booking[] => {
  const today = new Date();
  
  // Create dates for various booking scenarios
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return [
    {
      id: 'booking-' + Date.now(),
      userId: 'user-1',
      roomId: '1',
      room: {
        id: '1',
        roomNumber: '101',
        roomTypeId: '1',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roomType: {
          id: '1',
          name: 'Deluxe Suite',
          description: 'Spacious suite with city views',
          pricePerNight: 29900,
          capacity: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      checkInDate: nextWeek.toISOString(),
      checkOutDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      totalPrice: 89700, // 3 nights at 29900
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      specialRequests: 'Late check-in, around 10pm',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'booking-' + (Date.now() - 1000),
      userId: 'user-1',
      roomId: '3',
      room: {
        id: '3',
        roomNumber: '302',
        roomTypeId: '3',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roomType: {
          id: '3',
          name: 'Family Suite',
          description: 'Perfect for families with two bedrooms',
          pricePerNight: 34900,
          capacity: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      checkInDate: yesterday.toISOString(),
      checkOutDate: tomorrow.toISOString(),
      totalPrice: 69800, // 2 nights at 34900
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'booking-' + (Date.now() - 2000),
      userId: 'user-1',
      roomId: '2',
      room: {
        id: '2',
        roomNumber: '205',
        roomTypeId: '2',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roomType: {
          id: '2',
          name: 'Executive Room',
          description: 'Modern room with work area',
          pricePerNight: 19900,
          capacity: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      checkInDate: lastWeek.toISOString(),
      checkOutDate: yesterday.toISOString(),
      totalPrice: 119400, // 6 nights at 19900
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    searchParams.get('success') === 'true' 
      ? 'Your booking has been confirmed successfully!' 
      : null
  );
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'current' | 'past'>('all');
  
  // Load bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would fetch bookings from the API
        // const response = await bookingService.getUserBookings();
        
        // For now, use mock data
        const mockBookings = getMockBookings();
        
        // Sort bookings by check-in date (newest first)
        mockBookings.sort((a, b) => 
          new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
        );
        
        setBookings(mockBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setError('Please log in to view your bookings');
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Filter bookings
  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    
    const today = new Date();
    
    if (filter === 'upcoming') {
      return bookings.filter(booking => new Date(booking.checkInDate) > today);
    }
    
    if (filter === 'current') {
      return bookings.filter(booking => 
        new Date(booking.checkInDate) <= today && new Date(booking.checkOutDate) >= today
      );
    }
    
    if (filter === 'past') {
      return bookings.filter(booking => new Date(booking.checkOutDate) < today);
    }
    
    return bookings;
  };
  
  // Check if a booking can be cancelled
  const canCancelBooking = (booking: Booking) => {
    // In a real app, this would follow business rules
    // Example: Can cancel if more than 24 hours before check-in and status is not already cancelled
    const today = new Date();
    const checkIn = new Date(booking.checkInDate);
    const hoursUntilCheckIn = (checkIn.getTime() - today.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilCheckIn > 24 && booking.status !== 'CANCELLED';
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (cancellingBookingId) return; // Already cancelling a booking
    
    try {
      setCancellingBookingId(bookingId);
      
      // In a real app, this would call the API
      // const response = await bookingService.cancelBooking(bookingId);
      
      // For now, simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the booking status in the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'CANCELLED' as const } 
            : booking
        )
      );
      
      setSuccessMessage('Booking cancelled successfully. A refund will be processed according to our cancellation policy.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again later.');
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setCancellingBookingId(null);
    }
  };
  
  // Get booking status label and color
  const getStatusDetails = (booking: Booking) => {
    const statusMap = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    };
    
    return statusMap[booking.status] || { label: booking.status, color: 'bg-gray-100 text-gray-800' };
  };
  
  if (loading) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }
  
  if (error && !isAuthenticated) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Not Logged In</h2>
          <p className="mb-6">Please log in to view your bookings</p>
          <Link href="/login?redirect=/bookings">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const filteredBookings = getFilteredBookings();
  
  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        <div className="text-center mb-8">
          <h1 className="hotel-heading mb-4">My Bookings</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage all your bookings in one place. You can see upcoming stays, check booking details, and cancel reservations if needed.
          </p>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-800">{successMessage}</p>
            </div>
            <button 
              className="text-green-500 hover:text-green-700" 
              onClick={() => setSuccessMessage(null)}
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button 
              className="text-red-500 hover:text-red-700" 
              onClick={() => setError(null)}
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              className={`px-4 py-3 font-medium text-sm ${filter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setFilter('all')}
            >
              All Bookings
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${filter === 'upcoming' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${filter === 'current' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setFilter('current')}
            >
              Current Stay
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${filter === 'past' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setFilter('past')}
            >
              Past Stays
            </button>
          </div>
        </div>
        
        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You don't have any bookings yet." 
                : `You don't have any ${filter} bookings.`}
            </p>
            <Link href="/rooms">
              <Button>Browse Rooms</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map(booking => {
              const { label: statusLabel, color: statusColor } = getStatusDetails(booking);
              const roomType = booking.room?.roomType;
              const roomId = booking.room?.roomType?.id || '1';
              
              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-3 relative h-48 md:h-auto">
                      <Image
                        src={ROOM_IMAGES[roomId] || '/images/room-placeholder.jpg'}
                        alt={roomType?.name || 'Hotel Room'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="p-6 md:col-span-9">
                      <div className="flex flex-col h-full">
                        <div className="flex flex-wrap justify-between items-start">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                              {roomType?.name || 'Room'}
                            </h2>
                            <p className="text-gray-600 mb-2">
                              {booking.room?.roomNumber && `Room ${booking.room.roomNumber}`}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                              {statusLabel}
                            </span>
                            <p className="text-lg font-bold text-primary mt-2">
                              {formatPrice(booking.totalPrice)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Check-in</span>
                            <span className="font-medium">{formatDate(new Date(booking.checkInDate))}</span>
                            <span className="text-sm text-gray-500">After 3:00 PM</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Check-out</span>
                            <span className="font-medium">{formatDate(new Date(booking.checkOutDate))}</span>
                            <span className="text-sm text-gray-500">Before 12:00 PM</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Guests</span>
                            <span className="font-medium">{roomType?.capacity || 2} Guests</span>
                          </div>
                        </div>
                        
                        {booking.specialRequests && (
                          <div className="mb-6">
                            <p className="text-sm text-gray-500">Special Requests:</p>
                            <p className="text-sm">{booking.specialRequests}</p>
                          </div>
                        )}
                        
                        <div className="mt-auto flex flex-wrap gap-3">
                          <Link href={`/bookings/${booking.id}`}>
                            <Button variant="outline" className="flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          
                          {canCancelBooking(booking) && (
                            <Button 
                              variant="outline" 
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingBookingId === booking.id}
                            >
                              {cancellingBookingId === booking.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 