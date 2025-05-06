
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface LeadData {
  name: string; // Required to match database schema
  email: string;
  phone: string; // Required to match database schema
  source: string;
  leadMagnet?: string;
  metadata?: Record<string, any>;
}

export const submitLead = async (leadData: LeadData) => {
  try {
    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.phone) {
      throw new Error("Missing required fields: name, email, and phone are required");
    }
    
    // Insert a single lead object
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error details:", error);
      throw new Error(error.message);
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error submitting lead:', error);
    
    // Show a toast notification
    toast({
      title: "Error",
      description: "Failed to submit your information. Please try again.",
      variant: "destructive",
    });
    
    return { success: false, error: error.message };
  }
};

export const fetchLeads = async () => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data;
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return [];
  }
};
