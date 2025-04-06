'use client';

import React, { useEffect, useState } from 'react';
import RoomCard from '@/components/rooms/RoomCard';
import { Room, PaginatedResponse } from '@/lib/api/roomsService';
import roomsService from '@/lib/api/roomsService';
import { useQuery } from '@tanstack/react-query';
import { useInfoToast, useErrorToast } from '@/context/ToastContext';

interface RoomsListProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function RoomsList({ searchParams }: RoomsListProps) {
  const infoToast = useInfoToast();
  const errorToast = useErrorToast();

  // Convert search params to the format expected by the API
  const getSearchParams = () => {
    const params: Record<string, string> = {};
    
    // Handle possible array values by taking the first item
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          params[key] = value[0];
        } else {
          params[key] = value;
        }
      }
    });
    
    return params;
  };
  
  // Fetch rooms based on search parameters
  const { data, isLoading, error } = useQuery({
    queryKey: ['rooms', searchParams],
    queryFn: () => roomsService.searchRooms(getSearchParams()),
  });
  
  // Handle errors separately with useEffect
  useEffect(() => {
    if (error) {
      errorToast(
        (error as Error).message || 'Failed to load rooms. Please try again.',
        'Search Error',
        5000
      );
    }
  }, [error, errorToast]);
  
  // Show toast when no rooms are found
  useEffect(() => {
    if (!isLoading && data && data.data.length === 0) {
      infoToast(
        'We couldn\'t find any rooms matching your search criteria. Try adjusting your filters.',
        'No Rooms Found',
        5000
      );
    }
  }, [data, isLoading, infoToast]);
  
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        <p className="font-semibold">Error loading rooms</p>
        <p className="text-sm">{(error as Error).message || 'Please try again later'}</p>
      </div>
    );
  }
  
  if (!data || data.data.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Rooms Found</h3>
        <p className="text-gray-600 mb-4">
          We couldn't find any rooms matching your search criteria.
        </p>
        <p className="text-gray-600">
          Try adjusting your search filters or dates for more options.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {data.data.length} {data.data.length === 1 ? 'Room' : 'Rooms'} Available
        </h2>
        
        <div className="text-sm text-gray-500">
          Page {data.meta.page} of {data.meta.totalPages}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {data.data.map((room: Room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
      
      {/* Pagination */}
      {data.meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((page) => (
              <a
                key={page}
                href={`/rooms?${new URLSearchParams({
                  ...getSearchParams(),
                  page: page.toString(),
                })}`}
                className={`px-4 py-2 text-sm rounded-md ${
                  page === data.meta.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
} 