import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, User, Heart } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  // State for staggered animation sequence
  const [animationReady, setAnimationReady] = useState(false);
  
  // Manage animation sequence when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      // Delay animation start to sync with menu opening
      const timer = setTimeout(() => setAnimationReady(true), 300);
      return () => clearTimeout(timer);
    } else {
      setAnimationReady(false);
    }
  }, [isOpen]);
  return (
    <>
      {/* Backdrop with blur effect and animated particles */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[998] transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        {/* Floating particles animation - controlled by animationReady */}
        {isOpen && animationReady && Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#D4AF37]/30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Menu Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[320px] max-w-[90vw] z-[999] transform transition-all duration-500 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0 rounded-r-3xl' : '-translate-x-full'
        }`}
      >
        {/* Background with enhanced gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] to-white overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-40 h-40 border border-[#D4AF37] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `scale(${0.5 + Math.random() * 1.5})`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Decorative element - top right corner (now top left) */}
        <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#D4AF37]/30 rounded-tr-3xl transition-all duration-1000 animate-pulse-subtle" />
          <div className="absolute top-5 left-5 w-8 h-8 border-t border-l border-[#D4AF37]/20 rounded-tr-xl animate-spin-slow" />
        </div>
        
        {/* Decorative element - bottom right corner */}
        <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#D4AF37]/30 rounded-tl-3xl animate-pulse-subtle" />
          <div className="absolute bottom-5 right-5 w-8 h-8 border-b border-r border-[#D4AF37]/20 rounded-tl-xl animate-spin-slow-reverse" />
        </div>
        
        {/* Additional decorative element - middle left */}
        <div className="absolute top-1/2 -translate-y-1/2 left-3 w-12 h-32">
          <div className="absolute w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#D4AF37]/60 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-[#D4AF37]/60 animate-pulse delay-300" />
            <div className="w-1 h-1 rounded-full bg-[#D4AF37]/60 animate-pulse delay-600" />
          </div>
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

          {/* Logo with entrance animation */}
          <div className="mb-14 transition-all duration-700 transform origin-top animate-fade-in-down">
            <div className="flex flex-col items-center relative">
              {/* Animated glow effect */}
              <div className="absolute -inset-2 bg-[#D4AF37]/10 rounded-full blur-lg animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Crown Icon with hover animation */}
              <div className="group relative">
                <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg" 
                  className="mb-2 transition-transform duration-500 hover:scale-110 cursor-pointer relative z-10">
                  <path d="M20 0L24.7 8.5L34.1 5.5L30.6 15.5H9.4L5.9 5.5L15.3 8.5L20 0Z" fill="#D4AF37" className="transition-all duration-300 hover:fill-[#B8860B]"/>
                  <path d="M9 17.5H31V20.5C31 22.1569 29.6569 23.5 28 23.5H12C10.3431 23.5 9 22.1569 9 20.5V17.5Z" fill="#D4AF37" className="transition-all duration-300 hover:fill-[#B8860B]"/>
                </svg>
                {/* Subtle sparkle effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-sparkle"></div>
              </div>
              
              {/* Brand name with animated underline */}
              <h1 className="font-serif text-2xl tracking-wider text-[#1A1A1A] relative group">
                <span className="relative inline-block">LUXE MAROC</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 group-hover:w-full transition-all duration-700 ease-in-out delay-100"></span>
              </h1>
            </div>
          </div>
          
          {/* Navigation Links with staggered animations - using animationReady state */}
          <nav className="w-full">
            <div className="flex flex-col items-center space-y-3 px-2">
            {['Home', 'Shop', 'About', 'Contact'].map((item, index) => (
              <Link
                key={item}
                to={`/${item === 'Home' ? '' : item.toLowerCase()}`}
                className={`relative font-serif text-base text-[#1A1A1A] tracking-wide hover:text-[#D4AF37] transition-all duration-300 group py-1 px-3 overflow-hidden ${animationReady ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${300 + index * 100}ms` }}
                onClick={onClose}
              >
                {/* Menu item background animation */}
                <span className="absolute inset-0 w-full h-full bg-[#D4AF37]/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-lg"></span>
                
                {/* Text with icon */}
                <span className="relative flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-300">
                  <span className="relative">{item}</span>
                  
                  {/* Icon based on menu item */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#D4AF37] absolute left-full ml-1">
                    {item === 'Shop' && <ShoppingBag size={14} />}
                    {item === 'Home' && <span className="text-xs">★</span>}
                    {item === 'About' && <User size={14} />}
                    {item === 'Contact' && <Heart size={14} />}
                  </span>
                </span>
                
                {/* Animated bottom border effect */}
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 transition-all duration-500 group-hover:w-4/5"></span>
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37] scale-0 group-hover:scale-100 transition-transform delay-300"></span>
              </Link>
            ))}
            </div>
          </nav>
          
          {/* Enhanced decorative element - middle */}
          <div className="mt-auto pt-10 flex flex-col items-center">
            <div className="w-36 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent animate-pulse-slow"></div>
            
            {/* Animated social icons - controlled by animationReady */}
            <div className="mt-8 flex items-center justify-center gap-6">
              {['✉', '♥', '♦'].map((icon, index) => (
                <div 
                  key={index} 
                  className={`w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-all duration-300 ${animationReady ? 'animate-fade-in' : 'opacity-0'}`}
                  style={{ animationDelay: `${1000 + index * 200}ms` }}
                >
                  <span className="text-[#D4AF37] text-sm hover:scale-125 transition-transform duration-300">{icon}</span>
                </div>
              ))}
            </div>
            
            {/* Animated quote - controlled by animationReady */}
            <p className={`mt-6 text-center text-xs italic text-[#1A1A1A]/60 max-w-[200px] ${animationReady ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1600ms' }}>
              "Elevating luxury experiences with Moroccan elegance"  
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;

// Add to your global CSS or tailwind config
// @keyframes float {
//   0%, 100% { transform: translateY(0) rotate(0); }
//   50% { transform: translateY(-10px) rotate(5deg); }
// }
// @keyframes sparkle {
//   0%, 100% { opacity: 0; transform: scale(0); }
//   50% { opacity: 1; transform: scale(1); }
// }
// @keyframes pulse-subtle {
//   0%, 100% { opacity: 0.3; }
//   50% { opacity: 0.6; }
// }
// @keyframes spin-slow {
//   0% { transform: rotate(0); }
//   100% { transform: rotate(360deg); }
// }
// @keyframes spin-slow-reverse {
//   0% { transform: rotate(0); }
//   100% { transform: rotate(-360deg); }
// }
// @keyframes fade-in-down {
//   0% { opacity: 0; transform: translateY(-20px); }
//   100% { opacity: 1; transform: translateY(0); }
// }
// @keyframes fade-in-up {
//   0% { opacity: 0; transform: translateY(20px); }
//   100% { opacity: 1; transform: translateY(0); }
// }
// @keyframes fade-in {
//   0% { opacity: 0; }
//   100% { opacity: 1; }
// }
