import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// These will be replaced with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
