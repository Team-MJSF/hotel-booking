'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoomType } from '@/types';
import { roomService } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Calendar, User, CheckCircle, ArrowRight } from 'lucide-react';

// Dummy data for room types (would come from API in production)
const ROOM_IMAGES: Record<string, string> = {
  '1': '/images/standard-room.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/deluxe-suite.jpg',
  '5': '/images/premium-suite.jpg',
};

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Get query params
  const roomId = searchParams.get('roomId') || '';
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '1';
  
  // Room data state
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Booking form state
  const [checkInDate, setCheckInDate] = useState(checkInParam);
  const [checkOutDate, setCheckOutDate] = useState(checkOutParam);
  const [guests, setGuests] = useState(guestsParam);
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [step, setStep] = useState(isAuthenticated ? 2 : 1);
  
  // Validation state
  const [errors, setErrors] = useState({
    phone: '',
  });
  
  // Update form fields when user data changes
  useEffect(() => {
    // No need to set anything from user as those fields are displayed from context
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (step === 2 && !isAuthenticated) {
      router.push(`/login?redirect=/booking?roomId=${roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
    }
  }, [isAuthenticated, step, roomId, checkInDate, checkOutDate, guests, router]);
  
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
  }, [roomId]);
  
  // Calculate total price and nights
  const calculateBookingDetails = () => {
    if (!room || !checkInDate || !checkOutDate) {
      return { totalPrice: 0, nights: 0 };
    }
    
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalPrice: room.pricePerNight * (nights > 0 ? nights : 1),
      nights: nights > 0 ? nights : 1
    };
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {
      phone: ''
    };
    
    // Only validate phone number since other fields are from user account
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).filter(key => newErrors[key as keyof typeof newErrors]).length === 0;
  };
  
  // Handle form submission
  const handleContinue = () => {
    if (step === 1) {
      // Move to login/authentication if user is not logged in
      setStep(2);
    } else if (step === 2) {
      // Validate guest information
      if (validateForm()) {
        // Move to review and payment
        setStep(3);
      } else {
        // Scroll to first error
        const firstErrorField = Object.keys(errors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
    } else if (step === 3) {
      // Proceed to payment
      router.push(`/payment?roomId=${roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
    }
  };
  
  // Handle change in dates
  const handleDateChange = (type: 'checkIn' | 'checkOut', value: string) => {
    // Normalize and format the date consistently
    const selectedDate = new Date(value);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    if (type === 'checkIn') {
      setCheckInDate(formattedDate);
      
      // Ensure check-out is after check-in
      if (checkOutDate) {
        const checkOut = new Date(checkOutDate);
        if (selectedDate >= checkOut) {
          // Automatically set check-out to day after check-in
          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);
          setCheckOutDate(nextDay.toISOString().split('T')[0]);
        }
      }
    } else {
      setCheckOutDate(formattedDate);
    }
    
    // Recalculate booking details when dates change
    calculateBookingDetails();
  };
  
  if (loading) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading booking information...</p>
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
  
  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        <div className="text-center mb-8">
          <h1 className="hotel-heading mb-4">Complete Your Booking</h1>
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="hidden sm:inline">Booking Details</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="hidden sm:inline">Guest Information</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="hidden sm:inline">Review & Payment</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Booking Details */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">Booking Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="check-in-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Check In Date
                    </label>
                    <Input
                      id="check-in-date"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => handleDateChange('checkIn', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="check-out-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Check Out Date
                    </label>
                    <Input
                      id="check-out-date"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => handleDateChange('checkOut', e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="guests-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <select
                    id="guests-select"
                    className="hotel-input w-full"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </div>
            )}
            
            {/* Step 2: Guest Information */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">Guest Information</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">Account Information</p>
                      <p className="text-sm text-blue-700">
                        Your booking will be associated with your account information. 
                        Only special requests can be added below.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-5 mb-6">
                  <h3 className="text-md font-semibold mb-3 text-gray-700">Personal Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">First Name</p>
                      <p className="font-medium">{user?.firstName || 'Not available'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Last Name</p>
                      <p className="font-medium">{user?.lastName || 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="font-medium">{user?.email || 'Not available'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    placeholder="Enter phone number for booking communication"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    className="hotel-input w-full min-h-[100px]"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requests or preferences? (e.g. early check-in, room preferences, dietary requirements)"
                  />
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleContinue}
                >
                  Continue to Review
                </Button>
              </div>
            )}
            
            {/* Step 3: Review & Payment */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">Review Your Booking</h2>
                
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">Stay Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{checkInDate ? formatDate(new Date(checkInDate)) : "Not selected"}</p>
                      <p className="text-sm text-gray-600">After 3:00 PM</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{checkOutDate ? formatDate(new Date(checkOutDate)) : "Not selected"}</p>
                      <p className="text-sm text-gray-600">Before 12:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">Guest Information</h3>
                  <p><span className="text-gray-500">Guest Name:</span> {user?.firstName} {user?.lastName}</p>
                  <p><span className="text-gray-500">Email:</span> {user?.email}</p>
                  <p><span className="text-gray-500">Phone:</span> {phone}</p>
                  {specialRequests && (
                    <>
                      <p className="text-gray-500 mt-2">Special Requests:</p>
                      <p className="text-sm">{specialRequests}</p>
                    </>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Cancellation Policy</h3>
                  <p className="text-sm text-gray-600">Free cancellation up to 24 hours before check-in. Cancellations made less than 24 hours before check-in are subject to a one-night charge.</p>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    className="flex-1"
                    onClick={handleContinue}
                  >
                    Proceed to Payment
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => router.push('/rooms')}
                  >
                    Cancel Booking
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Booking Summary */}
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
                  <p className="text-sm text-gray-600">{room.maxGuests} Guests</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">{checkInDate ? formatDate(new Date(checkInDate)) : "Not selected"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm">Check-in</span>
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">{checkOutDate ? formatDate(new Date(checkOutDate)) : "Not selected"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm">Check-out</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">{guests} {parseInt(guests, 10) === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
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
                <p className="text-xs text-gray-500 mt-1">* All prices include taxes and fees</p>
              </div>
              
              <div className="text-sm text-gray-600 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Payment will be processed on the next page</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 