'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Room, RoomType } from '@/types';
import { roomService } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Bed, Users, Wifi, Tv, ShowerHead, Utensils, Coffee, Snowflake, CheckCircle, Calendar } from 'lucide-react';

const ROOM_IMAGES: Record<string, string> = {
  '1': '/images/deluxe-suite.jpg',
  '2': '/images/executive-room.jpg',
  '3': '/images/family-suite.jpg',
  '4': '/images/standard-room.jpg',
  '5': '/images/premium-suite.jpg',
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
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '1';
  
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState(checkInParam);
  const [checkOutDate, setCheckOutDate] = useState(checkOutParam);
  const [guests, setGuests] = useState(guestsParam);
  
  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, fetch the room details from the API
        // const response = await roomService.getRoomTypeById(id);
        
        // For now, use dummy data
        const dummyRoom: RoomType = {
          id: id as string,
          name: 'Deluxe Suite',
          description: 'Experience luxury and comfort in our spacious Deluxe Suite featuring a king-size bed, elegant sitting area, and stunning city views. The suite includes a modern bathroom with premium amenities, a work desk, and high-speed internet. Perfect for both business travelers and couples seeking a special getaway.',
          pricePerNight: 29900,
          capacity: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setRoomType(dummyRoom);
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRoomDetails();
    }
  }, [id]);
  
  // Calculate total price
  const calculateTotalPrice = () => {
    if (!roomType || !checkInDate || !checkOutDate) return roomType?.pricePerNight || 0;
    
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return roomType.pricePerNight * (nights > 0 ? nights : 1);
  };
  
  // Handle booking
  const handleBookNow = () => {
    if (checkInDate && checkOutDate) {
      router.push(`/booking?roomId=${id}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
    } else {
      // Show validation message or scroll to date selector
      alert('Please select check-in and check-out dates to continue booking.');
    }
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
  
  if (error || !roomType) {
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
  
  // Get the correct amenities for this room type, fallback to default
  const amenities = ROOM_AMENITIES[roomType.name as keyof typeof ROOM_AMENITIES] || ROOM_AMENITIES.default;
  
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
          <p className="text-gray-600">{roomType.capacity} Guests • Luxury Accommodations</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            {/* Room Gallery */}
            <div className="relative w-full h-96 rounded-xl overflow-hidden mb-6">
              <Image
                src={ROOM_IMAGES[id as string] || '/images/room-placeholder.jpg'}
                alt={roomType.name}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Room Description */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Check-in</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Calendar className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">From 3:00 PM</p>
                        <p className="text-sm text-gray-600">Photo ID required</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Check-out</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Calendar className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Until 12:00 PM</p>
                        <p className="text-sm text-gray-600">Late check-out available upon request</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-6">
                <h3 className="font-bold text-lg mb-2">Cancellation Policy</h3>
                <p className="text-gray-700">Free cancellation up to 24 hours before check-in. Cancellations made less than 24 hours before check-in are subject to a one-night charge.</p>
              </div>
            </div>
          </div>
          
          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Price Details</h2>
                <div className="text-right">
                  <p className="text-primary font-bold text-2xl">{formatPrice(roomType.pricePerNight)}</p>
                  <p className="text-gray-600 text-sm">per night</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="check-in-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Check In
                  </label>
                  <input
                    type="date"
                    id="check-in-date"
                    className="hotel-input w-full"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label htmlFor="check-out-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Check Out
                  </label>
                  <input
                    type="date"
                    id="check-out-date"
                    className="hotel-input w-full"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label htmlFor="guests-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <select
                    id="guests-select"
                    className="hotel-input w-full"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {Array.from({ length: roomType.capacity }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {checkInDate && checkOutDate && (
                <div className="border-t border-b border-gray-200 py-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span>Room Rate</span>
                    <span>{formatPrice(roomType.pricePerNight)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotalPrice())}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    *Taxes and fees included
                  </p>
                </div>
              )}
              
              <Button fullWidth onClick={handleBookNow} size="lg">
                Book Now
              </Button>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                No payment required now – pay at the hotel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 