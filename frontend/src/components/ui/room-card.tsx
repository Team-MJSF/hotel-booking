'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface RoomCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  capacity: number;
  amenities?: string[];
  discount?: number;
  className?: string;
  availability?: number;
  totalRooms?: number;
  soldOut?: boolean;
}

export function RoomCard({
  id,
  name,
  description,
  price,
  imageUrl,
  capacity,
  amenities = [],
  discount,
  className,
  availability,
  totalRooms,
  soldOut = false,
}: RoomCardProps) {
  const discountedPrice = discount ? price - (price * discount / 100) : price;
  
  return (
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
      <div className="relative h-48 md:h-60">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          priority
        />
        {discount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
            {discount}% OFF
          </div>
        )}
        
        {soldOut && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 py-2 rounded-md text-lg font-bold transform rotate-[-15deg]">
              SOLD OUT
            </div>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
        <CardTitle className="text-lg md:text-xl text-gray-900 font-serif">{name}</CardTitle>
        <CardDescription className="text-sm line-clamp-2 text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 md:px-6 py-2 flex-1">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-1">{capacity}</span>
            <span>{capacity === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          
          {availability !== undefined && totalRooms !== undefined && (
            <div className="text-sm text-gray-600 mt-1">
              <span className={cn(
                availability === 0 ? 'text-red-600 font-semibold' : 
                availability <= 3 ? 'text-orange-600 font-semibold' : 
                'text-green-600'
              )}>
                {availability === 0 ? 'No rooms available' : 
                 availability === 1 ? 'Last room!' : 
                 `${availability} rooms available`}
              </span>
              {availability <= 3 && availability > 0 && (
                <span className="ml-1 text-red-600 text-xs">
                  (Limited availability)
                </span>
              )}
            </div>
          )}
          
          {amenities.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
              {amenities.slice(0, 4).map((amenity, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="mr-1 h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="truncate">{amenity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 md:px-6 py-4 border-t flex justify-between items-center">
        <div>
          <div className="flex items-baseline">
            <span className="text-lg md:text-xl font-bold text-primary">
              {formatPrice(discountedPrice)}
            </span>
            <span className="text-xs text-gray-500 ml-1">/night</span>
          </div>
          
          {discount && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(price)}
            </span>
          )}
        </div>
        
        <div>
          <Link href={`/rooms/${id}`}>
            <Button disabled={soldOut}>
              {soldOut ? 'Not Available' : 'View Details'}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 