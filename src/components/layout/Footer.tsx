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
          <div className="flex flex-col space-y-4 items-center md:items-start">
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
          <div className="text-center md:text-left">
            <h3 className="text-luxury-gold text-lg font-serif mb-6">Quick Links</h3>
            <ul className="flex flex-row flex-wrap justify-center md:justify-start md:flex-col md:gap-y-3 md:gap-x-0">
              <li className="flex items-center">
                <Link to="/shop" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">Shop</Link>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Link to="/about" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">About Us</Link>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Link to="/contact" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">Contact</Link>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Link to="/shop/new-arrivals" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">New Arrivals</Link>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Link to="/shop/best-sellers" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">Best Sellers</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="text-center md:text-left">
            <h3 className="text-luxury-gold text-lg font-serif mb-6">Customer Service</h3>
            <ul className="flex flex-row flex-wrap justify-center md:justify-start md:flex-col md:gap-y-3 md:gap-x-0">
              <li className="flex items-center">
                <Link to="/shipping" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">Shipping & Returns</Link>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Link to="/faq" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">FAQ</Link>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Link to="/privacy-policy" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">Privacy Policy</Link>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Link to="/terms" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">Terms & Conditions</Link>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Link to="/order-tracking" className="text-gray-300 hover:text-luxury-gold transition-colors inline-block border-b border-transparent hover:border-luxury-gold/30">Order Tracking</Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h3 className="text-luxury-gold text-lg font-serif mb-6">Contact Us</h3>
            <ul className="flex flex-row flex-wrap justify-center md:justify-start md:flex-col md:space-y-4 md:gap-x-0">
              
              <li className="flex items-center">
                <Phone size={18} className="text-luxury-gold mr-2 flex-shrink-0" />
                <a href="tel:0675-597187" className="text-gray-300 hover:text-luxury-gold transition-colors border-b border-transparent hover:border-luxury-gold/30">0675‑597187</a>
                <span className="h-4 w-px bg-luxury-gold mx-3 md:hidden"></span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-luxury-gold mr-2 flex-shrink-0" />
                <a href="mailto:info@luxemaroc.com" className="text-gray-300 hover:text-luxury-gold transition-colors border-b border-transparent hover:border-luxury-gold/30">info@luxemaroc.com</a>
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