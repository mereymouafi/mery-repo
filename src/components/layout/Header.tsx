import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import Logo from '../common/Logo';
import { CartContext } from '../../context/CartContext';

interface HeaderProps {
  scrolled: boolean;
  onOpenSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ scrolled, onOpenSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useContext(CartContext);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <header 
      className={`fixed w-full z-[999] transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm py-1' : 'bg-white py-2'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-luxury-black p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <div className="flex-1 lg:flex-initial text-center lg:text-left">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-10">
          <Link to="/" className="text-luxury-black text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.9)] hover:text-luxury-gold hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.7)] transition-all">
            Home
          </Link>
          <Link to="/shop" className="text-luxury-black text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.9)] hover:text-luxury-gold hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.7)] transition-all">
            Shop
          </Link>
          <Link to="/about" className="text-luxury-black text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.9)] hover:text-luxury-gold hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.7)] transition-all">
            About
          </Link>
          <Link to="/contact" className="text-luxury-black text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.9)] hover:text-luxury-gold hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.7)] transition-all">
            Contact
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenSearch}
            className="text-luxury-black hover:text-luxury-gold transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button
            onClick={handleCartClick}
            className="text-luxury-black hover:text-luxury-gold transition-colors relative"
            aria-label="Shopping bag"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-luxury-gold text-luxury-black w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden`}
      >
        <div className="container h-full flex flex-col pt-20 pb-6">
          <nav className="flex flex-col space-y-6 text-center text-xl font-serif">
            <Link 
              to="/" 
              className="py-4 border-b border-gray-100 text-luxury-black text-2xl drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] hover:text-luxury-gold hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.7)] transition-all"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className="py-4 border-b border-gray-100 text-luxury-black text-2xl drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] hover:text-luxury-gold hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.7)] transition-all"
              onClick={toggleMenu}
            >
              Shop
            </Link>
            <Link 
              to="/about" 
              className="py-4 border-b border-gray-100 text-luxury-black text-2xl drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] hover:text-luxury-gold hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.7)] transition-all"
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="py-4 border-b border-gray-100 text-luxury-black text-2xl drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] hover:text-luxury-gold hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.7)] transition-all"
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;