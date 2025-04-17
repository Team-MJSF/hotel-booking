'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RoomType } from '@/types';
import { roomService, authService } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { CheckCircle, Calendar, Users } from 'lucide-react';

// Image mapping by room type ID
const ROOM_IMAGES: Record<string, string> = {
  '1': '/images/standard-room.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/deluxe-suite.jpg',
  '5': '/images/premium-suite.jpg',
};

// Image mapping by room type name for more reliable matching
const ROOM_TYPE_NAME_IMAGES: Record<string, string> = {
  'Deluxe Suite': '/images/deluxe-suite.jpg',
  'Executive Room': '/images/executive-room.jpg',
  'Family Suite': '/images/family-suite.jpg',
  'Standard Room': '/images/standard-room.jpg',
  'Premium Suite': '/images/premium-suite.jpg',
};

// Amenities offered by different room types
const ROOM_AMENITIES = {
  'Deluxe Suite': ['Free WiFi', 'King-Size Bed', 'Smart TV', 'Mini Bar', 'Luxury Bathroom', 'Air Conditioning', 'Room Service', 'City View'],
  'Executive Room': ['Free WiFi', 'Queen-Size Bed', 'Smart TV', 'Work Desk', 'Coffee Maker', 'Air Conditioning', 'Private Bathroom'],
  'Family Suite': ['Free WiFi', 'Multiple Beds', 'Smart TV', 'Kitchenette', 'Balcony', 'Air Conditioning', 'Two Bathrooms', 'Living Room'],
  'Standard Room': ['Free WiFi', 'Queen-Size Bed', 'TV', 'Private Bathroom', 'Air Conditioning'],
  'Premium Suite': ['Free WiFi', 'King-Size Bed', 'Smart TV', 'Jacuzzi', 'Butler Service', 'Ocean View', 'Living Room', 'Mini Bar'],
  'default': ['Free WiFi', 'Comfortable Bed', 'TV', 'Private Bathroom', 'Air Conditioning'],
};

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const id = params.id as string;
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '1';
  
  // Add state for current user authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userResponse = await authService.getCurrentUser();
        setIsAuthenticated(userResponse.success && !!userResponse.data);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);
  
  // Check for missing or invalid parameters
  const [missingParams, setMissingParams] = useState(false);
  const [paramErrors, setParamErrors] = useState<string[]>([]);

  // Validate the URL parameters
  useEffect(() => {
    const errors: string[] = [];
    let hasErrors = false;

    // Check for missing parameters
    if (!checkInParam) {
      errors.push("Check-in date is required");
      hasErrors = true;
    }
    
    if (!checkOutParam) {
      errors.push("Check-out date is required");
      hasErrors = true;
    }
    
    if (!guestsParam || parseInt(guestsParam, 10) < 1) {
      errors.push("Number of guests is required");
      hasErrors = true;
    }

    // Validate date formats and logic if they exist
    if (checkInParam && checkOutParam) {
      const checkIn = new Date(checkInParam);
      const checkOut = new Date(checkOutParam);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(checkIn.getTime())) {
        errors.push("Invalid check-in date format");
        hasErrors = true;
      } else if (checkIn < today) {
        errors.push("Check-in date cannot be in the past");
        hasErrors = true;
      }
      
      if (isNaN(checkOut.getTime())) {
        errors.push("Invalid check-out date format");
        hasErrors = true;
      } else if (checkOut <= checkIn) {
        errors.push("Check-out date must be after check-in date");
        hasErrors = true;
      }
    }

    setParamErrors(errors);
    setMissingParams(hasErrors);
    
    // Redirect after a short delay if parameters are missing or invalid
    if (hasErrors) {
      setTimeout(() => {
        router.push('/rooms');
      }, 3000);
    }
  }, [checkInParam, checkOutParam, guestsParam, router]);
  
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Date picker state
  const [checkInDate, setCheckInDate] = useState(checkInParam);
  const [checkOutDate, setCheckOutDate] = useState(checkOutParam);
  const [dateError, setDateError] = useState<string | null>(null);
  
  // Guest selection state
  const [guestCount, setGuestCount] = useState(parseInt(guestsParam, 10) || 1);
  
  // New state for available room numbers
  const [availableRooms, setAvailableRooms] = useState<{
    number: string;
    id: string;
    available: boolean;
  }[]>([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('');
  const [roomAvailabilityStatus, setRoomAvailabilityStatus] = useState<{
    total: number;
    available: number;
    soldOut: boolean;
  }>({ total: 0, available: 0, soldOut: false });
  
  // Add loading state for availability check
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Define amenities based on room type
  const amenities = useMemo(() => {
    if (!roomType) return ROOM_AMENITIES.default;
    return ROOM_AMENITIES[roomType.name as keyof typeof ROOM_AMENITIES] || ROOM_AMENITIES.default;
  }, [roomType]);
  
  // Calculate total price based on nights and room price
  const totalPrice = useMemo(() => {
    if (!roomType) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return roomType.pricePerNight;
    
    const nightsCount = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return roomType.pricePerNight * (nightsCount > 0 ? nightsCount : 1);
  }, [roomType, checkInDate, checkOutDate]);
  
  // Fetch room type details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch room type data from API
        const response = await roomService.getRoomTypeById(id);
        
        if (response.success && response.data) {
          const roomData = response.data;
          const room: RoomType = {
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
          
          setRoomType(room);
        } else {
          console.error('Room not found');
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetails();
  }, [id]);
  
  // Check availability based on selected dates
  useEffect(() => {
    if (!id || !roomType) return;
    
    const checkAvailability = async () => {
      if (!checkInDate || !checkOutDate) return;

      // Show loading state while checking availability
      setCheckingAvailability(true);

      try {
        console.log(`Checking availability for room type ${id} from ${checkInDate} to ${checkOutDate}`);
        
        // Normalize dates for consistency
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        
        // Format dates as ISO strings (YYYY-MM-DD)
        const formattedCheckIn = checkIn.toISOString().split('T')[0];
        const formattedCheckOut = checkOut.toISOString().split('T')[0];
        
        // Call the API to check actual room availability with normalized dates
        const response = await roomService.checkRoomAvailability(
          id,
          formattedCheckIn,
          formattedCheckOut
        );

        if (response.success && response.data) {
          // Get the available rooms from the API response
          const { availableRooms, totalRooms } = response.data;
          
          console.log(`Received ${availableRooms.length} available rooms out of ${totalRooms} total`);
          
          // For rooms that aren't available, we need to create a full list of all possible rooms
          const floorNumber = parseInt(id, 10);
          const allRoomsList: { number: string; id: string; available: boolean }[] = [];
          
          // Generate all possible room numbers for this floor
          for (let i = 1; i <= totalRooms; i++) {
            const roomNumber = `${floorNumber}${i.toString().padStart(2, '0')}`;
            const roomId = `room-${roomNumber}`;
            
            // Check if this room is in our available rooms list
            const isAvailable = availableRooms.some(room => room.roomNumber === roomNumber);
            
            allRoomsList.push({
              number: roomNumber,
              id: roomId,
              available: isAvailable
            });
          }
          
          setAvailableRooms(allRoomsList);
          setRoomAvailabilityStatus({
            total: totalRooms,
            available: availableRooms.length,
            soldOut: availableRooms.length === 0
          });
          
          // Auto-select the first available room if any
          if (availableRooms.length > 0) {
            setSelectedRoomNumber(availableRooms[0].roomNumber);
          } else {
            setSelectedRoomNumber('');
          }
        } else {
          // If API call fails, show error but don't block the UI
          console.error('Failed to check room availability:', response.error);
          
          // Set empty availability data
          setAvailableRooms([]);
          setRoomAvailabilityStatus({
            total: 10,
            available: 0,
            soldOut: true
          });
        }
      } catch (err) {
        console.error('Error checking room availability:', err);
      } finally {
        // Set loading state to false
        setCheckingAvailability(false);
      }
    };
    
    checkAvailability();
  }, [id, roomType, checkInDate, checkOutDate]);
  
  // Handle date change
  const handleDateChange = (type: 'checkIn' | 'checkOut', value: string) => {
    setDateError(null);
    
    if (type === 'checkIn') {
      // Format date consistently
      const checkIn = new Date(value);
      const formattedCheckIn = checkIn.toISOString().split('T')[0];
      setCheckInDate(formattedCheckIn);
      
      // Ensure check-out is after check-in
      const checkOut = checkOutDate ? new Date(checkOutDate) : null;
      
      if (checkOut && checkIn >= checkOut) {
        // Set check-out to day after check-in
        const nextDay = new Date(checkIn);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay.toISOString().split('T')[0]);
      }
    } else {
      // Format date consistently
      const checkOut = new Date(value);
      const formattedCheckOut = checkOut.toISOString().split('T')[0];
      setCheckOutDate(formattedCheckOut);
    }
    
    // Always trigger the loading state when either date changes
    setCheckingAvailability(true);
    
    // Reset availability status while checking
    setRoomAvailabilityStatus(prevStatus => ({
      ...prevStatus,
      available: 0,
      soldOut: false
    }));
    
    // Clear room selection when dates change
    setSelectedRoomNumber('');
  };
  
  // Handle guest count change
  const handleGuestCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGuestCount(parseInt(e.target.value, 10));
  };
  
  // Validate dates before booking
  const validateDates = (): boolean => {
    if (!checkInDate || !checkOutDate) {
      setDateError('Please select check-in and check-out dates');
      return false;
    }
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      setDateError('Invalid date format');
      return false;
    }
    
    if (checkIn < today) {
      setDateError('Check-in date cannot be in the past');
      return false;
    }
    
    if (checkOut <= checkIn) {
      setDateError('Check-out date must be after check-in date');
      return false;
    }
    
    return true;
  };
  
  // Handle room booking with validation
  const handleBookNow = () => {
    if (!roomType) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save booking info to URL for after login
      const returnUrl = `/rooms/${id}?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guestCount}`;
      
      // Redirect to login page with return URL
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }
    
    if (!validateDates()) {
      return;
    }
    
    // Check if room is available
    if (roomAvailabilityStatus.soldOut || !selectedRoomNumber) {
      setDateError('No rooms available for the selected dates');
      return;
    }
    
    // Include selected room number and validated dates in the booking process
    router.push(`/payment?roomId=${roomType.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guestCount}&roomNumber=${selectedRoomNumber}`);
  };
  
  if (loading) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading room details...</p>
        </div>
      </div>
    );
  }
  
  // Show redirect message if missing dates or guest count or other validation errors
  if (missingParams) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center bg-amber-50 p-8 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-amber-700 mb-4">Missing or Invalid Booking Information</h2>
          {paramErrors.length > 0 && (
            <ul className="list-disc list-inside text-left mb-4 text-amber-800">
              {paramErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
          <p className="mb-4">Please select valid check-in and check-out dates, and the number of guests before viewing room details.</p>
          <p className="text-sm text-gray-600 mb-6">You will be redirected to the rooms page to select your booking criteria.</p>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-amber-600">Redirecting...</span>
          </div>
          <Button onClick={() => router.push('/rooms')} className="w-full mt-4">
            Go to Rooms Page Now
          </Button>
        </div>
      </div>
    );
  }
  
  if (!roomType) {
    return (
      <div className="hotel-container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-6">Room not found</p>
          <Link href="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        <div className="mb-8">
          <Link href="/rooms" className="inline-flex items-center text-primary hover:underline mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m15 18 -6 -6 6 -6" />
            </svg>
            Back to Rooms
          </Link>
          <h1 className="hotel-heading mb-2">{roomType.name}</h1>
          <p className="text-gray-600">{roomType.maxGuests} Guests • Luxury Accommodations</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            {/* Room Gallery */}
            <div className="relative w-full h-96 rounded-xl overflow-hidden mb-6">
              <Image
                src={roomType?.name ? ROOM_TYPE_NAME_IMAGES[roomType.name] || ROOM_IMAGES[id as string] || '/images/room-placeholder.jpg' : '/images/room-placeholder.jpg'}
                alt={roomType?.name || 'Room'}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
            
            {/* Room Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Room Details</h2>
              <p className="mb-6 text-gray-700">{roomType.description}</p>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold mb-4">Room Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Room Policies */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Room Policies</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Check-in/Check-out</h3>
                  <p className="text-gray-700">Check-in: 3:00 PM - 11:00 PM</p>
                  <p className="text-gray-700">Check-out: Until 12:00 PM</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cancellation Policy</h3>
                  <p className="text-gray-700">Free cancellation up to 24 hours before check-in. Cancellations made less than 24 hours before check-in are subject to a one-night charge.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Room Type</h3>
                <p className="text-xl font-bold">{roomType.name}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Your Stay</h3>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm">
                      <span className="font-medium">Check-in:</span> {formatDate(new Date(checkInDate))}<br />
                      <span className="font-medium">Check-out:</span> {formatDate(new Date(checkOutDate))}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm"><span className="font-medium">Guests:</span> {guestCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Availability</h3>
                {checkingAvailability ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Checking availability...</p>
                  </div>
                ) : (
                  <p className={`text-lg font-semibold ${roomAvailabilityStatus.soldOut ? 'text-red-500' : 'text-green-600'}`}>
                    {roomAvailabilityStatus.soldOut 
                      ? 'Sold Out' 
                      : `${roomAvailabilityStatus.available} of ${roomAvailabilityStatus.total} rooms available`}
                  </p>
                )}
              </div>
              
                <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Select Room Number</h3>
                  <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedRoomNumber}
                    onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  disabled={roomAvailabilityStatus.soldOut || checkingAvailability}
                  >
                  {checkingAvailability ? (
                    <option>Loading rooms...</option>
                  ) : (
                    availableRooms
                      .filter(room => room.available)
                      .map(room => (
                        <option key={room.id} value={room.number}>
                          Room {room.number}
                        </option>
                      ))
                  )}
                  </select>
                <p className="text-xs text-gray-500 mt-1">Please select a room number to continue</p>
                </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Update Dates</h3>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="check-in-date" className="block text-xs text-gray-500 mb-1">
                      Check-in Date
                    </label>
                    <input
                      id="check-in-date"
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={checkInDate}
                      onChange={(e) => handleDateChange('checkIn', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label htmlFor="check-out-date" className="block text-xs text-gray-500 mb-1">
                      Check-out Date
                    </label>
                    <input
                      id="check-out-date"
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={checkOutDate}
                      onChange={(e) => handleDateChange('checkOut', e.target.value)}
                      min={checkInDate ? new Date(new Date(checkInDate).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {checkingAvailability && (
                    <div className="flex items-center justify-center text-xs text-amber-600 mt-1">
                      <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                      <span>Checking new availability...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Guests</h3>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={guestCount}
                  onChange={handleGuestCountChange}
                  disabled={roomAvailabilityStatus.soldOut}
                >
                  {[...Array(roomType?.maxGuests || 1)].map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1} {index === 0 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Price per night</span>
                  <span className="font-semibold">{formatPrice(roomType.pricePerNight)}</span>
                </div>
                    <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Number of nights</span>
                  <span className="font-semibold">{Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                    </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                      <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                    </div>
              </div>
              
              <Button 
                className="w-full py-3 text-lg"
                onClick={handleBookNow}
                disabled={roomAvailabilityStatus.soldOut || !selectedRoomNumber || checkingAvailability}
              >
                {roomAvailabilityStatus.soldOut 
                  ? 'Sold Out' 
                  : isAuthenticated 
                    ? 'Book Now' 
                    : 'Login to Book'}
              </Button>
              
              {dateError && (
                <p className="text-red-500 text-sm mt-2 text-center">{dateError}</p>
              )}
              
              {!selectedRoomNumber && !roomAvailabilityStatus.soldOut && !checkingAvailability && (
                <p className="text-amber-500 text-sm mt-2 text-center">Please select a room number</p>
              )}
              
              {!isAuthenticated && authChecked && (
                <p className="text-blue-500 text-sm mt-2 text-center">
                  You need to login or create an account to book a room
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 