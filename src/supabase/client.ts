import { createClient } from '@supabase/supabase-js';

// These environment variables are set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anonymous Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle errors
export function handleError(error: any) {
  console.error('Supabase error:', error);
  return {
    error: error.message || 'An unknown error occurred',
  };
}

// Database schema types
export type Profile = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  subscription_status?: string;
  subscription_tier?: string;
  subscription_expires?: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  content?: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}; 