import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import Logo from '../common/Logo';
import { CartContext } from '../../context/CartContext';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  scrolled: boolean;
  onOpenSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ scrolled, onOpenSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverItem, setHoverItem] = useState<string | null>(null);
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
      className={`fixed w-full z-[999] transition-all duration-500 ${
        scrolled ? 'bg-gradient-to-r from-white via-[#FCFAF5] to-white shadow-md py-1' : 'bg-gradient-to-r from-white via-[#FCFAF5] to-white py-3'
      }`}
    >
      <div className="container flex items-center justify-between relative">
        {/* Subtle decorative elements */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 border-t border-l border-luxury-gold/10 rounded-tl-lg hidden lg:block"></div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 border-t border-r border-luxury-gold/10 rounded-tr-lg hidden lg:block"></div>
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-luxury-black p-2 group relative overflow-hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="absolute inset-0 rounded-full bg-luxury-cream scale-0 group-hover:scale-100 transition-transform duration-300"></span>
          <span className="relative">
            {menuOpen ? <X size={24} className="group-hover:text-luxury-gold transition-colors duration-300" /> : <Menu size={24} className="group-hover:text-luxury-gold transition-colors duration-300" />}
          </span>
        </button>

        {/* Logo */}
        <div className="flex-1 lg:flex-initial text-center lg:text-left">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-12">
          {[
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' }
          ].map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              className="font-serif text-luxury-black text-lg relative group py-2"
              onMouseEnter={() => setHoverItem(item.name)}
              onMouseLeave={() => setHoverItem(null)}
            >
              {/* Hover background effect */}
              <span className="absolute inset-0 w-full h-full bg-luxury-cream/20 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 rounded-sm transition-all duration-300"></span>
              
              {/* Main text with animation */}
              <span className="relative z-10 inline-block transform group-hover:-translate-y-0.5 transition-transform duration-300">
                {item.name}
              </span>
              
              {/* Decorative underline */}
              <span className="absolute bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-luxury-gold/0 via-luxury-gold to-luxury-gold/0 group-hover:w-full transition-all duration-500 ease-out"></span>
              
              {/* Decorative dot */}
              <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-luxury-gold scale-0 transition-transform duration-300 delay-200 ${hoverItem === item.name ? 'scale-100' : ''}`}></span>
            </Link>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center space-x-5">
          <button
            onClick={onOpenSearch}
            className="relative group p-2 -m-2"
            aria-label="Search"
          >
            {/* Hover effect circle */}
            <span className="absolute inset-0 rounded-full bg-luxury-cream scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            
            {/* Icon with animation */}
            <Search 
              size={20} 
              className="text-luxury-black group-hover:text-luxury-gold transform group-hover:scale-110 transition-all duration-300 relative z-10" 
            />
            
            {/* Subtle glow effect */}
            <span className="absolute inset-0 rounded-full bg-luxury-gold/5 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
          </button>
          
          <button
            onClick={handleCartClick}
            className="relative group p-2 -m-2"
            aria-label="Shopping bag"
          >
            {/* Hover effect circle */}
            <span className="absolute inset-0 rounded-full bg-luxury-cream scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            
            {/* Icon with animation */}
            <ShoppingBag 
              size={20} 
              className="text-luxury-black group-hover:text-luxury-gold transform group-hover:scale-110 transition-all duration-300 relative z-10" 
            />
            
            {/* Subtle glow effect */}
            <span className="absolute inset-0 rounded-full bg-luxury-gold/5 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
            
            {/* Cart count badge */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-luxury-gold-light to-luxury-gold text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium shadow-sm z-20 ring-1 ring-white/30">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Decorative bottom border with gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent"></div>

      {/* Luxurious Mobile Navigation Menu */}
      <MobileMenu isOpen={menuOpen} onClose={toggleMenu} />
    </header>
  );
};

export default Header;