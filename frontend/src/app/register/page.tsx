'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Wifi } from 'lucide-react';
import { authService } from '@/services/api';

// Define form schema using Zod
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Type for form values
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Test API connection
  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      setDebugInfo("Testing connection to backend API...");
      
      const result = await authService.testConnection();
      
      setConnectionStatus(result);
      setDebugInfo(prev => `${prev}\nConnection test result: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus({
        success: false,
        message: 'Connection test failed with an unexpected error'
      });
      setDebugInfo(prev => `${prev}\nConnection test error: ${JSON.stringify(error)}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(`Attempting to register user: ${data.email}`);

      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      setDebugInfo(prev => `${prev}\nSending data to API...`);
      
      const result = await registerUser(userData);

      setDebugInfo(prev => `${prev}\nAPI Response: ${JSON.stringify(result)}`);

      if (result.success) {
        router.push('/login?registered=true');
      } else {
        // Check if it's an email already exists error
        if (result.message && result.message.includes('Email already exists')) {
          setError(
            <div>
              <p>{result.message}</p>
              <p className="mt-2">
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                  Go to login page
                </Link>
              </p>
            </div>
          );
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
      setDebugInfo(prev => `${prev}\nError: ${JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">
              Join Grand Plaza to book rooms and manage your reservations
            </p>
          </div>

          {/* Display API URL for debugging */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
            <div className="flex justify-between items-center">
              <span>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testConnection} 
                isLoading={isTestingConnection}
                className="ml-4 bg-blue-100 border-blue-300 hover:bg-blue-200"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
            
            {connectionStatus && (
              <div className={`mt-2 p-2 rounded ${connectionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {connectionStatus.message}
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Debug information (development only) */}
          {debugInfo && process.env.NODE_ENV !== 'production' && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-gray-800 rounded-md text-sm font-mono whitespace-pre-wrap">
              {debugInfo}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="firstName"
                    type="text"
                    className="pl-10"
                    placeholder="John"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="lastName"
                    type="text"
                    className="pl-10"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>
              </div>
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="pl-10"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Create Account
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 