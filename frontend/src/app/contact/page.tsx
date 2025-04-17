'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Clock, Check } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would send data to an API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      setSubmitted(true);
      // Reset submitted status after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="py-8 md:py-12">
      <div className="hotel-container">
        <div className="text-center mb-12">
          <h1 className="hotel-heading mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Have questions or need assistance? Our friendly team is here to help. Reach out to us through any of the methods below.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-700">
                    Thank you for contacting us. We&apos;ll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name*
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address*
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject*
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="hotel-input w-full"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="">Select a subject</option>
                        <option value="Reservation Inquiry">Reservation Inquiry</option>
                        <option value="Room Information">Room Information</option>
                        <option value="Special Requests">Special Requests</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Message*
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className={`hotel-input w-full resize-none ${errors.message ? 'border-red-500' : ''}`}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                    ></textarea>
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-full p-3">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Our Location</h3>
                    <p className="text-gray-600">123 Luxury Avenue, Downtown</p>
                    <p className="text-gray-600">New York, NY 10001, USA</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Phone Numbers</h3>
                    <p className="text-gray-600">Reservations: +1 (555) 123-4567</p>
                    <p className="text-gray-600">Customer Service: +1 (555) 765-4321</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Email Addresses</h3>
                    <p className="text-gray-600">Reservations: reservations@grandplaza.com</p>
                    <p className="text-gray-600">Customer Service: info@grandplaza.com</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Opening Hours</h3>
                    <p className="text-gray-600">Front Desk: 24/7</p>
                    <p className="text-gray-600">Restaurant: 6:30 AM - 10:30 PM</p>
                    <p className="text-gray-600">Spa: 9:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Follow Us</h2>
              <p className="text-gray-600 mb-6">
                Stay updated with our latest offers, events, and news by following us on social media.
              </p>
              
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full">
                  <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </a>
                <a href="#" className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full">
                  <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </a>
                <a href="#" className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full">
                  <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                  </svg>
                </a>
                <a href="#" className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full">
                  <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Location</h2>
          <div className="bg-white rounded-xl shadow-md p-4 h-[400px] overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.305935303!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1625687671319!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-2">What are your check-in and check-out times?</h3>
              <p className="text-gray-600">
                Our standard check-in time is 3:00 PM and check-out time is 12:00 PM. Early check-in and late check-out may be available upon request, subject to availability.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-2">Do you offer airport transportation?</h3>
              <p className="text-gray-600">
                Yes, we offer airport transportation services for an additional fee. Please contact our concierge at least 24 hours in advance to arrange this service.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-2">Is breakfast included in the room rate?</h3>
              <p className="text-gray-600">
                Breakfast is included in some of our room packages. Please check your specific reservation or contact us for more information.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-2">What is your cancellation policy?</h3>
              <p className="text-gray-600">
                Our standard cancellation policy allows free cancellation up to 24 hours before the scheduled check-in date. Cancellations made less than 24 hours before check-in may be subject to a one-night charge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 