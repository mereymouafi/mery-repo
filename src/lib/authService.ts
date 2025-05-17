// Simple authentication service with hardcoded admin credentials
// In a production environment, you should use a more secure approach

export interface AuthUser {
  email: string;
  role: string;
}

// Using environment variables for admin credentials
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@marocluxe.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Maroc@Luxe2025!';

export async function signIn(email: string, password: string) {
  try {
    // Simple validation
    if (!email || !password) {
      return { user: null, error: 'Email and password are required' };
    }
    
    // Check against hardcoded credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Store authentication in localStorage
      localStorage.setItem('marocluxe_admin_auth', JSON.stringify({
        email,
        authenticated: true,
        timestamp: Date.now()
      }));
      
      return {
        user: {
          email,
          role: 'admin',
        },
        error: null,
      };
    }
    
    return { user: null, error: 'Invalid email or password' };
  } catch (error) {
    return { user: null, error: 'An unexpected error occurred' };
  }
}

export async function signOut() {
  try {
    // Remove authentication from localStorage
    localStorage.removeItem('marocluxe_admin_auth');
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Check if user is authenticated in localStorage
    const authData = localStorage.getItem('marocluxe_admin_auth');
    
    if (!authData) {
      return null;
    }
    
    const { email, authenticated, timestamp } = JSON.parse(authData);
    
    // Check if authentication is still valid (24 hour expiry)
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (!authenticated || Date.now() - timestamp > expiryTime) {
      localStorage.removeItem('marocluxe_admin_auth');
      return null;
    }
    
    return {
      email,
      role: 'admin',
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
