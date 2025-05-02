
// Type definitions for contact submissions
// This is a temporary solution until Supabase types are regenerated

import { Database } from './supabase/types';

// Extend the Database types with our new contact_submissions table
declare module '@/integrations/supabase/types' {
  interface Database {
    public: {
      Tables: {
        contact_submissions: {
          Row: {
            id: string;
            name: string;
            email: string;
            subject: string;
            message: string;
            created_at: string;
          };
          Insert: {
            id?: string;
            name: string;
            email: string;
            subject: string;
            message: string;
            created_at?: string;
          };
          Update: {
            id?: string;
            name?: string;
            email?: string;
            subject?: string;
            message?: string;
            created_at?: string;
          };
          Relationships: [];
        } & Database['public']['Tables'];
      } & Database['public']['Tables'];
    } & Database['public'];
  }
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}
