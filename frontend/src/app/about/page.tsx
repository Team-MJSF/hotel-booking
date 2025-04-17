'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Award, Users, Coffee, Utensils, Dumbbell, Wifi, Car, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="hotel-heading mb-4">About Our Hotel</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Discover a place where luxury meets comfort, creating the perfect backdrop for unforgettable experiences and memories that last a lifetime.
          </p>
        </div>
        
        {/* Our Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
            <Image
              src="/images/hotel-exterior.jpg"
              alt="Hotel exterior"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Founded in 2005, our hotel began with a simple vision: to create a haven of luxury, comfort, and exceptional service in the heart of the city. What started as a boutique establishment has grown into a renowned destination for travelers from around the world.
            </p>
            <p className="text-gray-700 mb-6">
              Our philosophy is rooted in attention to detail, personalized service, and creating memorable experiences for each guest. We believe that a great hotel is not just about beautiful spaces, but about how those spaces make you feel.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Award className="text-primary h-5 w-5 mr-2" />
                <span>Award-winning service</span>
              </div>
              <div className="flex items-center">
                <Clock className="text-primary h-5 w-5 mr-2" />
                <span>18+ years of excellence</span>
              </div>
              <div className="flex items-center">
                <Users className="text-primary h-5 w-5 mr-2" />
                <span>Dedicated staff</span>
              </div>
              <div className="flex items-center">
                <Coffee className="text-primary h-5 w-5 mr-2" />
                <span>Luxury amenities</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Facilities Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Facilities</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              We offer a range of world-class facilities designed to enhance your stay and provide everything you need for a comfortable and enjoyable experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/images/restaurant.jpg"
                  alt="Hotel restaurant"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Utensils className="text-primary h-6 w-6 mr-2" />
                  <h3 className="text-xl font-bold">Fine Dining</h3>
                </div>
                <p className="text-gray-700">
                  Our restaurant offers an exquisite menu featuring local and international cuisine prepared by award-winning chefs, using the freshest ingredients.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/images/gym.jpg"
                  alt="Hotel fitness center"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Dumbbell className="text-primary h-6 w-6 mr-2" />
                  <h3 className="text-xl font-bold">Fitness Center</h3>
                </div>
                <p className="text-gray-700">
                  Stay fit during your stay with our modern gym equipped with the latest fitness equipment, open 24/7 for your convenience.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/images/spa.jpg"
                  alt="Hotel spa"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-primary mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.8 14a6 6 0 0 0 9.4 0"/>
                      <path d="M20 14a18 18 0 0 0-6-9.4 1 1 0 0 0-1.7 1 14 14 0 0 1-4.6 7M4 16a20 20 0 0 1 8-12 2 2 0 0 1 2 0"/>
                      <path d="m4 20 1-2a5 5 0 0 1 10 0l1 2"/>
                    </svg>
                  </span>
                  <h3 className="text-xl font-bold">Wellness Spa</h3>
                </div>
                <p className="text-gray-700">
                  Relax and rejuvenate with our range of spa treatments, including massages, facials, and body treatments in a tranquil environment.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Services Grid */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Services We Offer</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Our comprehensive range of services ensures that every aspect of your stay exceeds expectations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Wifi className="text-primary h-8 w-8 mb-4" />
              <h3 className="text-lg font-bold mb-2">Free High-Speed WiFi</h3>
              <p className="text-gray-600">
                Stay connected with complimentary high-speed internet access throughout the hotel.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Car className="text-primary h-8 w-8 mb-4" />
              <h3 className="text-lg font-bold mb-2">Airport Transfers</h3>
              <p className="text-gray-600">
                Enjoy hassle-free transportation between the airport and our hotel with our transfer service.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Clock className="text-primary h-8 w-8 mb-4" />
              <h3 className="text-lg font-bold mb-2">24/7 Room Service</h3>
              <p className="text-gray-600">
                Our room service is available around the clock to cater to your dining needs at any hour.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="text-primary h-8 w-8 mb-4" />
              <h3 className="text-lg font-bold mb-2">Concierge Services</h3>
              <p className="text-gray-600">
                Our dedicated concierge team is available to assist with reservations, recommendations, and special requests.
              </p>
            </div>
          </div>
        </div>
        
        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Our dedicated staff works tirelessly to ensure your stay is nothing short of exceptional.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
                <Image
                  src="/images/manager.jpg"
                  alt="Hotel Manager"
                  fill
                  sizes="(max-width: 768px) 100vw, 150px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Emily Parker</h3>
              <p className="text-primary font-medium">Hotel Manager</p>
              <p className="text-gray-600 mt-2">
                With over 15 years in luxury hospitality, Emily ensures every aspect of your stay exceeds expectations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
                <Image
                  src="/images/chef.jpg"
                  alt="Executive Chef"
                  fill
                  sizes="(max-width: 768px) 100vw, 150px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Marco Rossi</h3>
              <p className="text-primary font-medium">Executive Chef</p>
              <p className="text-gray-600 mt-2">
                Marco brings his international culinary expertise to create exceptional dining experiences for our guests.
              </p>
            </div>
            
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
                <Image
                  src="/images/concierge.jpg"
                  alt="Head Concierge"
                  fill
                  sizes="(max-width: 768px) 100vw, 150px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">James Wilson</h3>
              <p className="text-primary font-medium">Head Concierge</p>
              <p className="text-gray-600 mt-2">
                James&apos;s extensive knowledge of the area helps guests discover the best local experiences during their stay.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-primary rounded-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Experience Luxury Today</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Book your stay with us and discover why our guests keep coming back for the exceptional experience we offer.
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