'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Star, Utensils, Wifi, ShowerHead, Tv, Calendar, Users } from 'lucide-react';
import { RoomCard } from '@/components/ui/room-card';
import { RoomType } from '@/types';
import { roomService } from '@/services/api';

// Define the shape of our featured room type
interface FeaturedRoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  image: string;
  amenities: string[];
}

// Sample testimonials
const testimonials = [
  {
    id: '1',
    name: 'Emma Johnson',
    comment: 'The staff went above and beyond to make our stay special. The rooms are beautifully appointed and the beds are incredibly comfortable.',
    rating: 5,
    date: '2023-05-15',
  },
  {
    id: '2',
    name: 'Michael Chen',
    comment: 'Prime location with excellent amenities. The rooftop pool is a must-visit, and the breakfast buffet offered a great variety of options.',
    rating: 5,
    date: '2023-06-22',
  },
  {
    id: '3',
    name: 'Sophia Martinez',
    comment: 'We booked the executive suite for our anniversary and were blown away by the attention to detail. Would definitely return!',
    rating: 4,
    date: '2023-07-10',
  },
];

export default function Home() {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('1');
  const [featuredRoomTypes, setFeaturedRoomTypes] = useState<FeaturedRoomType[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  
  // Add form validation
  const [errors, setErrors] = useState<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>({});
  
  // Fetch room types from API
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoadingRooms(true);
        const response = await roomService.getRoomTypes();
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch room types');
        }
        
        const roomTypes = response.data;
        
        // Sort by display order and take first 3
        const sortedRooms = roomTypes
          .sort((a: RoomType, b: RoomType) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .slice(0, 3)
          .map((room: RoomType) => ({
            id: room.id.toString(),
            name: room.name,
            description: room.description,
            pricePerNight: room.pricePerNight,
            capacity: room.maxGuests,
            image: room.imageUrl || '',
            amenities: typeof room.amenities === 'string' 
              ? JSON.parse(room.amenities) 
              : room.amenities || [],
          }));
        
        setFeaturedRoomTypes(sortedRooms);
      } catch (error) {
        console.error('Error fetching room types:', error);
        // Fallback to empty array if API call fails
        setFeaturedRoomTypes([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    
    fetchRoomTypes();
  }, []);
  
  // Validate search form 
  const validateSearchForm = () => {
    const newErrors: {
      checkIn?: string;
      checkOut?: string;
      guests?: string;
    } = {};
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!checkInDate) {
      newErrors.checkIn = 'Please select a check-in date';
    } else {
      const checkIn = new Date(checkInDate);
      if (isNaN(checkIn.getTime())) {
        newErrors.checkIn = 'Invalid date format';
      } else if (checkIn < today) {
        newErrors.checkIn = 'Check-in date cannot be in the past';
      }
    }
    
    if (!checkOutDate) {
      newErrors.checkOut = 'Please select a check-out date';
    } else if (checkInDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (isNaN(checkOut.getTime())) {
        newErrors.checkOut = 'Invalid date format';
      } else if (checkOut <= checkIn) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }
    
    if (!guests || parseInt(guests, 10) < 1) {
      newErrors.guests = 'Please select at least 1 guest';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission with validation
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateSearchForm()) {
      // If validation passes, navigate to rooms page with search params
      window.location.href = `/rooms?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`;
    }
  };
  
  return (
    <>
      {/* Hero section with video or parallax effect */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
        <Image
            src="/images/hotel-hero.jpg" 
            alt="Grand Plaza Hotel" 
            fill 
          priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        {/* Hero content */}
        <div className="hotel-container relative z-10 flex flex-col items-center justify-center text-center text-white">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight animate-fade-in-up">
            Discover Luxury <span className="text-yellow-400">Redefined</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl luxury-text-shadow font-light animate-fade-in-up animation-delay-150">
            Grand Plaza offers a sanctuary of elegance and comfort in the heart of the city.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
            <Link href="/rooms">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-8 py-3 text-lg h-auto">
                Book Your Stay
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white bg-white/20 text-white hover:bg-white hover:text-primary px-8 py-3 text-lg h-auto">
                Explore Hotel
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
      </section>

      {/* Search bar section with glass effect */}
      <section className="relative z-20 mx-auto max-w-6xl px-4">
        <div className="bg-white rounded-xl shadow-2xl -mt-20 backdrop-blur-md border border-gray-100 overflow-hidden">
          <div className="p-2 md:p-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`py-2 px-4 ${errors.checkIn ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'} rounded-lg border h-[68px] flex flex-col justify-center`}>
                  <div className="flex items-center w-full">
                    <Calendar className={`h-5 w-5 ${errors.checkIn ? 'text-red-500' : 'text-primary'} mr-3`} />
                    <div className="flex-1">
                      <label htmlFor="check-in" className={`block text-xs ${errors.checkIn ? 'text-red-500' : 'text-gray-500'} uppercase font-medium mb-1`}>
                        Check In <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="check-in"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className={`w-full bg-transparent border-none p-0 ${errors.checkIn ? 'text-red-500' : 'text-gray-900'} font-medium focus:outline-none focus:ring-0`}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  {errors.checkIn && (
                    <p className="mt-1 text-xs text-red-500 pl-8">{errors.checkIn}</p>
                  )}
                </div>

                <div className={`py-2 px-4 ${errors.checkOut ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'} rounded-lg border h-[68px] flex flex-col justify-center`}>
                  <div className="flex items-center w-full">
                    <Calendar className={`h-5 w-5 ${errors.checkOut ? 'text-red-500' : 'text-primary'} mr-3`} />
                    <div className="flex-1">
                      <label htmlFor="check-out" className={`block text-xs ${errors.checkOut ? 'text-red-500' : 'text-gray-500'} uppercase font-medium mb-1`}>
                        Check Out <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="check-out"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className={`w-full bg-transparent border-none p-0 ${errors.checkOut ? 'text-red-500' : 'text-gray-900'} font-medium focus:outline-none focus:ring-0`}
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  {errors.checkOut && (
                    <p className="mt-1 text-xs text-red-500 pl-8">{errors.checkOut}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                <div className={`sm:col-span-1 md:col-span-2 py-2 px-4 ${errors.guests ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'} rounded-lg border h-[68px] flex flex-col justify-center`}>
                  <div className="flex items-center w-full">
                    <Users className={`h-5 w-5 ${errors.guests ? 'text-red-500' : 'text-primary'} mr-3`} />
                    <div className="flex-1">
                      <label htmlFor="guests" className={`block text-xs ${errors.guests ? 'text-red-500' : 'text-gray-500'} uppercase font-medium mb-1`}>
                        Guests <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="guests"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className={`w-full bg-transparent border-none p-0 ${errors.guests ? 'text-red-500' : 'text-gray-900'} font-medium focus:outline-none focus:ring-0`}
                        required
                      >
                        <option value="">Select Guests</option>
                        {[1, 2, 3, 4].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors.guests && (
                    <p className="mt-1 text-xs text-red-500 pl-8">{errors.guests}</p>
                  )}
                </div>

                <div className="sm:col-span-1 md:col-span-2 flex items-stretch">
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary-dark h-full text-base py-6 w-full"
                  >
                    Search Rooms
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* About section with elegant styling */}
      <section className="py-20 overflow-hidden">
        <div className="hotel-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-100 rounded-tl-2xl"></div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-br-2xl"></div>
                <div className="relative rounded-lg overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-105">
                  <div className="aspect-w-4 aspect-h-3 w-full">
          <Image
                      src="/images/hotel-lobby.jpg"
                      alt="Grand Plaza Hotel Lobby"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="inline-block bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium mb-6">
                ABOUT OUR HOTEL
              </div>
              <h2 className="hotel-heading text-4xl mb-6">Experience the Height of Luxury & Comfort</h2>
              
              <div className="space-y-6 text-gray-600">
                <p className="leading-relaxed">
                  Nestled in the heart of downtown, Grand Plaza offers a perfect blend of elegance, comfort, and convenience. Our hotel features meticulously designed rooms, state-of-the-art amenities, and exceptional service to ensure an unforgettable stay.
                </p>
                <p className="leading-relaxed">
                  Whether you&apos;re traveling for business or pleasure, our dedicated staff is committed to exceeding your expectations and making your stay as comfortable as possible.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-8 mb-10">
                <div className="flex items-center">
                  <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    <Wifi className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Free High-Speed WiFi</h3>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-yellow-50 p-3 rounded-lg mr-4">
                    <Utensils className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Gourmet Dining</h3>
                  </div>
                </div>
              </div>
              
              <Link href="/about">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-medium border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                >
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured rooms section with improved styling */}
      <section className="py-20 bg-gray-50">
        <div className="hotel-container">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium mb-4">
              LUXURY ACCOMMODATIONS
            </div>
            <h2 className="hotel-heading text-4xl mb-4">Our Featured Rooms & Suites</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Discover our carefully curated selection of rooms and suites, each designed to provide maximum comfort and a memorable experience.
            </p>
          </div>
          
          {loadingRooms ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : featuredRoomTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRoomTypes.map((room) => (
                <RoomCard 
                  key={room.id} 
                  id={room.id}
                  name={room.name}
                  description={room.description}
                  price={room.pricePerNight}
                  imageUrl={room.image}
                  capacity={room.capacity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No room types available at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/rooms">
              <Button 
                variant="outline" 
                size="lg" 
                className="font-medium border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white mt-8"
              >
                View All Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities section with stylish cards */}
      <section className="py-20 bg-white">
        <div className="hotel-container">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium mb-4">
              PREMIUM FACILITIES
            </div>
            <h2 className="hotel-heading text-4xl mb-4">Exceptional Hotel Amenities</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Enjoy a range of premium amenities designed to make your stay comfortable and memorable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative p-6 rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-100/30 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-6 bg-blue-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-lg shadow-blue-200">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">High-Speed Wi-Fi</h3>
                <p className="text-gray-600">Stay connected with complimentary high-speed internet throughout the hotel.</p>
              </div>
            </div>
            
            <div className="relative p-6 rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-100/30 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-6 bg-yellow-500 w-12 h-12 flex items-center justify-center rounded-lg shadow-lg shadow-yellow-200">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Gourmet Restaurant</h3>
                <p className="text-gray-600">Savor delicious cuisine at our on-site restaurant featuring local and international dishes.</p>
              </div>
            </div>
            
            <div className="relative p-6 rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-100/30 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-6 bg-green-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-lg shadow-green-200">
                <Tv className="h-6 w-6 text-white" />
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Smart Entertainment</h3>
                <p className="text-gray-600">Enjoy smart TVs with streaming capabilities and premium channels in every room.</p>
              </div>
            </div>
            
            <div className="relative p-6 rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-100/30 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-6 bg-purple-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-lg shadow-purple-200">
                <ShowerHead className="h-6 w-6 text-white" />
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Luxury Bathrooms</h3>
                <p className="text-gray-600">Indulge in our luxury bathrooms featuring premium toiletries and plush towels.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-16">
            <Link href="/amenities">
              <Button 
                variant="outline" 
                size="lg" 
                className="font-medium border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
              >
                Explore All Amenities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials section with elegant styling */}
      <section className="py-20 bg-gray-50">
        <div className="hotel-container">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium mb-4">
              GUEST EXPERIENCES
            </div>
            <h2 className="hotel-heading text-4xl mb-4">What Our Guests Say</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Discover why guests love staying at Grand Plaza Hotel.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`bg-white p-8 rounded-xl shadow-lg relative transition-all duration-300 hover:shadow-xl 
                  ${index === 1 ? 'md:-mt-8' : ''} 
                  ${index === 2 ? 'md:-mt-4' : ''}`}
              >
                {/* Quotation mark */}
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
                    <path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
                  </svg>
                </div>
                
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-8 leading-relaxed font-medium italic">&quot;{testimonial.comment}&quot;</p>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{formatDate(new Date(testimonial.date))}</p>
                  </div>
                  
                  <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center text-gray-600">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section with dynamic background */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hotel-lobby.jpg" 
            alt="Grand Plaza Hotel" 
            fill 
            sizes="100vw"
            className="object-cover brightness-[0.4]"
          />
        </div>
        
        <div className="hotel-container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Experience Grand Plaza?</h2>
            <p className="text-base md:text-lg mb-6 opacity-90 font-light">
              Book your stay today and enjoy exceptional service, luxurious accommodations, and unforgettable memories.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/rooms">
                <Button 
                  size="lg" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-2 text-base h-auto"
                >
                  Book Your Stay Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white bg-white/20 text-white hover:bg-white hover:text-primary px-6 py-2 text-base h-auto"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
