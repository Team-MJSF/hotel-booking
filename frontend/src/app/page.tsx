'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import RoomSearchForm from '@/components/rooms/RoomSearchForm';
import { BookingSearchFormData } from '@/lib/validations/booking';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  // Client component wrapper needed for navigation
  return (
    <MainLayout>
      <HomeContent />
    </MainLayout>
  );
}

// Client component with navigation
function HomeContent() {
  const router = useRouter();

  const handleSearch = (data: BookingSearchFormData) => {
    // Build query string from form data
    const params = new URLSearchParams();
    
    if (data.checkIn) params.append('checkIn', data.checkIn);
    if (data.checkOut) params.append('checkOut', data.checkOut);
    if (data.capacity) params.append('capacity', data.capacity);
    if (data.roomType) params.append('roomType', data.roomType);
    if (data.priceMin) params.append('priceMin', data.priceMin);
    if (data.priceMax) params.append('priceMax', data.priceMax);
    
    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury hotel room"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
        </div>

        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Welcome to Hotel Booking
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl max-w-3xl mx-auto mb-8">
            Find your perfect stay with our luxury accommodations
          </p>
          <Link
            href="/rooms"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md text-lg transition duration-200"
          >
            Browse Rooms
          </Link>
        </div>
      </section>

      {/* Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 mb-12">
        <RoomSearchForm onSearch={handleSearch} />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Our Hotel
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Luxury Rooms</h3>
            <p className="text-gray-600">
              Our rooms are designed for comfort and luxury, with premium amenities and stylish decor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Quick Booking</h3>
            <p className="text-gray-600">
              Our easy booking process lets you reserve your room in minutes with instant confirmation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Flexible Dates</h3>
            <p className="text-gray-600">
              Plans change? We offer flexible booking options and reasonable cancellation policies.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-700 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Discover our selection of rooms and book your perfect getaway today.
          </p>
          <Link
            href="/rooms"
            className="inline-block bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-md text-lg transition duration-200"
          >
            View All Rooms
          </Link>
        </div>
      </section>
    </>
  );
}
