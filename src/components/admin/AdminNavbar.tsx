import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Import icons
import { HomeIcon, ShoppingBagIcon, UserIcon, PhoneIcon, ArrowRightOnRectangleIcon, TagIcon, ArchiveBoxIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const AdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { success } = await logout();
      if (success) {
        navigate('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <>
      {/* Gold accent line at the very top */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div>
      
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex flex-col md:flex-row items-center mb-6 shadow-xl relative">
        {/* Decorative gold corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400 opacity-50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400 opacity-50"></div>
        
        <div className="flex items-center space-x-4 mb-3 md:mb-0">
          <Link to="/admin/orders" className="font-serif text-xl flex items-center hover:no-underline hover:opacity-100 group relative">
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent font-bold">Maroc</span>
            <span className="text-white ml-1 font-bold">Luxe</span>
            <span className="ml-3 text-amber-200 font-light tracking-wider">Admin</span>
            
            {/* Subtle underline animation */}
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-amber-400 to-amber-300 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
          <div className="flex space-x-3 md:space-x-6">
            <Link 
              to="/admin/orders" 
              className={`px-3 py-2 rounded-sm text-sm font-medium transition-all duration-300 border-b-2 ${isActive('/admin/orders') ? 'border-amber-400 text-amber-200' : 'border-transparent text-gray-300 hover:text-amber-100 hover:border-amber-300'}`}
            >
              Orders
            </Link>
            <Link 
              to="/admin/categories" 
              className={`px-3 py-2 rounded-sm text-sm font-medium transition-all duration-300 border-b-2 ${isActive('/admin/categories') ? 'border-amber-400 text-amber-200' : 'border-transparent text-gray-300 hover:text-amber-100 hover:border-amber-300'}`}
            >
              <TagIcon className="h-4 w-4 inline mr-1" />
              Categories
            </Link>
            <Link 
              to="/admin/products" 
              className={`px-3 py-2 rounded-sm text-sm font-medium transition-all duration-300 border-b-2 ${isActive('/admin/products') ? 'border-amber-400 text-amber-200' : 'border-transparent text-gray-300 hover:text-amber-100 hover:border-amber-300'}`}
            >
              <ArchiveBoxIcon className="h-4 w-4 inline mr-1" />
              Products
            </Link>
            <Link 
              to="/admin/brands" 
              className={`px-3 py-2 rounded-sm text-sm font-medium transition-all duration-300 border-b-2 ${isActive('/admin/brands') ? 'border-amber-400 text-amber-200' : 'border-transparent text-gray-300 hover:text-amber-100 hover:border-amber-300'}`}
            >
              <BuildingStorefrontIcon className="h-4 w-4 inline mr-1" />
              Brands
            </Link>
          </div>
          
          <div className="flex space-x-3 md:space-x-4">
            <Link to="/" className="text-gray-300 hover:text-amber-200 px-3 py-2 text-sm font-medium transition-colors duration-200 border-b border-transparent hover:border-amber-400">
              <HomeIcon className="h-5 w-5 inline mr-1" />
              <span className="hidden md:inline">Home</span>
            </Link>
            <Link to="/shop" className="text-gray-300 hover:text-amber-200 px-3 py-2 text-sm font-medium transition-colors duration-200 border-b border-transparent hover:border-amber-400">
              <ShoppingBagIcon className="h-5 w-5 inline mr-1" />
              <span className="hidden md:inline">Shop</span>
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-amber-200 px-3 py-2 text-sm font-medium transition-colors duration-200 border-b border-transparent hover:border-amber-400">
              <UserIcon className="h-5 w-5 inline mr-1" />
              <span className="hidden md:inline">About</span>
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-amber-200 px-3 py-2 text-sm font-medium transition-colors duration-200 border-b border-transparent hover:border-amber-400">
              <PhoneIcon className="h-5 w-5 inline mr-1" />
              <span className="hidden md:inline">Contact</span>
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4 mt-2 md:mt-0 md:ml-4 border-t md:border-t-0 md:border-l border-amber-900/30 pt-2 md:pt-0 md:pl-4">
              <span className="text-sm text-amber-100/70">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-4 py-2 rounded-sm text-sm font-medium transition-all duration-200 flex items-center shadow-md"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;
