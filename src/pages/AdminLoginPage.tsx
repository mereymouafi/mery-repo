import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HomeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import NetworkBackground from '../components/StarryBackground';
import BorderStar from '../components/BorderStar';
import { supabase } from '../lib/supabase';

const AdminLoginPage: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Reference to the container div for the border star
  const containerRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  
  // Animation on mount
  useEffect(() => {
    setMounted(true);
    
    // Check if email is saved in localStorage
    const savedEmail = localStorage.getItem('admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Reset form when changing tabs
  useEffect(() => {
    setError(null);
    setSuccess(null);
    if (activeTab === 'signup') {
      setConfirmPassword('');
    }
  }, [activeTab]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setError(error.message || 'Invalid email or password');
        return;
      }
      
      // Save email to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('admin_email', email);
      } else {
        localStorage.removeItem('admin_email');
      }
      
      setSuccess('Successfully signed in!');
      
      // Redirect to admin dashboard on successful login
      setTimeout(() => {
        navigate('/admin/orders');
      }, 1500);
      
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        setError(error.message || 'Registration failed');
        return;
      }
      
      setSuccess('Registration successful! Please check your email for verification.');
      
      // Switch to signin tab after successful registration
      setTimeout(() => {
        setActiveTab('signin');
      }, 2000);
      
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Registration error:', err);
    } finally {
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
          <title>{activeTab === 'signin' ? 'Sign In' : 'Sign Up'} | Maroc Luxe</title>
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
              {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="mt-2 text-center text-sm text-blue-200">
              {activeTab === 'signin' 
                ? 'Sign in to access your account' 
                : 'Create a new account to get started'}
            </p>
            
            {/* Tabs */}
            <div className="mt-6 flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 text-center font-medium text-sm ${
                  activeTab === 'signin'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 text-center font-medium text-sm ${
                  activeTab === 'signup'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Sign Up
              </button>
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
            
            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form className="mt-4 space-y-6" onSubmit={handleSignIn}>
                <div className="rounded-md shadow-sm space-y-4">
                  {/* Email field with label */}
                  <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-blue-200 mb-1">Email address</label>
                    <div className="relative">
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-400"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Password field with label and toggle visibility */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
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
                </div>
                
                {/* Remember me checkbox */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 bg-gray-700 rounded"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-200">
                      Remember me
                    </label>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form className="mt-4 space-y-6" onSubmit={handleSignUp}>
                <div className="rounded-md shadow-sm space-y-4">
                  {/* Email field with label */}
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-blue-200 mb-1">Email address</label>
                    <div className="relative">
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-400"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Password field */}
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-400"
                        placeholder="Create a password"
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
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
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
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
