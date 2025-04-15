'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoomType } from '@/types';
import { roomService, bookingService, paymentService } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Check, CreditCard, Lock, AlertCircle } from 'lucide-react';

// Dummy data for room types (would come from API in production)
const ROOM_IMAGES: Record<string, string> = {
  '1': '/images/deluxe-suite.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/standard-room.jpg',
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
  
  // Room and booking data
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL'>('CREDIT_CARD');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) {
        setError('Room ID is required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // In a real app, we would call the API
        // const response = await roomService.getRoomTypeById(roomId);
        
        // For now, use dummy data
        const dummyRoom: RoomType = {
          id: roomId,
          name: 'Deluxe Suite',
          description: 'Spacious suite with city views, king-size bed, and luxury amenities.',
          pricePerNight: 29900,
          capacity: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setRoom(dummyRoom);
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetails();
  }, [roomId]);
  
  // Calculate total price and nights
  const calculateBookingDetails = () => {
    if (!room || !checkInParam || !checkOutParam) {
      return { totalPrice: 0, nights: 0 };
    }
    
    const startDate = new Date(checkInParam);
    const endDate = new Date(checkOutParam);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalPrice: room.pricePerNight * (nights > 0 ? nights : 1),
      nights: nights > 0 ? nights : 1
    };
  };
  
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
      
      // This would create a real booking in production
      // First create the booking
      const mockBookingId = `booking-${Date.now()}`;
      setBookingId(mockBookingId);
      
      // Process mock payment
      const response = await paymentService.processPayment(mockBookingId, {
        paymentMethod,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder,
        expiryDate,
        cvv,
      });
      
      if (response.success && response.data?.success) {
        setPaymentSuccess(true);
        
        // Auto-redirect to confirmation after 3 seconds
        setTimeout(() => {
          router.push(`/bookings?success=true&bookingId=${mockBookingId}`);
        }, 3000);
      } else {
        setError('Payment processing failed. Please try again.');
        setProcessingPayment(false);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('An unexpected error occurred. Please try again later.');
      setProcessingPayment(false);
    }
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
  
  const { totalPrice, nights } = calculateBookingDetails();
  
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
            <p>We've sent a confirmation email with all the details.</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">You will be redirected to your bookings page shortly...</p>
          <Link href="/bookings">
            <Button fullWidth>View My Bookings</Button>
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
                    error={errors.cardHolder}
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
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      error={errors.cardNumber}
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
                      error={errors.expiryDate}
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
                      error={errors.cvv}
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
              fullWidth 
              onClick={handlePayment} 
              disabled={processingPayment}
              className="h-12 text-base"
            >
              {processingPayment ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </span>
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
                    src={ROOM_IMAGES[roomId] || '/images/room-placeholder.jpg'}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">{room.name}</h3>
                  <p className="text-sm text-gray-600">{formatDate(new Date(checkInParam))} - {formatDate(new Date(checkOutParam))}</p>
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
    </div>
  );
} 