'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Facebook, Instagram, Mail, MapPin, Menu, Phone, Twitter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Add console logging to debug auth state
  React.useEffect(() => {
    console.log('Auth state in MainLayout:', { 
      isAuthenticated, 
      user,
      token: typeof window !== 'undefined' ? !!localStorage.getItem('token') : null
    });
    
    // Check token on mount
    const checkToken = () => {
      const token = localStorage.getItem('token');
      console.log('Current auth token in localStorage:', token ? token.slice(0, 20) + '...' : 'none');
    };
    
    checkToken();
  }, [isAuthenticated, user]);

  // Navigation links for the header
  const navLinks = [
    { href: '/', label: 'Home', protected: false },
    { href: '/rooms', label: 'Rooms', protected: false },
    { href: '/my-bookings', label: 'My Bookings', protected: true },
    { href: '/account', label: 'My Account', protected: true },
  ];

  // Filtered navigation links based on authentication status
  const filteredNavLinks = navLinks.filter(
    (link) => !link.protected || (link.protected && isAuthenticated)
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top header with contact info */}
      <div className="bg-primary text-white py-2 hidden md:block">
        <div className="hotel-container">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@grandplaza.com</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                <span>123 Luxury Avenue, Downtown</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-white/80 hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-white/80 hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-white/80 hover:text-white">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="hotel-container">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex">
              <Link href="/" className="font-serif text-2xl font-bold text-primary">
                Grand Plaza
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                >
                  Logout
                </Button>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="hotel-container py-4 space-y-1">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-4"
                >
                  Logout
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Link href="/login" className="flex" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" fullWidth>Login</Button>
                  </Link>
                  <Link href="/register" className="flex" onClick={() => setMobileMenuOpen(false)}>
                    <Button fullWidth>Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="hotel-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-serif font-semibold mb-4">Grand Plaza</h3>
              <p className="text-gray-300 mb-4">
                Experience luxury and comfort in the heart of the city. Our hotel offers the perfect blend of elegance and modern amenities.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
                </li>
                <li>
                  <Link href="/rooms" className="text-gray-300 hover:text-white">Rooms</Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-300">123 Luxury Avenue, Downtown</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-300">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-300">info@grandplaza.com</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-300 mb-4">Subscribe to our newsletter for special deals and offers.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-r-md">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Grand Plaza Hotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 