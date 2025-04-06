'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import useAuthStore from '@/store/authStore';
import { useInfoToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const infoToast = useInfoToast();

  // Redirect if not authenticated (this is a backup to AuthProvider)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      infoToast(
        'Please log in to view your profile',
        'Authentication Required',
        4000
      );
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router, infoToast]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900">Please login to view your profile</h1>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-700 text-blue-100">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <div className="mt-1 text-gray-900">{user.firstName} {user.lastName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <div className="mt-1 text-gray-900">{user.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="mt-1 text-gray-900">{user.phoneNumber || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Address</label>
                      <div className="mt-1 text-gray-900">{user.address || 'Not provided'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Account Created</label>
                      <div className="mt-1 text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <div className="mt-1 text-gray-900">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/profile/edit')}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/bookings')}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 