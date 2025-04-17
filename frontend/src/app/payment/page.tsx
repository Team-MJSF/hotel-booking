'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoomType } from '@/types';
import { roomService, bookingService, paymentService } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Check, CreditCard, Lock, AlertCircle } from 'lucide-react';

// Dummy data for room types (would come from API in production)
const ROOM_IMAGES: Record<string, string> = {
  '1': '/images/standard-room.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/deluxe-suite.jpg',
  '5': '/images/premium-suite.jpg',
};

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get query params
  const roomId = searchParams.get('roomId') || '';
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '1';
  const roomNumberParam = searchParams.get('roomNumber') || '';
  
  // Room and booking data
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [nights, setNights] = useState(1);
  const [selectedRoomNumber] = useState(roomNumberParam);
  
  // Validate required parameters with detailed checks
  const [paramErrors, setParamErrors] = useState<string[]>([]);
  const [hasValidParams, setHasValidParams] = useState(true);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL'>('CREDIT_CARD');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validate all parameters on component mount
  useEffect(() => {
    const errors: string[] = [];
    
    // Check for missing parameters
    if (!roomId) {
      errors.push('Room selection is missing');
    }
    
    if (!checkInParam) {
      errors.push('Check-in date is missing');
    }
    
    if (!checkOutParam) {
      errors.push('Check-out date is missing');
    }
    
    if (!guestsParam || parseInt(guestsParam, 10) < 1) {
      errors.push('Number of guests is invalid');
    }
    
    if (!roomNumberParam) {
      errors.push('Room number is missing');
    }
    
    // Validate date formats and logic if they exist
    if (checkInParam && checkOutParam) {
      const checkIn = new Date(checkInParam);
      const checkOut = new Date(checkOutParam);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(checkIn.getTime())) {
        errors.push('Invalid check-in date format');
      } else if (checkIn < today) {
        errors.push('Check-in date cannot be in the past');
      }
      
      if (isNaN(checkOut.getTime())) {
        errors.push('Invalid check-out date format');
      } else if (checkOut <= checkIn) {
        errors.push('Check-out date must be after check-in date');
      }
    }
    
    setParamErrors(errors);
    setHasValidParams(errors.length === 0);
    
    // If there are validation errors, set a timeout to redirect back to rooms page
    if (errors.length > 0) {
      setTimeout(() => {
        router.push('/rooms');
      }, 5000);
    }
  }, [roomId, checkInParam, checkOutParam, guestsParam, roomNumberParam, router]);
  
  // Calculate total price and nights
  useEffect(() => {
    if (checkInParam && checkOutParam) {
      const checkIn = new Date(checkInParam);
      const checkOut = new Date(checkOutParam);
      
      if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nightsCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setNights(nightsCount > 0 ? nightsCount : 1);
      } else {
        setNights(1); // Default to 1 night if dates are invalid
      }
    } else {
      setNights(1); // Default to 1 night if dates are missing
    }
  }, [checkInParam, checkOutParam]);
  
  // Load room details only if we have valid parameters
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!hasValidParams) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Call the API to get room details
        const response = await roomService.getRoomTypeById(roomId);
        const roomData = response.success && response.data ? response.data : null;
        
        if (roomData) {
          const roomInfo: RoomType = {
            id: roomData.id,
            name: roomData.name,
            code: roomData.code,
            description: roomData.description,
            pricePerNight: roomData.pricePerNight,
            maxGuests: roomData.maxGuests,
            imageUrl: roomData.imageUrl || '',
            amenities: typeof roomData.amenities === 'string'
              ? JSON.parse(roomData.amenities)
              : roomData.amenities || [],
            displayOrder: roomData.displayOrder
          };
          
          setRoom(roomInfo);
        } else {
          setError('Room not found');
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetails();
  }, [roomId, hasValidParams]);
  
  // Calculate total price based on nights and room price
  const totalPrice = room ? room.pricePerNight * nights : 0;
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };
  
  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };
  
  // Handle expiry date input
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setExpiryDate(formattedValue);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'Cardholder name is required';
    }
    
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      // Check if card is expired
      const parts = expiryDate.split('/');
      const expiryMonth = parseInt(parts[0], 10) - 1; // JS months are 0-11
      const expiryYear = parseInt(`20${parts[1]}`, 10);
      const expiryDateObj = new Date(expiryYear, expiryMonth, 1);
      const today = new Date();
      
      if (expiryDateObj < today) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    if (!cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Check if form is valid (for disabling button)
  const isFormValid = () => {
    return cardHolder.trim() !== '' && 
      cardNumber.replace(/\s/g, '').length >= 16 && 
      expiryDate.trim() !== '' && 
      /^\d{2}\/\d{2}$/.test(expiryDate) &&
      cvv.trim() !== '' && 
      /^\d{3,4}$/.test(cvv);
  };
  
  // Process payment
  const handlePayment = async () => {
    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    try {
      setProcessingPayment(true);
      
      if (!room || !roomId || !checkInParam || !checkOutParam || !selectedRoomNumber) {
        setError('Missing required booking information');
        setProcessingPayment(false);
        return;
      }
      
      // First create an actual booking in the system
      console.log('Creating booking with the following details:');
      console.log('- Room Type ID:', roomId);
      console.log('- Room Type Name:', room.name);
      console.log('- Room Number:', selectedRoomNumber);
      console.log('- Check-in Date:', checkInParam);
      console.log('- Check-out Date:', checkOutParam);
      console.log('- Number of Guests:', guestsParam);
      
      // Determine the actual database roomId based on the room type and room number
      let actualRoomId;
      
      // Fetch room mappings from the API or use fallback data
      const roomMappingsResponse = await roomService.getRoomMappings();
      
      if (roomMappingsResponse.success && roomMappingsResponse.data) {
        const roomMappings = roomMappingsResponse.data;
        
        if (roomMappings[selectedRoomNumber]) {
          // If there's a direct mapping for this room number, use it
          actualRoomId = roomMappings[selectedRoomNumber];
          console.log(`Using mapped ID ${actualRoomId} for room ${selectedRoomNumber}`);
        } else {
          // Otherwise, use a default mapping based on room type
          const defaultRoomByType: Record<string, number> = {
            '1': 1, // Standard Room (room IDs 1-5)
            '2': 6, // Executive Room (room IDs 6-10)
            '3': 11, // Family Suite (room IDs 11-15)
            '4': 19, // Deluxe Suite (room IDs 19-20)
            '5': 21, // Premium Suite (room IDs 21-25)
          };
          
          actualRoomId = defaultRoomByType[roomId] || Number(roomId);
          console.log(`Using default room ID ${actualRoomId} for room type ${roomId}`);
        }
      } else {
        // Fallback to simple mapping if the API fails
        console.error('Failed to get room mappings from API, using simple mapping');
        actualRoomId = Number(roomId);
      }
      
      console.log('- Mapped Room ID for database:', actualRoomId);
      
      // Create a booking using the booking service
      const bookingRequest = {
        roomId: actualRoomId, // Use the mapped room ID as a number
        checkInDate: checkInParam,
        checkOutDate: checkOutParam,
        guestCount: parseInt(guestsParam, 10),
        specialRequests: '', // Include any special requests
        // Don't send these to backend, but keep them for normalizing the response
        _roomNumber: selectedRoomNumber,
        _roomTypeId: roomId, // The actual room type ID from URL param
        _roomTypeName: room ? room.name : 'Standard Room',
        _totalPrice: totalPrice // Include the calculated price
      };
      
      console.log('Creating booking with data:', bookingRequest);
      const bookingResponse = await bookingService.createBooking(bookingRequest);
      
      if (!bookingResponse.success) {
        let errorMessage = 'Failed to create booking';
        
        // Extract detailed error information if available
        if (bookingResponse.error) {
          errorMessage = bookingResponse.error;
          console.error('Booking creation error:', bookingResponse.error);
        }
        
        // Check if the error is a validation error with messages
        if (bookingResponse.message && Array.isArray(bookingResponse.message)) {
          errorMessage = bookingResponse.message.join(', ');
          console.error('Booking validation errors:', bookingResponse.message);
        }
        
        setError(errorMessage);
        setProcessingPayment(false);
        return;
      }
      
      // Use the actual booking ID from the response
      if (!bookingResponse.data) {
        setError('No booking data returned from server');
        setProcessingPayment(false);
        return;
      }
      
      // Extract booking ID - handle API response format which may have bookingId property
      let bookingIdValue: string | number | null = null;
      
      // The API response might have different property names for the ID depending on format
      const responseBookingData = bookingResponse.data;
      
      if (responseBookingData) {
        // Try different possible ID property names
        if ('id' in responseBookingData) {
          bookingIdValue = responseBookingData.id;
        } else if ('bookingId' in responseBookingData) {
          bookingIdValue = (responseBookingData as { bookingId: string | number }).bookingId;
        } else if ('booking_id' in responseBookingData) {
          bookingIdValue = (responseBookingData as { booking_id: string | number }).booking_id;
        }
      }
      
      if (bookingIdValue === null) {
        setError('No booking ID returned from server');
        setProcessingPayment(false);
        return;
      }
      
      const bookingIdString = String(bookingIdValue);
      setBookingId(bookingIdString);
      
      // Generate a unique transaction ID for the mock payment
      const mockTransactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Process mock payment
      const paymentRequest = {
        bookingId: bookingIdString,
        amount: totalPrice,
        currency: 'USD',
        paymentMethod,
        transactionId: mockTransactionId,
        cardDetails: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardholderName: cardHolder,
          expiryDate,
          cvv,
        }
      };
      
      console.log('Processing payment with data:', {
        ...paymentRequest,
        cardDetails: {
          ...paymentRequest.cardDetails,
          cardNumber: '************' + paymentRequest.cardDetails.cardNumber.slice(-4),
          cvv: '***'
        }
      });
      
      const response = await paymentService.processPayment(paymentRequest);
      
      if (response.success) {
        console.log('Payment successful with response:', response.data);
        
        // Payment already updates the booking status in the new implementation,
        // but we can still try to update if needed as a double-check
        try {
          console.log('Confirming booking status is set to CONFIRMED');
          await bookingService.updateBookingStatus(bookingIdString, 'CONFIRMED');
        } catch (statusUpdateError) {
          // Don't fail if this doesn't work - the payment process already updated the status
          console.log('Additional status update not needed or failed:', statusUpdateError);
        }
        
        // Show payment success state and redirect to confirmation
        setPaymentSuccess(true);
        
        // Auto-redirect to confirmation after 3 seconds
        setTimeout(() => {
          router.push(`/bookings?success=true&bookingId=${bookingIdString}`);
        }, 3000);
      } else {
        // Handle payment failure with more detailed error
        console.error('Payment processing failed:', response.error);
        setError(response.error || 'Payment processing failed. Please try again.');
        setProcessingPayment(false);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      
      // Handle different error types
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        try {
          errorMessage = JSON.stringify(err);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_unused) {
          // If JSON stringify fails, use default message
        }
      }
      
      setError(errorMessage);
      setProcessingPayment(false);
    }
  };
  
  // Error display component
  const ErrorDisplay = ({ errorMessage }: { errorMessage: string | Record<string, unknown> | Error | unknown }) => {
    // Handle different error formats
    let displayMessage = '';
    
    if (typeof errorMessage === 'string') {
      displayMessage = errorMessage;
    } else if (errorMessage && typeof errorMessage === 'object') {
      // Handle object errors
      if ('message' in errorMessage && errorMessage.message) {
        if (Array.isArray(errorMessage.message)) {
          displayMessage = errorMessage.message.join(', ');
        } else {
          displayMessage = String(errorMessage.message);
        }
      } else if ('error' in errorMessage && errorMessage.error) {
        displayMessage = String(errorMessage.error);
      } else {
        // Convert the whole object to a string representation
        try {
          displayMessage = JSON.stringify(errorMessage);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_unused) {
          displayMessage = 'Unknown error occurred';
        }
      }
    } else {
      displayMessage = 'An error occurred';
    }
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
            <p className="text-sm text-red-700 mt-1">{displayMessage}</p>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }
  
  // Show error if required parameters are missing or invalid
  if (!hasValidParams) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Booking Information</h2>
          
          {paramErrors.length > 0 && (
            <ul className="list-disc list-inside text-left mb-4 text-red-700">
              {paramErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
          
          <p className="mb-4">Please select a room, valid dates, and number of guests before proceeding to payment.</p>
          <p className="text-sm text-gray-600 mb-6">You will be redirected to the rooms page in a few seconds.</p>
          
          <div className="flex justify-center mb-4">
            <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-red-600">Redirecting...</span>
          </div>
          
          <Button onClick={() => router.push('/rooms')} className="w-full">
            Browse Available Rooms Now
          </Button>
        </div>
      </div>
    );
  }
  
  if (error || !room) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-6">{error || 'Room not found'}</p>
          <Link href="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Payment success view
  if (paymentSuccess) {
    return (
      <div className="hotel-container py-12 min-h-screen">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Your booking has been confirmed. Thank you for choosing our hotel!
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-medium">Booking Reference: {bookingId}</p>
            <p>We&apos;ve sent a confirmation email with all the details.</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">You will be redirected to your bookings page shortly...</p>
          <Link href="/bookings">
            <Button className="w-full">View My Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        <div className="text-center mb-8">
          <h1 className="hotel-heading mb-4">Payment Details</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please enter your payment information below to complete your booking.
            All transactions are secure and encrypted.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Payment Method</h2>
                <div className="flex items-center text-sm text-gray-600">
                  <Lock className="h-4 w-4 mr-1" />
                  <span>Secure Payment</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                  >
                    <div className="w-10 h-10 flex items-center justify-center mb-2">
                      <CreditCard className={`h-6 w-6 ${paymentMethod === 'CREDIT_CARD' ? 'text-primary' : 'text-gray-500'}`} />
                    </div>
                    <span className={`text-sm font-medium ${paymentMethod === 'CREDIT_CARD' ? 'text-primary' : 'text-gray-700'}`}>Credit Card</span>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${paymentMethod === 'DEBIT_CARD' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('DEBIT_CARD')}
                  >
                    <div className="w-10 h-10 flex items-center justify-center mb-2">
                      <CreditCard className={`h-6 w-6 ${paymentMethod === 'DEBIT_CARD' ? 'text-primary' : 'text-gray-500'}`} />
                    </div>
                    <span className={`text-sm font-medium ${paymentMethod === 'DEBIT_CARD' ? 'text-primary' : 'text-gray-700'}`}>Debit Card</span>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${paymentMethod === 'PAYPAL' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('PAYPAL')}
                  >
                    <div className="w-10 h-10 flex items-center justify-center mb-2">
                      <svg viewBox="0 0 24 24" className={`h-6 w-6 ${paymentMethod === 'PAYPAL' ? 'text-primary' : 'text-gray-500'}`} fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.473 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.291-.077.448-.983 5.384-4.45 7.346-8.92 7.346h-2.255a.955.955 0 0 0-.944.802l-.633 4.143-.044.285c-.009.083-.032.17-.032.243 0 .376.262.618.618.618h3.3c.295 0 .554-.132.665-.368.031-.077.077-.19.099-.31l.654-4.324.12-.02c.02-.01.038-.01.06-.01h.59c4.423 0 7.89-1.911 8.895-7.451.366-2.048.195-3.76-.783-5.018v.002c-1.21-1.545-3.394-2.117-6.096-2.117l.01-.002H9.78c-.379 0-.707.26-.779.628L6.79 16.51l-.011.087c-.008.07-.025.134-.025.193a.645.645 0 0 0 .644.645h3.104a.641.641 0 0 0 .633-.74l.165-1.048.322-2.03-.001-.015z"/>
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${paymentMethod === 'PAYPAL' ? 'text-primary' : 'text-gray-700'}`}>PayPal</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Cardholder Name */}
                <div>
                  <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name*
                  </label>
                  <Input
                    id="cardHolder"
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Name on card"
                    aria-invalid={errors.cardHolder ? "true" : "false"}
                  />
                  {errors.cardHolder && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>
                  )}
                </div>
                
                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number*
                  </label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      aria-invalid={errors.cardNumber ? "true" : "false"}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="5" width="20" height="14" rx="2" fill="#FFB74D"/>
                      </svg>
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#EF5350" fillOpacity="0.8"/>
                        <circle cx="8" cy="12" r="4" fill="#FF8A80"/>
                      </svg>
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date*
                    </label>
                    <Input
                      id="expiryDate"
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      aria-invalid={errors.expiryDate ? "true" : "false"}
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                    )}
                  </div>
                  
                  {/* CVV */}
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV*
                    </label>
                    <Input
                      id="cvv"
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      aria-invalid={errors.cvv ? "true" : "false"}
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Test Payment System</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is a mock payment system for educational purposes. No real payments will be processed.
                    You can enter any valid-format card details to test the system.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handlePayment} 
              disabled={processingPayment || !isFormValid()}
              className="w-full h-12 text-base"
              type="button"
            >
              {processingPayment ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Pay Now ${formatPrice(totalPrice)}`
              )}
            </Button>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
              
              <div className="flex items-start mb-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden mr-4 flex-shrink-0">
                  <Image
                    src={room?.imageUrl || ROOM_IMAGES[roomId] || '/images/room-placeholder.jpg'}
                    alt={room?.name || 'Hotel Room'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">{room?.name}</h3>
                  {selectedRoomNumber && (
                    <p className="text-sm text-gray-600">Room {selectedRoomNumber}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {checkInParam ? formatDate(new Date(checkInParam)) : "Not selected"} - 
                    {checkOutParam ? formatDate(new Date(checkOutParam)) : "Not selected"}
                  </p>
                  <p className="text-sm text-gray-600">{nights} {nights === 1 ? 'night' : 'nights'}, {guestsParam} {parseInt(guestsParam, 10) === 1 ? 'guest' : 'guests'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Room Rate</span>
                  <span>{formatPrice(room.pricePerNight)} / night</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Duration</span>
                  <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span>Included</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                <p className="mb-2">By completing this booking, you agree to the Hotel Booking Terms and Conditions, Privacy Policy, and Booking Terms.</p>
                <p>Cancellation Policy: Free cancellation up to 24 hours before check-in. Cancellations made less than 24 hours before check-in are subject to a one-night charge.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Show error if there is one */}
      {error && <ErrorDisplay errorMessage={error} />}
    </div>
  );
} 