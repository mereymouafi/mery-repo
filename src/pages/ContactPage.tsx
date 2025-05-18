import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Show success message
      setSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Luxe Maroc</title>
        <meta name="description" content="Get in touch with Luxe Maroc. Our team is here to assist you with any inquiries about our products or services." />
      </Helmet>

      {/* Page Header */}
      <section className="bg-luxury-cream py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-serif text-luxury-black text-center">Contact Us</h1>
        </div>
      </section>

      {/* Contact Information and Form */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Information */}
            <div className="lg:col-span-5">
              <h2 className="text-2xl font-serif text-luxury-black mb-6">Get in Touch</h2>
              <p className="text-luxury-gray mb-8">
                We're here to assist you with any inquiries about our products, services, or special orders. Feel free to reach out to us using the contact information below or by filling out the form.
              </p>
              
              <div className="space-y-6">
                
                <div className="flex items-start">
                  <Phone size={20} className="text-luxury-gold mr-4 mt-1" />
                  <div>
                    <h3 className="text-lg font-serif text-luxury-black mb-1">Call Us</h3>
                    <p className="text-luxury-gray">0675‑597187</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail size={20} className="text-luxury-gold mr-4 mt-1" />
                  <div>
                    <h3 className="text-lg font-serif text-luxury-black mb-1">Email Us</h3>
                    <p className="text-luxury-gray">info@luxemaroc.com</p>
                    <p className="text-luxury-gray">customercare@luxemaroc.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={20} className="text-luxury-gold mr-4 mt-1" />
                  <div>
                    <h3 className="text-lg font-serif text-luxury-black mb-1">Opening Hours</h3>
                    <p className="text-luxury-gray">Available 24/7</p>
                    <p className="text-luxury-gray">Shop anytime, 7 days a week, whenever it suits you.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-serif text-luxury-black mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-luxury-black text-white w-10 h-10 flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                    aria-label="Instagram"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-luxury-black text-white w-10 h-10 flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                    aria-label="Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-luxury-black text-white w-10 h-10 flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                    aria-label="Twitter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-gray-50 p-8">
                <h2 className="text-2xl font-serif text-luxury-black mb-6">Send Us a Message</h2>
                
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 mb-4">
                    <h3 className="text-lg font-medium mb-2">Thank you for your message!</h3>
                    <p>We have received your inquiry and will get back to you as soon as possible.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
                        {error}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-luxury-gray mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="luxury-input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-luxury-gray mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="luxury-input"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-luxury-gray mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="luxury-input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-luxury-gray mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="luxury-input"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="subject" className="block text-sm font-medium text-luxury-gray mb-1">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="luxury-input"
                      >
                        <option value="">Select a subject</option>
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Order Status">Order Status</option>
                        <option value="Returns">Returns</option>
                        <option value="Custom Order">Custom Order</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="message" className="block text-sm font-medium text-luxury-gray mb-1">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="luxury-input"
                        required
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <h2 className="text-2xl font-serif text-luxury-black text-center mb-8">Livraison Partout au Maroc</h2>
          
          <div className="bg-white p-4">
            <img 
              src="https://images.pexels.com/photos/1544420/pexels-photo-1544420.jpeg" 
              alt="Map of Luxe Maroc boutique location" 
              className="w-full h-auto"
            />
            <div className="text-center mt-6">
              <p className="text-luxury-black font-medium">Order online, receive at home.</p>
           
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;