import React from 'react';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';

export const metadata = {
  title: 'About Us | Luxury Hotel',
  description: 'Learn about our luxury hotel, our story, our team, and our commitment to exceptional service.',
};

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="bg-white">
        {/* Hero section */}
        <div className="relative h-[60vh]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-blue-900 opacity-50"></div>
            <div className="h-full w-full relative">
              <Image
                src="/images/hotel-exterior.jpg"
                alt="Hotel exterior"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                About Our Hotel
              </h1>
              <p className="mt-6 text-xl text-white max-w-3xl mx-auto">
                A luxury retreat with a rich history and commitment to exceptional service.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story section */}
        <div className="py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Our Story</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                The Legacy of Luxury
              </p>
              <p className="max-w-3xl mt-5 mx-auto text-xl text-gray-500">
                From humble beginnings to becoming a symbol of luxury and comfort.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src="/images/hotel-history.jpg"
                  alt="Hotel in the past"
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              </div>
              <div className="lg:pl-8 flex flex-col justify-center">
                <p className="text-gray-500 mb-6">
                  Founded in 1975, our hotel began as a small family-owned establishment with just 15 rooms. 
                  Over the decades, we've grown into a premier luxury destination while maintaining the warm, 
                  personalized service that has been our hallmark from the beginning.
                </p>
                <p className="text-gray-500 mb-6">
                  Through careful expansion and renovation, we've preserved the historic charm of our original 
                  building while adding modern amenities and comforts. Each phase of our development has been 
                  guided by our commitment to sustainability, community involvement, and creating memorable 
                  experiences for our guests.
                </p>
                <p className="text-gray-500">
                  Today, we proudly stand as a landmark in the city, welcoming guests from around the world 
                  who seek not just accommodation, but an unforgettable stay that combines luxury with authentic local experiences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Our Values</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                What We Stand For
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Value 1 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Excellence</h3>
                    </div>
                  </div>
                  <div className="mt-4 text-base text-gray-500">
                    We strive for excellence in every detail, from the cleanliness of our rooms to the quality of our dining experiences. 
                    Our commitment to excellence means continuously improving and exceeding expectations.
                  </div>
                </div>
              </div>
              
              {/* Value 2 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Personalized Service</h3>
                    </div>
                  </div>
                  <div className="mt-4 text-base text-gray-500">
                    We believe that true luxury is about personalization. We take the time to understand our guests' 
                    preferences and needs, creating customized experiences that make every stay special.
                  </div>
                </div>
              </div>
              
              {/* Value 3 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.65" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Sustainability</h3>
                    </div>
                  </div>
                  <div className="mt-4 text-base text-gray-500">
                    We are committed to sustainable practices that minimize our environmental impact while maximizing 
                    the comfort and luxury of our guests' experience. From energy-efficient systems to locally sourced ingredients, 
                    sustainability guides our decisions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Our Team</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                Meet The People Behind Our Success
              </p>
              <p className="max-w-3xl mt-5 mx-auto text-xl text-gray-500">
                Our dedicated team works tirelessly to create exceptional experiences for our guests.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="relative h-64 mx-auto rounded-full overflow-hidden w-64">
                  <Image
                    src="/images/team/ceo.jpg"
                    alt="CEO"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Emily Johnson</h3>
                  <p className="text-sm text-blue-600">CEO & Founder</p>
                  <p className="mt-2 text-gray-500">
                    With over 20 years in the hospitality industry, Emily brings a wealth of experience 
                    and a passion for creating exceptional guest experiences.
                  </p>
                </div>
              </div>
              
              {/* Team Member 2 */}
              <div className="text-center">
                <div className="relative h-64 mx-auto rounded-full overflow-hidden w-64">
                  <Image
                    src="/images/team/manager.jpg"
                    alt="Hotel Manager"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Michael Rodriguez</h3>
                  <p className="text-sm text-blue-600">Hotel Manager</p>
                  <p className="mt-2 text-gray-500">
                    Michael ensures that every aspect of our hotel operations runs smoothly, 
                    maintaining our high standards while fostering a positive team environment.
                  </p>
                </div>
              </div>
              
              {/* Team Member 3 */}
              <div className="text-center">
                <div className="relative h-64 mx-auto rounded-full overflow-hidden w-64">
                  <Image
                    src="/images/team/chef.jpg"
                    alt="Executive Chef"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Sophie Laurent</h3>
                  <p className="text-sm text-blue-600">Executive Chef</p>
                  <p className="mt-2 text-gray-500">
                    Award-winning chef Sophie creates innovative culinary experiences that 
                    blend international techniques with locally sourced ingredients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-blue-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Experience luxury for yourself.</span>
              <span className="block">Book your stay today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Join us for an unforgettable experience where luxury meets comfort.
            </p>
            <a
              href="/rooms"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 sm:w-auto"
            >
              View Our Rooms
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 