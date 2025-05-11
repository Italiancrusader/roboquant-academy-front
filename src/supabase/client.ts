
import { createClient } from '@supabase/supabase-js';

// Using hardcoded values from src/integrations/supabase/client.ts
// This ensures consistency across the application
const supabaseUrl = "https://gqnzsnzolqvsalyzbhmq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxbnpzbnpvbHF2c2FseXpiaG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NDM1NDAsImV4cCI6MjA2MTIxOTU0MH0.p2zZF0qAeMtXerm8f68E38ZGj2OYZ9t4Sqyu_oqyjMM";

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
