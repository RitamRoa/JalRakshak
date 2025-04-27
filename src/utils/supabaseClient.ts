import { createClient } from '@supabase/supabase-js';
import type { Tables } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for environment variables and provide helpful error messages
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is missing. Please add it to your .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is missing. Please add it to your .env file.');
}

// Create the Supabase client with enhanced error handling
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'community-water-watch'
      }
    }
  }
);

// Database types
export type { Tables };

// Enhanced helper function to check Supabase configuration
export const checkSupabaseConnection = async () => {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabase
      .from('water_issues')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        isConfigured: false,
        error: `Failed to connect to Supabase: ${error.message}`
      };
    }

    console.log('Supabase connection test successful');
    return {
      isConfigured: true,
      error: null
    };
  } catch (err: any) {
    console.error('Unexpected error testing Supabase connection:', err);
    return {
      isConfigured: false,
      error: `Unexpected error connecting to Supabase: ${err.message}`
    };
  }
};

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};