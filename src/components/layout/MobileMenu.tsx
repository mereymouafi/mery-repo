import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[320px] max-w-[90vw] z-[999] transform transition-transform duration-300 ease-in-out shadow-lg ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] to-white" />
        
        {/* Decorative element - top right corner */}
        <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#D4AF37]/30 rounded-tl-3xl" />
        </div>
        
        {/* Decorative element - bottom left corner */}
        <div className="absolute bottom-0 left-0 w-32 h-32 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#D4AF37]/30 rounded-tr-3xl" />
        </div>
        
        {/* Content Container */}
        <div className="relative h-full flex flex-col items-center pt-16 pb-12 px-8">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center border border-[#D4AF37] group transition-all"
            aria-label="Close menu"
          >
            <X 
              size={18}
              className="text-[#D4AF37] group-hover:text-[#B8860B] transition-colors"
            />
          </button>

          {/* Logo */}
          <div className="mb-14">
            <div className="flex flex-col items-center">
              {/* Crown Icon */}
              <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                <path d="M20 0L24.7 8.5L34.1 5.5L30.6 15.5H9.4L5.9 5.5L15.3 8.5L20 0Z" fill="#D4AF37"/>
                <path d="M9 17.5H31V20.5C31 22.1569 29.6569 23.5 28 23.5H12C10.3431 23.5 9 22.1569 9 20.5V17.5Z" fill="#D4AF37"/>
              </svg>
              
              {/* Brand name */}
              <h1 className="font-serif text-2xl tracking-wider text-[#1A1A1A]">LUXE MAROC</h1>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="w-full flex flex-col items-center space-y-8">
            {['Home', 'Shop', 'About', 'Contact'].map((item) => (
              <Link
                key={item}
                to={`/${item === 'Home' ? '' : item.toLowerCase()}`}
                className="relative font-serif text-xl text-[#1A1A1A] tracking-wide hover:text-[#D4AF37] transition-colors group"
                onClick={onClose}
              >
                {item}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37] scale-0 group-hover:scale-100 transition-transform delay-150"></span>
              </Link>
            ))}
          </nav>
          
          {/* Decorative element - middle */}
          <div className="mt-auto w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
