import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { HomeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import NetworkBackground from '../components/StarryBackground';
import BorderStar from '../components/BorderStar';

// Admin Account Setup - Handles admin user invitation flow
const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Reference to the container div for the border star
  const containerRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  
  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for access token on page load and verify user
  useEffect(() => {
    const handleTokenFromUrl = async () => {
      try {
        // Extract the access token from the URL hash
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1) // Remove the # character
        );
        const accessToken = hashParams.get('access_token');

        if (!accessToken) {
          setError('No access token found. Please check your invitation link.');
          setLoading(false);
          return;
        }

        // Verify the user is logged in using the token
        const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

        if (userError || !user) {
          setError(userError?.message || 'Failed to authenticate user. Please try again.');
          setLoading(false);
          return;
        }

        // User is authenticated
        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleTokenFromUrl();
  }, []);

  // Handle password update submission
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password should be at least 8 characters long.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      
      if (updateError) {
        setError(updateError.message || 'Failed to update password. Please try again.');
        setLoading(false);
        return;
      }
      
      // Password updated successfully
      setSuccess('Password set successfully! Redirecting to login page...');
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/admin/login', { 
          state: { message: 'Password created successfully. You can now log in with your new credentials.' } 
        });
      }, 2000);
    } catch (err) {
      console.error('Error updating password:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Professional Network Background */}
      <NetworkBackground />
      
      {/* Simple navigation back to main site */}
      <div className="absolute top-4 left-4 z-10">
        <Link to="/" className="flex items-center text-white hover:text-blue-300 transition-colors">
          <HomeIcon className="h-5 w-5 mr-1" />
          <span>Back to Site</span>
        </Link>
      </div>
      
      <div className="flex-grow flex items-center justify-center z-10">
        <Helmet>
          <title>Complete Account Setup | Maroc Luxe Admin</title>
        </Helmet>
        
        {/* Login container with blurry background */}
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="w-[600px] max-w-[90vw] relative"
        >
          {/* Two moving stars along the border in opposite directions */}
          <BorderStar containerRef={containerRef} direction="clockwise" color="#5EEAD4" />
          <BorderStar containerRef={containerRef} direction="counterclockwise" color="#FFFFFF" />
          
          {/* Blurry background container */}
          <div className="absolute inset-0 bg-gray-800/30 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-xl z-0"></div>
          
          {/* Logo avatar */}
          <div className="relative z-10">
            <div className="mx-auto -mt-12 w-24 h-24 rounded-full bg-blue-600/80 backdrop-blur-sm flex items-center justify-center shadow-lg border-4 border-gray-800/50">
              <LockClosedIcon className="h-12 w-12 text-white" aria-hidden="true" />
            </div>
          </div>
          
          {/* Form content */}
          <div className="relative z-10 px-8 py-10">
            <h2 className="text-center text-3xl font-extrabold text-white">
              Complete Your Account Setup
            </h2>
            <p className="mt-2 text-center text-sm text-blue-200">
              Please set a password for your admin account
            </p>
            
            {/* Single title bar */}
            <div className="mt-6 border-b border-gray-700">
              <div className="flex-1 py-2 text-center font-medium text-sm text-blue-400 border-b-2 border-blue-400">
                Account Setup
              </div>
            </div>
        
            {/* Success message with animation */}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-green-400 text-sm p-2 bg-green-400/10 border border-green-400/20 rounded-md text-center"
              >
                {success}
              </motion.div>
            )}
            
            {/* Error message with animation */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-red-400 text-sm p-2 bg-red-400/10 border border-red-400/20 rounded-md text-center"
              >
                {error}
              </motion.div>
            )}
            
            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200/20 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-blue-200">Verifying your account...</p>
              </div>
            ) : isAuthenticated ? (
              <form className="mt-4 space-y-6" onSubmit={handleSetPassword}>
                <div className="rounded-md shadow-sm space-y-4">
                  {/* Password field with label and toggle visibility */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-400"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm Password field */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-blue-200 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-400"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                  {loading ? 'Setting password...' : 'Set Password'}
                </button>
              </div>
            </form>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthCallback;
