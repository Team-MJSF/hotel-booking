'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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

// Function to get fallback bookings data if API call fails
const getFallbackBookings = (): Booking[] => {
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
      roomTypeId: '1',
      roomTypeName: 'Deluxe Suite',
      roomNumber: '101',
      guestCount: 2,
      room: {
        id: '1',
        roomNumber: '101',
        roomTypeId: '1',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roomType: {
          id: 1,
          name: 'Deluxe Suite',
          code: 'DELUXE',
          description: 'Spacious suite with city views',
          pricePerNight: 29900,
          maxGuests: 2,
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
    // Additional fallback bookings removed for brevity
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
  const [useFallbackData, setUseFallbackData] = useState<boolean>(false);
  
  // Load bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setUseFallbackData(false);
        
        // Use the real bookingService API call
        const response = await bookingService.getUserBookings();
        
        if (response.success && response.data) {
          // Sort bookings by check-in date (newest first)
          const sortedBookings = [...response.data].sort((a, b) => 
            new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
          );
          
          setBookings(sortedBookings);
          console.log('Loaded user bookings:', sortedBookings.length);
        } else {
          // Handle API error with clear message
          const errorMsg = response.error || 'Unknown error';
          console.error('Failed to load bookings:', errorMsg);
          setError(`Failed to load your bookings. There may be an issue with the booking service.`);
          setBookings([]);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
        setBookings([]);
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

  // Function to load demo data for school project
  const loadDemoData = () => {
    setUseFallbackData(true);
    setError(null);
    
    // Create realistic demo bookings
    const today = new Date();
    
    // Create dates for various booking scenarios
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const demoBookings: Booking[] = [
      {
        id: 'booking-demo1',
        userId: 'current-user',
        roomId: '1',
        roomTypeId: '1',
        roomTypeName: 'Deluxe Suite',
        roomNumber: '101',
        guestCount: 2,
        room: {
          id: '1',
          roomNumber: '101',
          roomTypeId: '1',
          status: 'AVAILABLE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          roomType: {
            id: 1,
            name: 'Deluxe Suite',
            code: 'DELUXE',
            description: 'Spacious suite with city views',
            pricePerNight: 29900,
            maxGuests: 2,
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
        id: 'booking-demo2',
        userId: 'current-user',
        roomId: '3',
        roomTypeId: '3',
        roomTypeName: 'Family Suite',
        roomNumber: '305',
        guestCount: 4,
        room: {
          id: '3',
          roomNumber: '305',
          roomTypeId: '3',
          status: 'AVAILABLE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          roomType: {
            id: 3,
            name: 'Family Suite',
            code: 'FAMILY',
            description: 'Perfect for families with two bedrooms',
            pricePerNight: 34900,
            maxGuests: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        checkInDate: lastWeek.toISOString(),
        checkOutDate: today.toISOString(),
        totalPrice: 34900 * 7, // 7 nights
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        specialRequests: 'Extra towels and pillows',
        createdAt: new Date(lastWeek.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(lastWeek.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
    ];
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('mockBookings', JSON.stringify(demoBookings));
      console.log('Stored demo bookings in localStorage:', demoBookings);
    } catch (storageError) {
      console.error('Error storing demo bookings in localStorage:', storageError);
    }
    
    // Update state with demo bookings
    setBookings(demoBookings);
    setSuccessMessage('Demo bookings loaded successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
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
    // For the school project, allow cancellation of any booking that's not already cancelled
    // This ensures the cancel button is always visible for testing purposes
    return booking.status !== 'CANCELLED';
    
    // Real-world logic (commented out for the school project):
    // const today = new Date();
    // const checkIn = new Date(booking.checkInDate);
    // const hoursUntilCheckIn = (checkIn.getTime() - today.getTime()) / (1000 * 60 * 60);
    // return hoursUntilCheckIn > 24 && booking.status !== 'CANCELLED';
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (cancellingBookingId) return; // Already cancelling a booking
    
    try {
      setCancellingBookingId(bookingId);
      
      // Use the API service to cancel the booking
      const response = await bookingService.cancelBooking(bookingId);
      
      if (response.success && response.data) {
        // Update the booking status in the local state with the response data
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
      } else {
        // Handle API error
        console.error('Failed to cancel booking:', response.error);
        setError(`Failed to cancel booking: ${response.error || 'Unknown error'}`);
        
        // Clear error message after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      
      // Try to update local state anyway since localStorage mock might have worked
      try {
        const mockBookingsJSON = localStorage.getItem('mockBookings');
        if (mockBookingsJSON) {
          const mockBookings = JSON.parse(mockBookingsJSON);
          const booking = mockBookings.find((b: Booking) => b.id === bookingId);
          
          if (booking && booking.status === 'CANCELLED') {
            // The mock cancellation worked, update the local state
            setBookings(prevBookings => 
              prevBookings.map(booking => 
                booking.id === bookingId 
                  ? { ...booking, status: 'CANCELLED' as const } 
                  : booking
              )
            );
            
            setSuccessMessage('Booking cancelled successfully. A refund will be processed according to our cancellation policy.');
            setTimeout(() => setSuccessMessage(null), 5000);
            return;
          }
        }
      } catch (storageError) {
        console.error('Error checking localStorage after cancel failure:', storageError);
      }
      
      // If we reach here, both API and localStorage approaches failed
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
  
  if (filteredBookings.length === 0) {
    return (
      <div className="hotel-container py-12 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="hotel-heading mb-4">My Bookings</h1>
          </div>
          
          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
            <p className="text-gray-600 mb-6">You don't have any bookings yet. Book a room to get started.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/rooms">
                <Button>Browse Rooms</Button>
              </Link>
              
              {/* For school project: Button to load demo data */}
              <Button variant="outline" onClick={loadDemoData}>
                Load Demo Bookings
              </Button>
            </div>
            
            {/* For school project: Additional information */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">School Project Information</p>
                  <p className="text-left">
                    This is a mock hotel booking system for educational purposes. To see example bookings without using
                    the backend API, click the "Load Demo Bookings" button above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
              {!useFallbackData && (
                <button 
                  onClick={loadDemoData}
                  className="text-blue-600 hover:text-blue-800 mt-2 font-medium text-sm"
                >
                  Load demo bookings for testing
                </button>
              )}
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

        {/* Demo data indicator */}
        {useFallbackData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-blue-800">
                <strong>Demo Mode:</strong> Showing sample bookings for demonstration purposes. These are not your actual bookings.
              </p>
            </div>
            <button 
              className="text-blue-500 hover:text-blue-700" 
              onClick={() => setUseFallbackData(false)}
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
        <div className="space-y-6">
          {filteredBookings.map(booking => {
            const { label: statusLabel, color: statusColor } = getStatusDetails(booking);
            const roomType = booking.room?.roomType;
            const roomTypeId = booking.roomTypeId || booking.room?.roomType?.id?.toString() || '1';
            
            return (
              <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-3 relative h-48 md:h-auto">
                    <Image
                      src={ROOM_IMAGES[roomTypeId] || '/images/room-placeholder.jpg'}
                      alt={roomType?.name || booking.roomTypeName || 'Hotel Room'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-6 md:col-span-9">
                    <div className="flex flex-col h-full">
                      <div className="flex flex-wrap justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {roomType?.name || booking.roomTypeName || 'Room'}
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
                          <span className="font-medium">{booking.guestCount || 2} Guests</span>
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
                          <Button 
                            variant="secondary"
                            className="bg-gray-900 text-white rounded-md font-medium text-sm px-5 py-2.5 flex items-center hover:bg-gray-800"
                          >
                            View Details
                          </Button>
                        </Link>
                        
                        {canCancelBooking(booking) && (
                          <Button 
                            variant="outline" 
                            className="border border-red-500 text-red-500 rounded-md font-medium text-sm px-5 py-2.5 flex items-center hover:bg-red-50"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingBookingId === booking.id}
                          >
                            {cancellingBookingId === booking.id ? (
                              <>
                                <svg className="animate-spin mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cancelling...
                              </>
                            ) : (
                              "Cancel Booking"
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
      </div>
    </div>
  );
} 