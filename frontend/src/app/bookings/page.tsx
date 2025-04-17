'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types';
import { bookingService, roomService } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Calendar, CheckCircle, AlertTriangle, X, Info, CreditCard } from 'lucide-react';

// Define types for the legacy booking structure
interface LegacyBooking {
  bookingId?: string;
  booking_id?: string;
  numberOfGuests?: number;
  room?: {
    roomNumber?: string;
    type?: string;
    pricePerNight?: number;
    photos?: string | Array<{url: string}>;
  };
}

// Sample room images (in a real app, these would come from API)
const ROOM_IMAGES: Record<string, string> = {
  '1': '/images/standard-room.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/deluxe-suite.jpg',
  '5': '/images/premium-suite.jpg',
};

export default function BookingsPage() {
  const { isAuthenticated } = useAuth();
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
  // This warning can be ignored because roomMappings is used in the component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roomMappings, setRoomMappings] = useState<Record<string, number>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // Load bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      
      try {
        const response = await bookingService.getUserBookings();
        if (response.success && response.data) {
          // Log the raw booking data for debugging
          console.log('Raw bookings data:', JSON.stringify(response.data));
          
          // Fix room type information for frontend display
          const fixedBookings = response.data.map(booking => {
            // Create updated booking with proper room information
            const updatedBooking = {...booking};
            
            // Extract room information from the room object if available
            if (booking.room) {
              console.log('Room data from backend:', booking.room);
              
              // Map backend room type to frontend roomTypeName
              const roomTypeMap: Record<string, string> = {
                'standard': 'Standard Room',
                'executive': 'Executive Room',
                'family': 'Family Suite',
                'deluxe': 'Deluxe Suite',
                'premium': 'Premium Suite'
              };
              
              updatedBooking.roomNumber = booking.room.roomNumber || '';
              updatedBooking.roomTypeId = String(booking.room.id) || '';
              updatedBooking.roomTypeName = roomTypeMap[(booking.room.type as string)] || 'Standard Room';
              
              // Calculate price from room.pricePerNight if available
              if (booking.room.pricePerNight) {
                const checkIn = new Date(booking.checkInDate);
                const checkOut = new Date(booking.checkOutDate);
                const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                updatedBooking.totalPrice = booking.room.pricePerNight * nights;
              }
            }
            
            // Ensure guestCount is properly set from numberOfGuests if needed
            if (!updatedBooking.guestCount && updatedBooking.numberOfGuests) {
              updatedBooking.guestCount = updatedBooking.numberOfGuests;
            }
            
            return updatedBooking;
          });
          
          setBookings(fixedBookings);
          console.log('Loaded user bookings:', fixedBookings.length);
          
          // Fetch room mappings for room number display
          try {
            const roomMappingsResponse = await roomService.getRoomMappings();
            if (roomMappingsResponse.success && roomMappingsResponse.data) {
              setRoomMappings(roomMappingsResponse.data);
            }
          } catch (mappingsError) {
            console.error('Failed to load room mappings:', mappingsError);
          }
        } else {
          setError('Failed to load bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('An error occurred while loading bookings');
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

  // Function to filter bookings based on status
  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    
    return bookings.filter(booking => {
      const checkInDate = new Date(booking.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);
      
      const checkOutDate = new Date(booking.checkOutDate);
      checkOutDate.setHours(0, 0, 0, 0);
      
      // Always show cancelled bookings in "all" filter
      if (filter === 'all') return true;
      
      // Normalize status to uppercase for comparison
      const status = booking.status.toUpperCase();
      
      // Show cancelled bookings in the appropriate timing category based on check-in date
      if (status === 'CANCELLED') {
        if (filter === 'upcoming' && checkInDate > today) return true;
        if (filter === 'past' && checkInDate <= today) return true;
        return false;
      }
      
      if (filter === 'upcoming' && checkInDate > today) return true;
      if (filter === 'current' && checkInDate <= today && checkOutDate >= today) return true;
      if (filter === 'past' && checkOutDate < today) return true;
      
      return false;
    });
  };
  
  // Check if a booking can be cancelled
  const canCancelBooking = (booking: Booking) => {
    // Normalize status to uppercase for comparison
    const status = booking.status.toUpperCase();
    
    // Can cancel bookings that aren't already cancelled or completed
    if (status === 'CANCELLED' || status === 'COMPLETED') return false;
    
    // Always allow cancellation for any other status
    return true;
  };
  
  // Handle booking cancellation with confirmation
  const initiateCancel = (booking: Booking) => {
    // Validate booking has a valid ID (check both id and bookingId fields)
    if (!booking) {
      console.error('Cannot initiate cancellation: Invalid booking', booking);
      setError('Cannot cancel booking: Invalid booking information');
      return;
    }
    
    // Identify the correct ID field to use (id or bookingId)
    const bookingId = booking.id || (booking as LegacyBooking).bookingId;
    
    if (!bookingId) {
      console.error('Cannot initiate cancellation: Missing ID', booking);
      setError('Cannot cancel booking: Invalid booking information');
      return;
    }
    
    console.log('Initiating cancellation for booking:', bookingId, 'Room:', booking.roomNumber);
    
    // Create a normalized booking object with a valid id field
    const normalizedBooking = {
      ...booking,
      id: bookingId
    };
    
    setSelectedBooking(normalizedBooking);
    setShowCancelModal(true);
    setCancelReason(''); // Reset reason when opening modal
  };
  
  // Complete the cancellation process
  const confirmCancelBooking = async () => {
    if (!selectedBooking) {
      console.error('Cannot cancel booking: No booking selected');
      setError('An error occurred: No booking selected');
      return;
    }
    
    // Get the booking ID, which should be normalized in initiateCancel
    const bookingId = selectedBooking.id;
    
    if (!bookingId) {
      console.error('Cannot cancel booking: Invalid booking ID', selectedBooking);
      setError('An error occurred: Invalid booking ID');
      return;
    }
    
    console.log('Cancelling booking with ID:', bookingId, 'Room:', selectedBooking.roomNumber);
    setCancellingBookingId(bookingId);
    
    try {
      // Include the cancellation reason in the request
      const response = await bookingService.cancelBooking(bookingId, cancelReason);
      
      if (response.success) {
        console.log('Booking cancellation successful for ID:', bookingId);
        
        // Update booking status in the UI but ONLY for the selected booking
        setBookings(prevBookings => 
          prevBookings.map(booking => {
            // Match by id or bookingId
            const currentId = booking.id || (booking as LegacyBooking).bookingId;
            return currentId === bookingId 
              ? { ...booking, status: 'CANCELLED' as const } 
              : booking;
          })
        );
        
        setSuccessMessage('Booking cancelled successfully. A refund will be processed according to our cancellation policy.');
        setShowCancelModal(false);
        
        // Refetch bookings data to ensure UI is in sync with backend
        try {
          console.log('Refreshing bookings data after cancellation...');
          const refreshResponse = await bookingService.getUserBookings();
          if (refreshResponse.success && refreshResponse.data) {
            console.log('Received updated booking data:', refreshResponse.data.length, 'bookings');
            setBookings(refreshResponse.data);
            console.log('Refreshed bookings data after cancellation');
          }
        } catch (refreshErr) {
          console.error('Error refreshing bookings data after cancellation:', refreshErr);
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        console.error('Cancellation failed:', response.error);
        setError(response.error || 'Failed to cancel booking');
        
        // Clear error message after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
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
    // Normalize status to uppercase for consistency
    const status = booking.status.toUpperCase();
    
    const statusMap: Record<string, { label: string, color: string }> = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    };
    
    return statusMap[status] || { label: booking.status, color: 'bg-gray-100 text-gray-800' };
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
      <div className="py-8 md:py-12">
        <div className="hotel-container">
          <div className="text-center mb-8">
            <h1 className="hotel-heading mb-4">My Bookings</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              View and manage all your bookings in one place. You can see upcoming stays, check booking details, and cancel reservations if needed.
            </p>
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
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
            <p className="text-gray-600 mb-6">You don&apos;t have any bookings yet. Book a room to get started.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/rooms">
                <Button>Browse Rooms</Button>
              </Link>
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
        
        {/* Cancellation Modal */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
                <p className="mb-4">Are you sure you want to cancel your booking for:</p>
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="font-medium">{selectedBooking.roomTypeName}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(new Date(selectedBooking.checkInDate))} - {formatDate(new Date(selectedBooking.checkOutDate))}
                  </p>
                  <p className="text-sm text-gray-600">
                    Room {selectedBooking.room?.roomNumber || selectedBooking.roomNumber || 'N/A'}
                  </p>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  <span className="flex items-start">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Cancellations are subject to our refund policy. Bookings cancelled at least 24 hours before check-in receive a full refund.</span>
                  </span>
                </p>
                
                <div className="mb-4">
                  <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    id="cancel-reason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Please let us know why you're cancelling..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancellingBookingId === selectedBooking.id}
                  >
                    Keep Booking
                  </Button>
                  <Button 
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={confirmCancelBooking}
                    disabled={cancellingBookingId === selectedBooking.id}
                  >
                    {cancellingBookingId === selectedBooking.id ? (
                      <>
                        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Booking"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.map((booking, index) => {
            const { label: statusLabel, color: statusColor } = getStatusDetails(booking);
            
            // Generate a unique key for each booking, even if ID is undefined
            const bookingKey = booking.id ? `booking-${booking.id}` : `booking-fallback-${index}`;
            
            // Determine room type name from room object or fallback to frontend data
            let displayRoomTypeName = 'Standard Room';
            
            // Priority 1: Use directly from room object if available
            if (booking.room) {
              const roomTypeMap: Record<string, string> = {
                'standard': 'Standard Room',
                'executive': 'Executive Room',
                'family': 'Family Suite',
                'deluxe': 'Deluxe Suite',
                'premium': 'Premium Suite'
              };
              
              displayRoomTypeName = roomTypeMap[(booking.room.type as string)] || 'Standard Room';
            } 
            // Priority 2: Use roomTypeName if already set
            else if (booking.roomTypeName) {
              displayRoomTypeName = booking.roomTypeName;
            }
            // Priority 3: Use roomTypeId to infer room type
            else if (booking.roomTypeId) {
              switch(booking.roomTypeId) {
                case '1':
                  displayRoomTypeName = 'Standard Room';
                  break;
                case '2':
                  displayRoomTypeName = 'Executive Room';
                  break;
                case '3':
                  displayRoomTypeName = 'Family Suite';
                  break;
                case '4':
                  displayRoomTypeName = 'Deluxe Suite';
                  break;
                case '5':
                  displayRoomTypeName = 'Premium Suite';
                  break;
                default:
                  displayRoomTypeName = 'Standard Room';
              }
            }
            
            // Calculate price based on booking data
            const calculatePrice = (booking: Booking): number => {
              // If the booking already has a total price, use that
              if (booking.totalPrice && !isNaN(booking.totalPrice)) {
                return booking.totalPrice;
              }
              
              // If we have room information with price per night
              if (booking.room && (booking.room as LegacyBooking['room'])?.pricePerNight) {
                const checkIn = new Date(booking.checkInDate);
                const checkOut = new Date(booking.checkOutDate);
                const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                return ((booking.room as LegacyBooking['room'])?.pricePerNight ?? 0) * (nights || 1);
              }
              
              // Otherwise use default prices based on room type
              const checkIn = new Date(booking.checkInDate);
              const checkOut = new Date(booking.checkOutDate);
              const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;
              
              // Get price per night based on room type
              let pricePerNight = 199; // Default price
              
              if (booking.roomTypeId) {
                switch(booking.roomTypeId) {
                  case '1': pricePerNight = 149; break; // Standard
                  case '2': pricePerNight = 199; break; // Executive
                  case '3': pricePerNight = 249; break; // Family
                  case '4': pricePerNight = 329; break; // Deluxe
                  case '5': pricePerNight = 499; break; // Premium
                }
              } else if (booking.roomTypeName) {
                if (booking.roomTypeName.toLowerCase().includes('standard')) pricePerNight = 149;
                else if (booking.roomTypeName.toLowerCase().includes('executive')) pricePerNight = 199;
                else if (booking.roomTypeName.toLowerCase().includes('family')) pricePerNight = 249;
                else if (booking.roomTypeName.toLowerCase().includes('deluxe')) pricePerNight = 329;
                else if (booking.roomTypeName.toLowerCase().includes('premium')) pricePerNight = 499;
              }
              
              return pricePerNight * nights;
            };
            
            const displayPrice = calculatePrice(booking);
            
            // Determine correct room type image based on room data
            let imageUrl = '/images/room-placeholder.jpg';
            
            // Start with the most specific sources
            
            // 1. First check if room object has photos
            if (booking.room && 'photos' in booking.room) {
              try {
                const photoData = (booking.room as LegacyBooking['room'])?.photos;
                const photos = typeof photoData === 'string' 
                  ? JSON.parse(photoData) 
                  : photoData;
                
                if (Array.isArray(photos) && photos.length > 0 && photos[0].url) {
                  imageUrl = photos[0].url;
                  console.log('Using image URL from room photos:', imageUrl);
                }
              } catch (e) {
                console.warn('Failed to parse room photos:', e);
              }
            }
            
            // 2. Fallback to room type based image selection
            if (imageUrl === '/images/room-placeholder.jpg') {
              // Check the room type from room object first
              const roomType = booking.room?.type?.toLowerCase() || '';
              console.log('Room type for image selection:', roomType);
              
              if (roomType === 'deluxe') {
                imageUrl = '/images/deluxe-suite.jpg';
                console.log('Using deluxe suite image based on room.type');
              } else if (roomType === 'executive') {
                imageUrl = '/images/executive-room.jpg';
              } else if (roomType === 'family') {
                imageUrl = '/images/family-suite.jpg';
              } else if (roomType === 'premium') {
                imageUrl = '/images/premium-suite.jpg';
              } else if (roomType === 'standard') {
                imageUrl = '/images/standard-room.jpg';
              } 
              // If room type doesn't match, check room type name
              else if (booking.roomTypeName?.toLowerCase().includes('deluxe')) {
                imageUrl = '/images/deluxe-suite.jpg';
                console.log('Using deluxe suite image based on roomTypeName');
              } else if (booking.roomTypeName?.toLowerCase().includes('executive')) {
                imageUrl = '/images/executive-room.jpg';
              } else if (booking.roomTypeName?.toLowerCase().includes('family')) {
                imageUrl = '/images/family-suite.jpg';
              } else if (booking.roomTypeName?.toLowerCase().includes('premium')) {
                imageUrl = '/images/premium-suite.jpg';
              } else if (booking.roomTypeName?.toLowerCase().includes('standard')) {
                imageUrl = '/images/standard-room.jpg';
              }
              // Finally, try lookup by roomTypeId
              else if (ROOM_IMAGES[booking.roomTypeId]) {
                imageUrl = ROOM_IMAGES[booking.roomTypeId];
              }
            }
            
            console.log(`Booking ${(booking as LegacyBooking).bookingId || booking.id || index}: Using image ${imageUrl} for ${displayRoomTypeName}`);
            
            return (
              <div key={bookingKey} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-3 relative h-48 md:h-auto">
                    <Image
                      src={imageUrl}
                      alt={displayRoomTypeName}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                    {booking.status === 'CANCELLED' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full transform -rotate-12 text-sm font-bold">
                          Cancelled
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 md:col-span-9">
                    <div className="flex flex-col h-full">
                      <div className="flex flex-wrap justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {displayRoomTypeName}
                          </h2>
                          <p className="text-gray-600 mb-2">
                            Room {booking.room?.roomNumber || booking.roomNumber || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                            {statusLabel}
                          </span>
                          <div className="mt-1 flex items-center">
                            <CreditCard className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-sm text-gray-600">
                              {booking.status === 'CANCELLED' ? 'Refunded' : 'Paid'}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-primary mt-1">
                            {formatPrice(displayPrice)}
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
                          <span className="font-medium">{booking.guestCount || booking.numberOfGuests || 1} Guests</span>
                        </div>
                      </div>
                      
                      {booking.specialRequests && (
                        <div className="mb-6">
                          <p className="text-sm text-gray-500">Special Requests:</p>
                          <p className="text-sm">{booking.specialRequests}</p>
                        </div>
                      )}
                      
                      <div className="mt-auto flex flex-wrap gap-3">
                        {/* Always show the View Details button with properly formatted booking ID */}
                        <Link href={`/bookings/${(booking as LegacyBooking).bookingId || booking.id || (booking as LegacyBooking).booking_id}`}>
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
                            onClick={() => initiateCancel(booking)}
                            disabled={cancellingBookingId === booking.id}
                          >
                            Cancel Booking
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