import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Room } from '@/lib/api/roomsService';
import { formatCurrency } from '@/lib/utils/format';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  // Use the first image as a fallback if no images are available
  const imageUrl = room.images && room.images.length > 0
    ? room.images[0]
    : 'https://placehold.co/400x300?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={`${room.type} - ${room.roomNumber}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md text-sm font-medium">
          {formatCurrency(room.price)}/night
        </div>
        {room.status !== 'available' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white px-3 py-2 text-center text-sm font-medium uppercase">
            {room.status}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{room.type}</h3>
          <span className="text-sm text-gray-500">Room #{room.roomNumber}</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {room.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {room.amenities.slice(0, 4).map((amenity, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
            >
              {amenity}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Max Guests: {room.capacity}
          </span>
          <Link
            href={`/rooms/${room.id}`}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              room.status === 'available'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-700 cursor-not-allowed'
            }`}
          >
            {room.status === 'available' ? 'View Details' : 'Not Available'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 