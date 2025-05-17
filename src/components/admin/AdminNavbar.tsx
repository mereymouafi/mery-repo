import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Import icons
import { HomeIcon, ShoppingBagIcon, UserIcon, PhoneIcon, ArrowRightOnRectangleIcon, TagIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

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
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center mb-6 shadow-lg">
      <div className="flex items-center space-x-4">
        <Link to="/admin/orders" className="font-bold text-xl flex items-center hover:no-underline hover:opacity-100">
          <span className="text-luxury-gold">Maroc</span>
          <span className="text-white ml-1">Luxe</span>
          <span className="ml-3 text-gray-400 font-normal">Admin</span>
        </Link>
        <div className="hidden md:flex space-x-4 ml-8">
          <Link 
            to="/admin/orders" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/admin/orders') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            Orders
          </Link>
          <Link 
            to="/admin/categories" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/admin/categories') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <TagIcon className="h-4 w-4 inline mr-1" />
            Categories
          </Link>
          <Link 
            to="/admin/products" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/admin/products') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <ArchiveBoxIcon className="h-4 w-4 inline mr-1" />
            Products
          </Link>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center space-x-2 mr-6">
          <Link to="/" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
            <HomeIcon className="h-5 w-5 inline mr-1" />
            <span>Home</span>
          </Link>
          <Link to="/shop" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
            <ShoppingBagIcon className="h-5 w-5 inline mr-1" />
            <span>Shop</span>
          </Link>
          <Link to="/about" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
            <UserIcon className="h-5 w-5 inline mr-1" />
            <span>About</span>
          </Link>
          <Link to="/contact" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
            <PhoneIcon className="h-5 w-5 inline mr-1" />
            <span>Contact</span>
          </Link>
        </div>
        {user && (
          <div className="flex items-center space-x-4 border-l border-gray-700 pl-4">
            <span className="text-sm text-gray-300">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              aria-label="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
