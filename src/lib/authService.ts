import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export async function signIn(email: string, password: string) {
  try {
    // Simple validation
    if (!email || !password) {
      return { user: null, error: 'Email and password are required' };
    }
    
    // Use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error || !data.user) {
      return { user: null, error: error?.message || 'Invalid email or password' };
    }
    
    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        role: 'admin', // Assuming all authenticated users are admins
      },
      error: null,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Check current session with Supabase
    const { data } = await supabase.auth.getSession();
    
    if (!data.session || !data.session.user) {
      return null;
    }
    
    return {
      id: data.session.user.id,
      email: data.session.user.email || '',
      role: 'admin', // Assuming all authenticated users are admins
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
