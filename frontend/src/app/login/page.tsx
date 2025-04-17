'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, CheckCircle } from 'lucide-react';
import { debugApi } from '@/services/api';

// Define a type for the debug interface
interface HotelBookingDebug {
  checkAuthStatus: () => boolean;
  [key: string]: unknown; // For the spread of debugApi
}

// Define interface for window with our custom property
interface CustomWindow extends Window {
  hotelBookingDebug: HotelBookingDebug;
}

// Expose debug tools to window for browser console access
if (typeof window !== 'undefined') {
  ((window as unknown) as CustomWindow).hotelBookingDebug = {
    ...debugApi,
    checkAuthStatus: () => {
      const token = localStorage.getItem('token');
      console.log('Auth token in localStorage:', !!token);
      return !!token;
    }
  };
}

// Define form schema using Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Type for form values
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Check if user just registered
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Registration successful! Please log in.');
    }
    
    // Store returnUrl or redirect in state
    const returnUrl = searchParams.get('returnUrl');
    const redirectParam = searchParams.get('redirect');
    
    if (returnUrl) {
      setRedirectPath(decodeURIComponent(returnUrl));
    } else if (redirectParam) {
      setRedirectPath(decodeURIComponent(redirectParam));
    }
  }, [searchParams]);

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await login(data.email, data.password);

      if (result.success) {
        // Redirect user to intended destination or home page
        router.push(redirectPath || '/');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">
              Sign in to access your account and manage your bookings
            </p>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {String(error)}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  placeholder="your.email@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <span
                  className="text-sm text-primary hover:text-primary-dark cursor-pointer"
                >
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link 
                  href={`/register${
                    searchParams.get('returnUrl') 
                      ? `?returnUrl=${searchParams.get('returnUrl')}` 
                      : searchParams.get('redirect') 
                        ? `?redirect=${searchParams.get('redirect')}` 
                        : ''
                  }`} 
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 