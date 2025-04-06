'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import RoomSearchForm from '@/components/rooms/RoomSearchForm';
import RoomsList from './RoomsList';
import { useRouter } from 'next/navigation';
import { BookingSearchFormData } from '@/lib/validations/booking';

// Client component for the entire page
export default function RoomsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle search form submission
  const handleSearch = (data: BookingSearchFormData) => {
    // Create URL parameters from form data
    const params = new URLSearchParams();
    
    // Add non-empty values to params
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
    });
    
    // Navigate to the same page with new query params
    router.push(`/rooms?${params.toString()}`);
  };
  
  // Convert searchParams to object format for components
  const searchParamsObject = Object.fromEntries(searchParams.entries());

  return (
    <MainLayout>
      <div className="bg-gray-50 pb-12">
        {/* Hero section */}
        <div className="bg-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold mb-2">Our Rooms</h1>
            <p className="text-blue-100 text-lg mb-0">
              Find the perfect accommodation for your stay
            </p>
          </div>
        </div>

        {/* Search and results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Search sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <RoomSearchForm onSearch={handleSearch} />
              </div>
            </div>
            
            {/* Results */}
            <div className="lg:col-span-3">
              <RoomsList searchParams={searchParamsObject} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 