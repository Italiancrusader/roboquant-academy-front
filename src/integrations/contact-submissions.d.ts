
// Type definitions for contact submissions

// Extend the Database types with our contact_submissions table
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
        };
      }
    }
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
