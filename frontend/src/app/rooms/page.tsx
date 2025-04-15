'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoomType } from '@/types';
import { roomService } from '@/services/api';
import { formatPrice } from '@/lib/utils';
import { Bed, Users, ArrowDown, ArrowUp, Search, Wifi, Tv, ShowerHead, Utensils } from 'lucide-react';

// Temporary room types data while API integration is pending
const dummyRoomTypes: RoomType[] = [
  {
    id: '1',
    name: 'Deluxe Suite',
    description: 'Spacious suite with city views, king-size bed, and luxury amenities.',
    pricePerNight: 29900, // in cents
    capacity: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Executive Room',
    description: 'Modern room with work area, queen-size bed, and premium toiletries.',
    pricePerNight: 19900, // in cents
    capacity: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Family Suite',
    description: 'Perfect for families with two bedrooms, living area, and kid-friendly amenities.',
    pricePerNight: 34900, // in cents
    capacity: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Standard Room',
    description: 'Comfortable room with all the essential amenities for a pleasant stay.',
    pricePerNight: 14900, // in cents
    capacity: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Premium Suite',
    description: 'Luxurious suite with separate living area, premium amenities, and stunning views.',
    pricePerNight: 39900, // in cents
    capacity: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Define room images (in a real app, these would come from the API)
const roomImages: Record<string, string> = {
  '1': '/images/deluxe-suite.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/standard-room.jpg',
  '5': '/images/premium-suite.jpg',
};

export default function RoomsPage() {
  const searchParams = useSearchParams();
  
  // State for search form and filters
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkIn') || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'capacity'>('price-asc');
  
  // State for room data
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(dummyRoomTypes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load room types from API
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we would call the API here
        // const response = await roomService.getRoomTypes();
        
        // For now, use the dummy data
        setRoomTypes(dummyRoomTypes);
      } catch (err) {
        console.error('Error fetching room types:', err);
        setError('Failed to load room types. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomTypes();
  }, []);
  
  // Search and filter rooms
  const searchRooms = () => {
    // In a real app, this would call the API with the search parameters
    console.log('Searching rooms with:', { checkInDate, checkOutDate, guests, priceMin, priceMax });
    
    // For now, just apply client-side filters
    let filtered = [...dummyRoomTypes];
    
    // Filter by capacity
    if (guests) {
      filtered = filtered.filter(room => room.capacity >= parseInt(guests, 10));
    }
    
    // Filter by price range
    if (priceMin) {
      filtered = filtered.filter(room => room.pricePerNight >= parseInt(priceMin, 10) * 100);
    }
    
    if (priceMax) {
      filtered = filtered.filter(room => room.pricePerNight <= parseInt(priceMax, 10) * 100);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.pricePerNight - b.pricePerNight;
      } else if (sortBy === 'price-desc') {
        return b.pricePerNight - a.pricePerNight;
      } else {
        return b.capacity - a.capacity;
      }
    });
    
    setRoomTypes(filtered);
  };
  
  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        <div className="text-center mb-8">
          <h1 className="hotel-heading mb-4">Our Rooms & Suites</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Discover our carefully curated selection of rooms and suites designed to provide maximum comfort and a memorable experience.
          </p>
        </div>
        
        {/* Search and filter section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="check-in" className="block text-sm font-medium text-gray-700 mb-1">
                Check In
              </label>
              <Input
                type="date"
                id="check-in"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label htmlFor="check-out" className="block text-sm font-medium text-gray-700 mb-1">
                Check Out
              </label>
              <Input
                type="date"
                id="check-out"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </label>
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="hotel-input w-full"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button fullWidth onClick={searchRooms}>
                <Search className="h-4 w-4 mr-2" /> Search Rooms
              </Button>
            </div>
          </div>
          
          {/* Additional filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-8">
            {error}
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
        {!loading && roomTypes.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600">No rooms matching your criteria were found.</p>
            <p className="text-gray-500 mt-2">Try adjusting your search parameters.</p>
          </div>
        )}
        
        {!loading && roomTypes.length > 0 && (
          <div className="grid grid-cols-1 gap-8">
            {roomTypes.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src={roomImages[room.id] || '/images/room-placeholder.jpg'}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 col-span-2">
                    <div className="flex flex-col h-full">
                      <div>
                        <div className="flex justify-between items-start">
                          <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
                          <p className="text-xl font-bold text-primary">{formatPrice(room.pricePerNight)}<span className="text-sm font-normal text-gray-500"> / night</span></p>
                        </div>
                        <p className="text-gray-600 mt-2 mb-4">{room.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800">
                            <Bed className="h-4 w-4 mr-1" /> Comfortable Beds
                          </span>
                          <span className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800">
                            <Users className="h-4 w-4 mr-1" /> Sleeps {room.capacity}
                          </span>
                          <span className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800">
                            <Wifi className="h-4 w-4 mr-1" /> Free Wi-Fi
                          </span>
                          <span className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800">
                            <Tv className="h-4 w-4 mr-1" /> Smart TV
                          </span>
                          <span className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800">
                            <ShowerHead className="h-4 w-4 mr-1" /> Luxury Bathroom
                          </span>
                          <span className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800">
                            <Utensils className="h-4 w-4 mr-1" /> Breakfast
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <Link href={`/room-details/${room.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        
                        <Link 
                          href={{
                            pathname: `/booking/${room.id}`,
                            query: {
                              checkIn: checkInDate,
                              checkOut: checkOutDate,
                              guests,
                            },
                          }}
                        >
                          <Button>Book Now</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 