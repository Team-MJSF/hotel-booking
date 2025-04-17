'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Utensils, 
  Dumbbell, 
  Coffee, 
  Wifi, 
  Car, 
  Clock, 
  Users, 
  Palmtree, 
  ShowerHead, 
  Wine, 
  Tv, 
  Music 
} from 'lucide-react';

// Array of amenities for the featured section
const featuredAmenities = [
  {
    icon: <Utensils className="text-primary h-10 w-10" />,
    title: "Fine Dining Restaurant",
    description: "Experience exquisite cuisine prepared by our award-winning chefs using locally-sourced ingredients.",
    image: "/images/restaurant.jpg"
  },
  {
    icon: <Palmtree className="text-primary h-10 w-10" />,
    title: "Outdoor Pool",
    description: "Relax and unwind in our stunning outdoor pool with comfortable loungers and pool-side service.",
    image: "/images/hotel-lobby.jpg"  // Using hotel lobby image as a placeholder for pool
  },
  {
    icon: <Dumbbell className="text-primary h-10 w-10" />,
    title: "Fitness Center",
    description: "Stay active in our state-of-the-art fitness center featuring modern equipment and personal trainers.",
    image: "/images/gym.jpg"
  },
  {
    icon: <ShowerHead className="text-primary h-10 w-10" />,
    title: "Luxury Spa",
    description: "Indulge in relaxing treatments and therapies in our tranquil spa environment.",
    image: "/images/spa.jpg"
  }
];

// Array of additional amenities
const additionalAmenities = [
  {
    icon: <Wifi className="text-primary h-6 w-6" />,
    title: "High-Speed WiFi",
    description: "Complimentary high-speed internet access throughout the hotel."
  },
  {
    icon: <Car className="text-primary h-6 w-6" />,
    title: "Airport Transfers",
    description: "Convenient transportation between the airport and our hotel."
  },
  {
    icon: <Clock className="text-primary h-6 w-6" />,
    title: "24/7 Room Service",
    description: "Around-the-clock dining options delivered directly to your room."
  },
  {
    icon: <Users className="text-primary h-6 w-6" />,
    title: "Concierge Services",
    description: "Expert assistance with reservations, recommendations, and special requests."
  },
  {
    icon: <Coffee className="text-primary h-6 w-6" />,
    title: "Coffee Lounge",
    description: "Enjoy premium coffee and light snacks in our comfortable lounge area."
  },
  {
    icon: <Wine className="text-primary h-6 w-6" />,
    title: "Wine & Cocktail Bar",
    description: "Selection of fine wines and expertly crafted cocktails in an elegant setting."
  },
  {
    icon: <Tv className="text-primary h-6 w-6" />,
    title: "In-Room Entertainment",
    description: "Smart TVs with streaming services and on-demand content in all rooms."
  },
  {
    icon: <Music className="text-primary h-6 w-6" />,
    title: "Live Entertainment",
    description: "Regular live music and performances in our lounge and restaurant."
  }
];

export default function AmenitiesPage() {
  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="hotel-heading mb-4">Hotel Amenities & Services</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Discover the exceptional amenities and services that make your stay with us truly memorable. From fine dining to relaxation and entertainment, we&apos;ve thought of everything.
          </p>
        </div>
        
        {/* Featured Amenities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">Featured Amenities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredAmenities.map((amenity, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
                <div className="relative h-64">
                  <Image
                    src={amenity.image}
                    alt={amenity.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center mb-4">
                    {amenity.icon}
                    <h3 className="text-xl font-bold ml-3">{amenity.title}</h3>
                  </div>
                  <p className="text-gray-700 flex-1">{amenity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Amenities Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">Additional Services & Amenities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalAmenities.map((amenity, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md h-full">
                {amenity.icon}
                <h3 className="text-lg font-bold my-3">{amenity.title}</h3>
                <p className="text-gray-600">{amenity.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Room Amenities Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">In-Room Amenities</h2>
              <p className="text-gray-700 mb-6">
                Every room and suite at our hotel is thoughtfully equipped with premium amenities 
                to ensure your utmost comfort and convenience during your stay.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Tv className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Smart TV</h3>
                    <p className="text-sm text-gray-600">With streaming capabilities</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Wifi className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">High-Speed WiFi</h3>
                    <p className="text-sm text-gray-600">Complimentary in all rooms</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Coffee className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Coffee Machine</h3>
                    <p className="text-sm text-gray-600">Premium coffee and tea selection</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <ShowerHead className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Luxury Bathroom</h3>
                    <p className="text-sm text-gray-600">With premium toiletries</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <Image
                src="/images/hotel-exterior.jpg"
                alt="Room amenities"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Accessibility Features */}
        <div className="mb-16 bg-gray-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-6">Accessibility Features</h2>
          <p className="text-gray-700 mb-6">
            We&apos;re committed to providing a comfortable and accessible experience for all our guests. 
            Our hotel features a range of accessibility options, including:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>Wheelchair accessible rooms</span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>Accessible parking spaces</span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>Elevator access to all floors</span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>Accessible bathrooms in public areas</span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>Visual alarms in hallways and public areas</span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>Service animals welcome</span>
            </li>
          </ul>
        </div>
        
        {/* CTA Section */}
        <div className="bg-primary rounded-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Experience Our Amenities Firsthand</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Book your stay with us today and enjoy all the premium amenities and services that our hotel has to offer.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/rooms">
              <Button className="bg-white text-primary hover:bg-gray-100 min-w-[160px]">
                View Rooms
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-white bg-white/20 text-white hover:bg-white hover:text-primary min-w-[160px]">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 