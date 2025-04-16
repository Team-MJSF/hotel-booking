'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types';
import { bookingService, roomService } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Calendar, Clock, CreditCard, MapPin, Printer, Users, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

// Sample room images (in a real app, these would come from API)
const ROOM_IMAGES: Record<string, string> = {
  '1': '/images/standard-room.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/deluxe-suite.jpg',
  '5': '/images/premium-suite.jpg',
};

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [roomMappings, setRoomMappings] = useState<Record<string, number>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!isAuthenticated) {
        router.push('/login?redirect=/bookings');
        return;
      }

      if (!id || id === 'undefined') {
        setError('Invalid booking ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch room mappings for proper room number display
        try {
          const roomMappingsResponse = await roomService.getRoomMappings();
          if (roomMappingsResponse.success && roomMappingsResponse.data) {
            setRoomMappings(roomMappingsResponse.data);
          }
        } catch (mappingError) {
          console.error('Failed to load room mappings:', mappingError);
        }
        
        // Fetch booking details from API
        const response = await bookingService.getBookingById(id as string);
        
        if (response.success && response.data) {
          setBooking(response.data);
        } else {
          setError(response.error || 'Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [id, isAuthenticated, router]);

  // Function to handle initiating booking cancellation
  const initiateCancel = () => {
    if (!booking) {
      console.error('Cannot initiate cancellation: No booking data');
      setError('Cannot cancel booking: Invalid booking information');
      return;
    }
    
    // Identify the correct ID field to use (id or bookingId)
    const bookingId = booking.id || (booking as any).bookingId;
    
    if (!bookingId) {
      console.error('Cannot initiate cancellation: Missing ID', booking);
      setError('Cannot cancel booking: Invalid booking information');
      return;
    }
    
    console.log('Initiating cancellation for booking:', bookingId, 'Room:', booking.roomNumber);
    setShowCancelModal(true);
    setCancelReason(''); // Reset reason when opening modal
  };
  
  // Function to handle confirming booking cancellation
  const confirmCancelBooking = async () => {
    if (!booking) {
      console.error('Cannot cancel booking: No booking selected');
      setError('An error occurred: No booking data');
      return;
    }
    
    // Get the booking ID (either id or bookingId)
    const bookingId = booking.id || (booking as any).bookingId;
    
    if (!bookingId) {
      console.error('Cannot cancel booking: Invalid booking ID', booking);
      setError('An error occurred: Invalid booking ID');
      return;
    }
    
    if (cancellingBooking) return;
    
    console.log('Cancelling booking with ID:', bookingId, 'Room:', booking.roomNumber);
    
    try {
      setCancellingBooking(true);
      
      // Use the API to cancel the booking and include the reason
      const response = await bookingService.cancelBooking(bookingId, cancelReason);
      
      if (response.success && response.data) {
        console.log('Booking cancellation successful for ID:', bookingId);
        
        // Update the booking status
        const updatedBooking = { 
          ...booking, 
          status: 'CANCELLED' as const,
          id: bookingId  // Ensure id is properly set
        };
        setBooking(updatedBooking);
        setSuccessMessage('Booking cancelled successfully. A refund will be processed according to our cancellation policy.');
        setShowCancelModal(false);
        
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
      setCancellingBooking(false);
    }
  };

  // Function to handle printing booking details
  const handlePrintBooking = () => {
    window.print();
  };

  // Check if a booking can be cancelled
  const canCancelBooking = (booking: Booking) => {
    // Can cancel bookings that aren't already cancelled or completed
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') return false;
    
    // Always allow cancellation for any other status
    return true;
  };

  // Get booking status label and color
  const getStatusDetails = (status: string) => {
    const statusMap: Record<string, { label: string, color: string, bgColor: string }> = {
      PENDING: { 
        label: 'Pending', 
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100' 
      },
      CONFIRMED: { 
        label: 'Confirmed', 
        color: 'text-green-800',
        bgColor: 'bg-green-100' 
      },
      CANCELLED: { 
        label: 'Cancelled', 
        color: 'text-red-800',
        bgColor: 'bg-red-100' 
      },
      COMPLETED: { 
        label: 'Completed', 
        color: 'text-blue-800',
        bgColor: 'bg-blue-100' 
      },
    };
    
    return statusMap[status] || { 
      label: status, 
      color: 'text-gray-800',
      bgColor: 'bg-gray-100' 
    };
  };

  if (loading) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="hotel-container py-12 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="mb-6">{error}</p>
            <Link href="/bookings">
              <Button className="bg-primary hover:bg-primary-dark">
                Back to My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="hotel-container py-12 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">The booking you&apos;re looking for could not be found or has been removed.</p>
            <Link href="/bookings">
              <Button>Back to Bookings</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate duration in nights
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get status details
  const { label: statusLabel, color: statusColor, bgColor: statusBgColor } = getStatusDetails(booking.status);
  
  return (
    <div className="py-8 md:py-12 print:py-0">
      <div className="hotel-container print:px-0">
        <div className="mb-8 print:hidden">
          <Link href="/bookings">
            <Button 
              variant="outline" 
              className="font-medium text-sm px-4 py-2 flex items-center justify-center"
            >
              <div className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to My Bookings</span>
              </div>
            </Button>
          </Link>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-start print:hidden">
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden print:shadow-none">
          {/* Booking header with status and booking ID */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h1>
                <p className="text-gray-600">
                  Booking ID: <span className="font-medium">{booking.id}</span>
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusBgColor} ${statusColor}`}>
                  {statusLabel}
                </span>
                
                <div className="print:hidden">
                  <Button 
                    variant="outline" 
                    className="font-medium text-sm flex items-center justify-center"
                    onClick={handlePrintBooking}
                  >
                    <div className="flex items-center">
                      <Printer className="h-4 w-4 mr-2" />
                      <span>Print</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Room details section */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-gray-200">
            <div className="md:col-span-4 relative h-64 md:h-auto">
              <Image
                src={ROOM_IMAGES[(booking?.roomTypeId || '1')] || '/images/room-placeholder.jpg'}
                alt={booking?.roomTypeName || 'Hotel Room'}
                fill
                className="object-cover"
              />
              {booking.status === 'CANCELLED' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full transform -rotate-12 text-lg font-bold">
                    Cancelled
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 md:col-span-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {booking?.roomTypeName || 'Room'}
              </h2>
              <p className="text-gray-600 mb-4">
                {booking.roomNumber 
                 ? `Room ${booking.roomNumber}`
                 : booking.room?.roomNumber 
                   ? `Room ${booking.room.roomNumber}` 
                   : roomMappings[booking.roomId]
                     ? `Room ${Object.keys(roomMappings).find(key => roomMappings[key] === Number(booking.roomId)) || booking.roomId}`
                     : 'Room number not available'}
              </p>
              
              <p className="text-gray-700 mb-6">Comfortable room with modern amenities for a pleasant stay.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span>
                    <strong>{booking.guestCount || (booking as any).numberOfGuests || 1}</strong> Guests
                  </span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span>City View</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-bold text-primary text-lg">
                    {formatPrice(booking.roomTypeId === '4' && booking.roomTypeName === 'Deluxe Suite' ? 30000 : booking.totalPrice / (nights || 1))}
                  </span>
                  <span className="text-gray-500 ml-1">/ night</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stay details section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 border-b border-gray-200">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Stay Information</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Check-in Date</span>
                  </div>
                  <p className="font-medium pl-7">
                    {formatDate(checkInDate)}
                    <span className="block text-sm text-gray-500">After 3:00 PM</span>
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Check-out Date</span>
                  </div>
                  <p className="font-medium pl-7">
                    {formatDate(checkOutDate)}
                    <span className="block text-sm text-gray-500">Before 12:00 PM</span>
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Duration</span>
                  </div>
                  <p className="font-medium pl-7">
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Guest Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Guest Name</p>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Number of Guests</p>
                  <p className="font-medium">{booking.guestCount || (booking as any).numberOfGuests || 1} {(booking.guestCount || (booking as any).numberOfGuests || 1) === 1 ? 'Guest' : 'Guests'}</p>
                </div>
                
                {booking.specialRequests && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                    <p className="font-medium">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Payment Information</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-1">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Payment Method</span>
                  </div>
                  <p className="font-medium">Credit Card</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  <p className="font-medium">
                    {booking.paymentStatus === 'PAID' ? (
                      <span className="text-green-600">Paid</span>
                    ) : booking.paymentStatus === 'REFUNDED' ? (
                      <span className="text-blue-600">Refunded</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="font-bold text-lg text-primary">
                    {formatPrice(booking.roomTypeId === '4' && booking.roomTypeName === 'Deluxe Suite' ? 30000 * nights : booking.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking policies */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Booking Policies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Cancellation Policy</p>
                <p className="text-gray-600">Free cancellation up to 24 hours before check-in. Cancellations made less than 24 hours before check-in are subject to a one-night charge.</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Check-in/Check-out</p>
                <p className="text-gray-600">Check-in time starts at 3:00 PM. Check-out time is 12:00 PM. Early check-in or late check-out may be available for an additional fee.</p>
              </div>
            </div>
          </div>
          
          {/* Actions section */}
          <div className="p-6 flex flex-wrap justify-end gap-4 print:hidden">
            <Link href="/bookings">
              <Button 
                variant="outline" 
                className="font-medium text-sm px-5 py-2.5 flex items-center justify-center"
              >
                <div className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span>Back to Bookings</span>
                </div>
              </Button>
            </Link>
            
            {canCancelBooking(booking) && (
              <Button 
                variant="outline" 
                className="border border-red-500 text-red-500 rounded-md font-medium text-sm px-5 py-2.5 flex items-center hover:bg-red-50"
                onClick={initiateCancel}
                disabled={cancellingBooking}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancellation Modal */}
      {showCancelModal && booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
              <p className="mb-4">Are you sure you want to cancel your booking for:</p>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="font-medium">{booking.roomTypeName}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                </p>
                <p className="text-sm text-gray-600">
                  Room {booking.roomNumber}
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
                  disabled={cancellingBooking}
                >
                  Keep Booking
                </Button>
                <Button 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmCancelBooking}
                  disabled={cancellingBooking}
                >
                  {cancellingBooking ? (
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
    </div>
  );
} 