import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import Logo from '../common/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-luxury-black text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="flex flex-col space-y-4">
            <div className="mb-4">
              <Logo variant="white" />
            </div>
            <p className="text-gray-300 text-sm">
              Luxe Maroc offers the finest luxury products, crafted with exceptional quality and attention to detail.
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-luxury-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-luxury-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-luxury-gold transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-luxury-gold text-lg font-serif mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-luxury-gold transition-colors">Shop</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-luxury-gold transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-luxury-gold transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/shop/new-arrivals" className="text-gray-300 hover:text-luxury-gold transition-colors">New Arrivals</Link>
              </li>
              <li>
                <Link to="/shop/best-sellers" className="text-gray-300 hover:text-luxury-gold transition-colors">Best Sellers</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-luxury-gold text-lg font-serif mb-6">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-luxury-gold transition-colors">Shipping & Returns</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-luxury-gold transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-luxury-gold transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-luxury-gold transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/order-tracking" className="text-gray-300 hover:text-luxury-gold transition-colors">Order Tracking</Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-luxury-gold text-lg font-serif mb-6">Contact Us</h3>
            <ul className="space-y-4">
              
              <li className="flex items-center">
                <Phone size={18} className="text-luxury-gold mr-2 flex-shrink-0" />
                <a href="tel:0675-597187" className="text-gray-300 hover:text-luxury-gold transition-colors">0675‑597187</a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-luxury-gold mr-2 flex-shrink-0" />
                <a href="mailto:info@luxemaroc.com" className="text-gray-300 hover:text-luxury-gold transition-colors">info@luxemaroc.com</a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white text-sm font-medium mb-2">Newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="py-2 px-3 w-full bg-luxury-gray text-white border-0 focus:ring-1 focus:ring-luxury-gold" 
                />
                <button className="bg-luxury-gold text-luxury-black px-4 py-2 hover:bg-luxury-gold-light transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Luxe Maroc. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;