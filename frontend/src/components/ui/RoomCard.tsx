'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Users, Wifi, Tv, ShowerHead, Utensils } from 'lucide-react';
import { Button } from './Button';
import { RoomType } from '@/types';
import { formatPrice } from '@/lib/utils';

interface RoomCardProps {
  room: RoomType & { image?: string };
  mode?: 'compact' | 'detailed';
  checkInDate?: string;
  checkOutDate?: string;
  guests?: string;
}

export function RoomCard({ 
  room, 
  mode = 'compact',
  checkInDate,
  checkOutDate,
  guests
}: RoomCardProps) {
  if (mode === 'compact') {
    return (
      <div className="group relative bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2">
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={room.image || '/images/room-placeholder.jpg'}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="bg-yellow-500 text-white text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1">
              {room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
            <div className="text-right">
              <p className="text-primary font-bold text-xl">{formatPrice(room.pricePerNight)}</p>
              <p className="text-gray-500 text-sm">per night</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center bg-gray-100 px-2.5 py-1 rounded-full text-sm text-gray-800">
              <Wifi className="h-3 w-3 mr-1" /> WiFi
            </span>
            <span className="inline-flex items-center bg-gray-100 px-2.5 py-1 rounded-full text-sm text-gray-800">
              <Utensils className="h-3 w-3 mr-1" /> Breakfast
            </span>
            <span className="inline-flex items-center bg-gray-100 px-2.5 py-1 rounded-full text-sm text-gray-800">
              <ShowerHead className="h-3 w-3 mr-1" /> Luxury Bath
            </span>
            <span className="inline-flex items-center bg-gray-100 px-2.5 py-1 rounded-full text-sm text-gray-800">
              <Tv className="h-3 w-3 mr-1" /> Smart TV
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/rooms/${room.id}`} className="w-full">
              <Button 
                variant="outline" 
                fullWidth 
                className="border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900"
              >
                Details
              </Button>
            </Link>
            <Link href={{
              pathname: '/booking',
              query: { roomId: room.id }
            }} className="w-full">
              <Button fullWidth className="bg-primary hover:bg-primary-dark">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Detailed mode (for the rooms listing page)
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="relative h-64 md:h-auto">
          <Image
            src={room.image || '/images/room-placeholder.jpg'}
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
              <Link href={`/rooms/${room.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
              
              <Link 
                href={{
                  pathname: `/booking`,
                  query: {
                    roomId: room.id,
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
  );
} 