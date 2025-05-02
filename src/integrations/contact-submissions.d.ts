
// Define the contact submission interface
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// Properly augment the Database interface to avoid TypeScript errors
declare global {
  namespace Database {
    interface Tables {
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Omit<ContactSubmission, 'id' | 'created_at'>;
        Update: Partial<Omit<ContactSubmission, 'id' | 'created_at'>>;
      };
    }
  }
}

// This empty export ensures this file is treated as a module
export {};
