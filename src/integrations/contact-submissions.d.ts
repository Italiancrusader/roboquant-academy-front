
// Type definitions for contact submissions

// Define the contact submission interface independently
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

// Extend the existing Database type in a way that won't cause conflicts
declare module '@/integrations/supabase/types' {
  interface Tables {
    contact_submissions: {
      Row: ContactSubmission;
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
