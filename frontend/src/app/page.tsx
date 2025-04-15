'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate } from '@/lib/utils';
import { ChevronRight, Star, Utensils, Wifi, ShowerHead, Tv, MapPin, Calendar, Users } from 'lucide-react';

// Sample room types for the homepage
const featuredRoomTypes = [
  {
    id: '1',
    name: 'Deluxe Suite',
    description: 'Spacious suite with city views, king-size bed, and luxury amenities.',
    pricePerNight: 29900, // in cents
    capacity: 2,
    image: '/images/deluxe-suite.jpg',
  },
  {
    id: '2',
    name: 'Executive Room',
    description: 'Modern room with work area, queen-size bed, and premium toiletries.',
    pricePerNight: 19900, // in cents
    capacity: 2,
    image: '/images/executive-room.jpg',
  },
  {
    id: '3',
    name: 'Family Suite',
    description: 'Perfect for families with two bedrooms, living area, and kid-friendly amenities.',
    pricePerNight: 34900, // in cents
    capacity: 4,
    image: '/images/family-suite.jpg',
  },
];

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
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 px-8 py-3 text-lg h-auto">
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
            <form className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 lg:col-span-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <div className="flex-1">
                    <label htmlFor="location" className="block text-xs text-gray-500 uppercase font-medium mb-1">
                      Location
                    </label>
                    <select
                      id="location"
                      className="w-full bg-transparent border-none p-0 text-gray-900 font-medium focus:outline-none focus:ring-0"
                      defaultValue="grand-plaza"
                    >
                      <option value="grand-plaza">Grand Plaza Hotel</option>
                      <option value="downtown">Downtown Location</option>
                      <option value="airport">Airport Location</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-3" />
                    <div className="flex-1">
                      <label htmlFor="check-in" className="block text-xs text-gray-500 uppercase font-medium mb-1">
                        Check In
                      </label>
                      <input
                        type="date"
                        id="check-in"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-gray-900 font-medium focus:outline-none focus:ring-0"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-3" />
                    <div className="flex-1">
                      <label htmlFor="check-out" className="block text-xs text-gray-500 uppercase font-medium mb-1">
                        Check Out
                      </label>
                      <input
                        type="date"
                        id="check-out"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-gray-900 font-medium focus:outline-none focus:ring-0"
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                <div className="sm:col-span-1 md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-3" />
                    <div className="flex-1">
                      <label htmlFor="guests" className="block text-xs text-gray-500 uppercase font-medium mb-1">
                        Guests
                      </label>
                      <select
                        id="guests"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-gray-900 font-medium focus:outline-none focus:ring-0"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-1 md:col-span-2 flex items-stretch">
                  <Link 
                    href={{
                      pathname: '/rooms',
                      query: { checkIn: checkInDate, checkOut: checkOutDate, guests },
                    }} 
                    className="w-full"
                  >
                    <Button 
                      fullWidth 
                      className="bg-primary hover:bg-primary-dark h-full text-base py-6"
                    >
                      Search Rooms
                    </Button>
                  </Link>
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
                  Whether you're traveling for business or pleasure, our dedicated staff is committed to exceeding your expectations and making your stay as comfortable as possible.
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
                <Button variant="outline" className="group font-medium border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors px-6 py-3 rounded-lg inline-flex items-center gap-2">
                  Learn More About Us
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRoomTypes.map((room) => (
              <div key={room.id} className="group relative bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2">
                <div className="relative h-64 w-full overflow-hidden">
          <Image
                    src={room.image}
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
                    <Link href={`/room-details/${room.id}`} className="w-full">
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
                      query: { room: room.id }
                    }} className="w-full">
                      <Button fullWidth className="bg-primary hover:bg-primary-dark">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
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
                className="group font-medium border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                Explore All Amenities
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                
                <p className="text-gray-700 mb-8 leading-relaxed font-medium italic">"{testimonial.comment}"</p>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{formatDate(testimonial.date, 'PP')}</p>
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
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hotel-lobby.jpg" 
            alt="Grand Plaza Hotel" 
            fill 
            className="object-cover brightness-[0.4]"
          />
        </div>
        
        <div className="hotel-container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready to Experience Grand Plaza?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90 font-light">
              Book your stay today and enjoy exceptional service, luxurious accommodations, and unforgettable memories.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/rooms">
                <Button 
                  size="lg" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-8 py-3 text-lg h-auto"
                >
                  Book Your Stay Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20 px-8 py-3 text-lg h-auto"
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
