
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
    if (!leadData.name || !leadData.name.trim() === '') {
      throw new Error("Name is required");
    }
    
    if (!leadData.email || !leadData.email.includes('@')) {
      throw new Error("Valid email is required");
    }
    
    if (!leadData.phone) {
      throw new Error("Phone is required");
    }
    
    // Ensure source is provided
    if (!leadData.source) {
      throw new Error("Source is required");
    }
    
    // Create a clean lead object with only the fields we want to insert
    const cleanLead = {
      name: leadData.name.trim(),
      email: leadData.email.trim(),
      phone: leadData.phone.trim(),
      source: leadData.source,
      lead_magnet: leadData.leadMagnet,
      metadata: leadData.metadata
    };
    
    // Insert a single lead object
    const { data, error } = await supabase
      .from('leads')
      .insert(cleanLead)
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
      description: error.message || "Failed to submit your information. Please try again.",
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
