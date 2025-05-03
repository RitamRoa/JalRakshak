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

// Initialize emergency notifications table by attempting to read from it
export const initEmergencyNotificationsTable = async () => {
  try {
    const { error } = await supabase
      .from('emergency_notifications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing emergency notifications:', error);
    }
  } catch (err) {
    console.error('Error initializing emergency notifications:', err);
  }
};

// Initialize upvotes table and add upvote_count to water_issues
export const initUpvotesSystem = async () => {
  try {
    // First check if upvote_count column exists in water_issues
    const { error: columnCheckError } = await supabase
      .from('water_issues')
      .select('upvote_count')
      .limit(1);

    if (columnCheckError) {
      console.log('Adding upvote_count column to water_issues...');
      await supabase.rpc('add_upvote_count_column');
    }

    // Check if upvotes table exists
    const { error: tableCheckError } = await supabase
      .from('issue_upvotes')
      .select('*')
      .limit(1);

    if (tableCheckError) {
      console.log('Creating issue_upvotes table...');
      await supabase.rpc('create_issue_upvotes_table');
    }
  } catch (err) {
    console.error('Error initializing upvotes system:', err);
  }
};

// Function to handle upvoting
export const toggleUpvote = async (issueId: string, userId: string) => {
  try {
    // Check if user has already upvoted
    const { data: existingUpvote } = await supabase
      .from('issue_upvotes')
      .select('*')
      .eq('issue_id', issueId)
      .eq('user_id', userId)
      .single();

    if (existingUpvote) {
      // Remove upvote
      await supabase
        .from('issue_upvotes')
        .delete()
        .eq('issue_id', issueId)
        .eq('user_id', userId);

      // Get current upvote count
      const { data: currentIssue } = await supabase
        .from('water_issues')
        .select('upvote_count')
        .eq('id', issueId)
        .single();

      // Decrease upvote count
      await supabase
        .from('water_issues')
        .update({ upvote_count: (currentIssue?.upvote_count || 1) - 1 })
        .eq('id', issueId);

      return false; // Indicates upvote was removed
    } else {
      // Add upvote
      await supabase
        .from('issue_upvotes')
        .insert([{ issue_id: issueId, user_id: userId }]);

      // Get current upvote count
      const { data: currentIssue } = await supabase
        .from('water_issues')
        .select('upvote_count')
        .eq('id', issueId)
        .single();

      // Increase upvote count
      await supabase
        .from('water_issues')
        .update({ upvote_count: (currentIssue?.upvote_count || 0) + 1 })
        .eq('id', issueId);

      return true; // Indicates upvote was added
    }
  } catch (err) {
    console.error('Error toggling upvote:', err);
    throw err;
  }
};

// Call initialization when the client is created
initEmergencyNotificationsTable();
initUpvotesSystem();