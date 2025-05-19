import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SearchModal from '../common/SearchModal';
import WhatsAppButton from '../common/WhatsAppButton';
import { motion } from 'framer-motion';

const Layout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close search overlay when location changes
    setSearchOpen(false);
    // Scroll to top when navigating
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        scrolled={scrolled} 
        onOpenSearch={() => setSearchOpen(true)} 
      />
      <main className="flex-grow pt-16">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      
      {/* Overlay components */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* WhatsApp Button - fixed to bottom right */}
      <WhatsAppButton phoneNumber="+212675597187" message="Hello! I'm interested  luxury products at Luxe Maroc." />
    </div>
  );
};

export default Layout;