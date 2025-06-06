/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { roomService } from '@/services/api';
import { RoomType } from '@/types';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Users, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// Add type declaration for window.handleRoomNavigation
declare global {
  interface Window {
    handleRoomNavigation?: (roomId: string) => void;
  }
}

interface RoomTypesGridProps {
  availabilityFilter?: Record<string, { 
    available: number; 
    total: number; 
    soldOut: boolean;
  }>;
  sortBy?: 'price-asc' | 'price-desc' | 'capacity';
  minPrice?: number;
  maxPrice?: number;
}

export default function RoomTypesGrid({ 
  availabilityFilter,
  sortBy = 'price-asc',
  minPrice,
  maxPrice
}: RoomTypesGridProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [filteredRoomTypes, setFilteredRoomTypes] = useState<RoomType[]>([]);
  const [filterMessage, setFilterMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  // Get search parameters to include in room detail links
  const checkInDate = searchParams.get('checkIn') || '';
  const checkOutDate = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';

  // Check if all required booking parameters are present
  const hasRequiredBookingInfo = !!(checkInDate && checkOutDate && guests);

  // Handle room detail navigation with validation
  const handleRoomDetailNavigation = (roomId: string, e: React.MouseEvent) => {
    if (!hasRequiredBookingInfo) {
      e.preventDefault();
      
      // Use the window navigation handler if it exists (added by parent component)
      if (typeof window !== 'undefined' && window.handleRoomNavigation) {
        window.handleRoomNavigation(roomId);
      } else {
        // Scroll to the search section if the handler isn't available
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        console.log('Fetching room types in RoomTypesGrid');
        
        const response = await roomService.getRoomTypes();
        
        if (!response.success || !response.data) {
          console.error('Room types API call failed:', response.error);
          throw new Error(response.error || 'Failed to fetch room types');
        }
        
        const data = response.data;
        
        // Log the retrieved room types for debugging
        console.log('Room types from API:', data);
        if (availabilityFilter) {
          console.log('Availability filter:', availabilityFilter);
        }
        
        // Apply filters
        let filteredRooms = [...data];
        
        // Filter by price range if provided
        if (minPrice !== undefined) {
          console.log(`Filtering rooms by min price: ${minPrice}`);
          filteredRooms = filteredRooms.filter(room => room.pricePerNight >= minPrice);
        }
        
        if (maxPrice !== undefined) {
          console.log(`Filtering rooms by max price: ${maxPrice}`);
          filteredRooms = filteredRooms.filter(room => room.pricePerNight <= maxPrice);
        }
        
        // Filter by guest capacity
        if (guests) {
          const guestCount = parseInt(guests, 10);
          console.log(`Filtering rooms by guest capacity: ${guestCount}`);
          filteredRooms = filteredRooms.filter(room => room.maxGuests >= guestCount);
        }
        
        // IMPORTANT FIX: Do not filter based on availability
        // This allows all room types to be shown regardless of availability data
        
        // Apply sorting
        if (sortBy) {
          console.log(`Sorting rooms by: ${sortBy}`);
          filteredRooms.sort((a, b) => {
            if (sortBy === 'price-asc') {
              return a.pricePerNight - b.pricePerNight;
            } else if (sortBy === 'price-desc') {
              return b.pricePerNight - a.pricePerNight;
            } else { // capacity
              return b.maxGuests - a.maxGuests;
            }
          });
        }
        
        console.log(`Displaying ${filteredRooms.length} room types after filtering`);
        setRoomTypes(data);  // Store all room types
        setFilteredRoomTypes(filteredRooms);  // Store filtered room types
        setError(null);
      } catch (err) {
        console.error('Failed to fetch room types:', err);
        
        // Fallback to displaying hardcoded room types if the API fails
        if (roomTypes.length === 0) {
          console.log('Using fallback room types data');
          const fallbackRooms: RoomType[] = [
            {
              id: 1,
              name: 'Standard Room',
              code: 'standard',
              description: 'Comfortable room with all the essential amenities for a pleasant stay.',
              pricePerNight: 14900,
              maxGuests: 2,
              imageUrl: '/images/standard-room.jpg',
              amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
              displayOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 2,
              name: 'Executive Room',
              code: 'executive',
              description: 'Modern room with work area, queen-size bed, and premium toiletries.',
              pricePerNight: 19900,
              maxGuests: 2,
              imageUrl: '/images/executive-room.jpg',
              amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Work Desk'],
              displayOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 3,
              name: 'Family Suite',
              code: 'family',
              description: 'Perfect for families with two bedrooms, living area, and kid-friendly amenities.',
              pricePerNight: 34900,
              maxGuests: 4,
              imageUrl: '/images/family-suite.jpg',
              amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Kitchenette', 'Multiple Beds'],
              displayOrder: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          setRoomTypes(fallbackRooms);
          setFilteredRoomTypes(fallbackRooms);
        }
        
        setError('Failed to load room types from API. Some content may be displayed from cached data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, [availabilityFilter, sortBy, minPrice, maxPrice]);

  // Show a message if no rooms match the guest count
  useEffect(() => {
    if (roomTypes.length > 0 && filteredRoomTypes.length === 0) {
      setFilterMessage(`No rooms available for ${guests} guests. Showing all available rooms.`);
    } else {
      setFilterMessage('');
    }
  }, [roomTypes.length, filteredRoomTypes.length, guests]);

  if (loading) {
    return (
      <div className="py-6 text-center">
        <p className="text-lg font-medium">Loading room types...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-red-600">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }
  
  if (filteredRoomTypes.length === 0) {
    return (
      <div className="py-6 text-center bg-gray-100 rounded-lg p-8">
        <p className="text-lg font-medium">No rooms matching your criteria were found.</p>
        <p className="mt-2 text-gray-600">Try adjusting your search parameters.</p>
      </div>
    );
  }

  return (
    <>
      {filterMessage && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          {filterMessage}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredRoomTypes.map((roomType) => {
          // Get availability info if available
          const availabilityInfo = availabilityFilter && availabilityFilter[roomType.id.toString()];
          
          // Create the URL with search parameters
          const roomDetailUrl = hasRequiredBookingInfo
            ? `/rooms/${roomType.id}?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`
            : `/rooms/${roomType.id}`;
          
          // Determine if the room is available or sold out based on availability info
          const isSoldOut = availabilityInfo && availabilityInfo.soldOut;
          
          return (
            <div key={roomType.id} className="h-full">
              <Card className="h-full overflow-hidden hover:shadow-lg transition duration-300 relative">
                {!hasRequiredBookingInfo && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Select dates first
                    </div>
                  </div>
                )}
                
                <div className="relative h-48 w-full">
                  <Image 
                    src={roomType.imageUrl || '/images/room-placeholder.jpg'} 
                    alt={roomType.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-2">{roomType.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{roomType.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold text-primary">
                      {formatPrice(roomType.pricePerNight)} <span className="text-sm font-normal text-gray-600">/ night</span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Up to {roomType.maxGuests} guests
                    </p>
                  </div>
                  
                  {/* Only show amenities section if there are amenities to display */}
                  {((Array.isArray(roomType.amenities) && roomType.amenities.length > 0) || 
                    (typeof roomType.amenities === 'string' && JSON.parse(roomType.amenities).length > 0)) && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(roomType.amenities) ? (
                          <>
                            {roomType.amenities.slice(0, 4).map((amenity, index) => (
                              <span key={index} className="px-2 py-1 text-xs border border-gray-200 rounded-full text-gray-700">{amenity}</span>
                            ))}
                            {roomType.amenities.length > 4 && (
                              <span className="px-2 py-1 text-xs border border-gray-200 rounded-full text-gray-700">
                                +{roomType.amenities.length - 4} more
                              </span>
                            )}
                          </>
                        ) : roomType.amenities ? (
                          // Handle case where amenities is a JSON string
                          <>
                            {JSON.parse(roomType.amenities as string)
                              .slice(0, 4)
                              .map((amenity: string, index: number) => (
                                <span key={index} className="px-2 py-1 text-xs border border-gray-200 rounded-full text-gray-700">{amenity}</span>
                              ))}
                            {JSON.parse(roomType.amenities as string).length > 4 && (
                              <span className="px-2 py-1 text-xs border border-gray-200 rounded-full text-gray-700">
                                +{JSON.parse(roomType.amenities as string).length - 4} more
                              </span>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  {/* Show availability if provided and dates selected */}
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    {hasRequiredBookingInfo && availabilityInfo ? (
                      <p className={`text-sm ${
                        availabilityInfo.available > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {availabilityInfo.available > 0
                          ? `${availabilityInfo.available} of ${availabilityInfo.total} rooms available`
                          : 'Sold out for selected dates'}
                      </p>
                    ) : hasRequiredBookingInfo ? (
                      <p className="text-sm text-amber-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Check availability by selecting this room
                      </p>
                    ) : (
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Select dates to check availability
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    {hasRequiredBookingInfo ? (
                      isSoldOut ? (
                        <Button 
                          key={`room-${roomType.id}-sold-out`}
                          variant="default"
                          className="w-full"
                          disabled
                        >
                          Sold Out
                        </Button>
                      ) : (
                        <Link 
                          href={roomDetailUrl}
                          className="w-full block"
                          key={`room-${roomType.id}-link`}
                        >
                          <Button 
                            variant="default"
                            className="w-full"
                          >
                            View Details
                          </Button>
                        </Link>
                      )
                    ) : (
                      <Button 
                        key={`room-${roomType.id}-button-alt`}
                        variant="outline"
                        className="w-full"
                        onClick={(e) => handleRoomDetailNavigation(roomType.id.toString(), e)}
                      >
                        Select Dates & Guests First
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
} 