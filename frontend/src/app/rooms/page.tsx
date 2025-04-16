'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RoomTypesGrid from '@/components/RoomTypesGrid';
import { Room, RoomType } from '@/types';
import { roomService } from '@/services/api';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function RoomsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get query parameters
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialGuests = searchParams.get('guests') || '';
  
  // State for form filters
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests || '1');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'capacity'>('price-asc');
  
  // State for room data
  const [roomAvailability, setRoomAvailability] = useState<Record<string, { 
    available: number, 
    total: number,
    soldOut: boolean
  }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for form validation
  const [formErrors, setFormErrors] = useState<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>({});
  
  // Helper variables
  const hasSelectedDates = checkInDate && checkOutDate;
  const hasSelectedGuests = guests && parseInt(guests, 10) > 0;
  const hasRequiredFields = hasSelectedDates && hasSelectedGuests;

  // Validate dates and guest count
  const validateBookingCriteria = () => {
    const errors: {
      checkIn?: string;
      checkOut?: string;
      guests?: string;
    } = {};
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!checkInDate) {
      errors.checkIn = 'Please select a check-in date';
    } else {
      const checkIn = new Date(checkInDate);
      if (isNaN(checkIn.getTime())) {
        errors.checkIn = 'Invalid date format';
      } else if (checkIn < today) {
        errors.checkIn = 'Check-in date cannot be in the past';
      }
    }
    
    if (!checkOutDate) {
      errors.checkOut = 'Please select a check-out date';
    } else if (checkInDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (isNaN(checkOut.getTime())) {
        errors.checkOut = 'Invalid date format';
      } else if (checkOut <= checkIn) {
        errors.checkOut = 'Check-out date must be after check-in date';
      }
    }
    
    if (!guests || parseInt(guests, 10) < 1) {
      errors.guests = 'Please select at least 1 guest';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to handle navigation to room details page
  const handleRoomNavigation = (roomId: string) => {
    // Validate that dates and guests are selected before allowing navigation
    if (!validateBookingCriteria()) {
      // Scroll to the top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Navigate to room details with date and guest parameters
    router.push(`/rooms/${roomId}?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
  };
  
  // Expose the navigation handler to be used by child components
  useEffect(() => {
    // Make the handler available to the RoomTypesGrid component
    // @ts-ignore - Adding a custom property to window for internal component communication
    window.handleRoomNavigation = handleRoomNavigation;
    
    return () => {
      // Clean up when component unmounts
      // @ts-ignore
      delete window.handleRoomNavigation;
    };
  }, [checkInDate, checkOutDate, guests]);

  // Fetch available rooms if dates are already provided
  useEffect(() => {
    if (initialCheckIn && initialCheckOut && initialGuests) {
      const params = {
        checkInDate: initialCheckIn,
        checkOutDate: initialCheckOut,
        maxGuests: parseInt(initialGuests, 10),
      };
      fetchAvailableRooms(params);
    }
  }, [initialCheckIn, initialCheckOut, initialGuests]);
  
  // New function to fetch available rooms from API
  const fetchAvailableRooms = async (params: {
    checkInDate: string;
    checkOutDate: string;
    maxGuests?: number;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    try {
      setLoading(true);
      
      console.log('Searching rooms with:', params);
      
      // Get all room types first to ensure we have complete data
      const roomTypesResponse = await roomService.getRoomTypes();
      
      if (!roomTypesResponse.success || !roomTypesResponse.data) {
        throw new Error(roomTypesResponse.error || 'Failed to fetch room types');
      }
      
      const allRoomTypes = roomTypesResponse.data;
      console.log('All room types:', allRoomTypes);
      
      // Initialize availability data for all room types
      const roomAvailabilityData: Record<string, { available: number; total: number; soldOut: boolean }> = {};
      
      // Check availability for each room type sequentially instead of using Promise.all
      // This helps avoid hitting rate limits (429 errors)
      for (const roomType of allRoomTypes) {
        const typeId = roomType.id.toString();
        try {
          // Add a small delay between requests to avoid rate limiting
          if (Object.keys(roomAvailabilityData).length > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          const availabilityResponse = await roomService.checkRoomAvailability(
            typeId,
            params.checkInDate,
            params.checkOutDate
          );
          
          if (availabilityResponse.success && availabilityResponse.data) {
            roomAvailabilityData[typeId] = {
              available: availabilityResponse.data.availableCount,
              total: availabilityResponse.data.totalRooms,
              soldOut: availabilityResponse.data.availableCount === 0
            };
          } else {
            // Use mock data as fallback if API call fails
            roomAvailabilityData[typeId] = {
              // For demo/school project, we'll use some default values
              available: Math.floor(Math.random() * 8) + 1, // Random 1-8 rooms available
              total: 10,
              soldOut: false
            };
          }
        } catch (err) {
          console.error(`Error checking availability for room type ${typeId}:`, err);
          
          // Handle rate limit errors gracefully
          if (axios.isAxiosError(err) && err.response?.status === 429) {
            console.log(`Rate limit hit for room type ${typeId}, using fallback data`);
          }
          
          // Use mock data when API fails
          roomAvailabilityData[typeId] = {
            // For demo/school project, we'll use some default values
            available: Math.floor(Math.random() * 8) + 1, // Random 1-8 rooms available
            total: 10,
            soldOut: false
          };
        }
      }
      
      console.log('Room availability data after checking all types:', roomAvailabilityData);
      setRoomAvailability(roomAvailabilityData);
      
    } catch (err) {
      console.error('Exception fetching available rooms:', err);
      setError('An error occurred while searching for rooms');
    } finally {
      setLoading(false);
    }
  };
  
  // Search and filter rooms
  const searchRooms = () => {
    // Validate dates and guest count
    if (!validateBookingCriteria()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Normalize dates to ensure consistency
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    // Format dates as ISO strings (YYYY-MM-DD)
    const formattedCheckIn = checkIn.toISOString().split('T')[0];
    const formattedCheckOut = checkOut.toISOString().split('T')[0];
    
    // Prepare search parameters with normalized dates
    const searchParams = {
      checkInDate: formattedCheckIn,
      checkOutDate: formattedCheckOut,
      maxGuests: guests ? parseInt(guests, 10) : undefined,
      minPrice: priceMin ? parseInt(priceMin, 10) : undefined,
      maxPrice: priceMax ? parseInt(priceMax, 10) : undefined,
    };
    
    // Build the search URL to update query parameters
    const searchQuery = new URLSearchParams({
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      guests: guests || '1'
    }).toString();
    
    // Update the URL with the search parameters without refreshing the page
    window.history.replaceState(null, '', `${window.location.pathname}?${searchQuery}`);
    
    // Log search parameters
    console.log('Searching rooms with:', searchParams);
    
    // Call API to fetch available rooms
    fetchAvailableRooms(searchParams);
  };

  // Check availability for the specified dates
  const checkAvailability = useCallback(async () => {
    if (!checkInDate || !checkOutDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get all room types first
      const roomTypesResponse = await roomService.getRoomTypes();
      
      if (!roomTypesResponse.success || !roomTypesResponse.data) {
        throw new Error(roomTypesResponse.error || 'Failed to fetch room types');
      }
      
      const allRoomTypes = roomTypesResponse.data;
      
      // Initialize availability data
      const roomAvailabilityData: Record<string, { 
        available: number, 
        total: number,
        soldOut: boolean
      }> = {};
      
      // Check availability for each room type sequentially
      for (const roomType of allRoomTypes) {
        const typeId = roomType.id.toString();
        try {
          // Add a small delay between requests to avoid rate limiting
          if (Object.keys(roomAvailabilityData).length > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          const availabilityResponse = await roomService.checkRoomAvailability(
            typeId,
            checkInDate,
            checkOutDate
          );
          
          if (availabilityResponse.success && availabilityResponse.data) {
            roomAvailabilityData[typeId] = {
              available: availabilityResponse.data.availableCount,
              total: availabilityResponse.data.totalRooms,
              soldOut: availabilityResponse.data.availableCount === 0
            };
          } else {
            // Use mock data as fallback if API call fails
            roomAvailabilityData[typeId] = {
              // For demo/school project, we'll use some default values
              available: Math.floor(Math.random() * 8) + 1, // Random 1-8 rooms available
              total: 10,
              soldOut: false
            };
          }
        } catch (err) {
          console.error(`Error checking availability for room type ${typeId}:`, err);
          
          // Handle rate limit errors gracefully
          if (axios.isAxiosError(err) && err.response?.status === 429) {
            console.log(`Rate limit hit for room type ${typeId}, using fallback data`);
          }
          
          // Use mock data when API fails
          roomAvailabilityData[typeId] = {
            // For demo/school project, we'll use some default values
            available: Math.floor(Math.random() * 8) + 1, // Random 1-8 rooms available
            total: 10,
            soldOut: false
          };
        }
      }
      
      setRoomAvailability(roomAvailabilityData);
    } catch (err) {
      setError('Failed to check room availability. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [checkInDate, checkOutDate]);

  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        <div className="text-center mb-8">
          <h1 className="hotel-heading mb-4">Our Rooms & Suites</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Discover our carefully curated selection of rooms and suites designed to provide maximum comfort and a memorable experience.
          </p>
          
          {/* Booking Requirements */}
          <div className="mt-6 inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm">
            <span className="mr-2">🛎️</span>
            <span>Select dates and guest count to proceed with booking</span>
          </div>
        </div>
        
        {/* Search and filter section - enhanced with booking requirements */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Booking Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="check-in" className="block text-sm font-medium text-gray-700 mb-1">
                Check In Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                id="check-in"
                value={checkInDate}
                onChange={(e) => {
                  setCheckInDate(e.target.value);
                  // Reset any errors
                  setFormErrors(prev => ({...prev, checkIn: ''}));
                }}
                min={new Date().toISOString().split('T')[0]}
                required
                className={formErrors.checkIn ? "border-red-300" : !checkInDate ? "border-amber-300" : ""}
              />
              {formErrors.checkIn && (
                <p className="mt-1 text-sm text-red-600">{formErrors.checkIn}</p>
              )}
            </div>
            <div>
              <label htmlFor="check-out" className="block text-sm font-medium text-gray-700 mb-1">
                Check Out Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                id="check-out"
                value={checkOutDate}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  // Reset any errors
                  setFormErrors(prev => ({...prev, checkOut: ''}));
                }}
                min={checkInDate ? new Date(new Date(checkInDate).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                required
                className={formErrors.checkOut ? "border-red-300" : !checkOutDate ? "border-amber-300" : ""}
              />
              {formErrors.checkOut && (
                <p className="mt-1 text-sm text-red-600">{formErrors.checkOut}</p>
              )}
            </div>
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests <span className="text-red-500">*</span>
              </label>
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className={`w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  formErrors.guests ? "border-red-300" : !guests ? "border-amber-300" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6 Guests</option>
              </select>
              {formErrors.guests && (
                <p className="mt-1 text-sm text-red-600">{formErrors.guests}</p>
              )}
            </div>
            <div className="flex items-end">
              {/* The "inline-flex" is crucial here to ensure proper icon alignment */}
              <button 
                onClick={searchRooms}
                className="w-full h-10 px-4 py-2 inline-flex items-center justify-center gap-2 bg-black text-white rounded-md font-medium hover:bg-black/90 focus:outline-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <span>Searching</span>
                    <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <Search className="h-4 w-4" aria-hidden="true" />
                    <span>Check Availability</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Additional filters with a divider to separate from required filters */}
          <div className="relative mt-8 pt-6 border-t border-gray-200">
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">Additional Filters</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price-min" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price ($)
                </label>
                <Input
                  type="number"
                  id="price-min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min price"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="price-max" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price ($)
                </label>
                <Input
                  type="number"
                  id="price-max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max price"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'capacity')}
                  className="hotel-input w-full"
                >
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Date selection reminder if not selected */}
        {!hasSelectedDates && !loading && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-md p-4 mb-8">
            <p className="font-medium">Please select check-in and check-out dates to see room availability</p>
            <p className="text-sm mt-1">You must select dates before viewing room details or making a booking</p>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading available rooms...</p>
          </div>
        )}
        
        {/* Room listing */}
        {!loading && (
          <RoomTypesGrid 
            availabilityFilter={roomAvailability}
            sortBy={sortBy}
            minPrice={priceMin ? parseInt(priceMin, 10) * 100 : undefined} // Convert to cents
            maxPrice={priceMax ? parseInt(priceMax, 10) * 100 : undefined} // Convert to cents
          />
        )}
      </div>
    </div>
  );
}