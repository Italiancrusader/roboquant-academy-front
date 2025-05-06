
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface LeadData {
  name: string; // Changed from optional to required to match database schema
  email: string;
  phone: string; // Changed from optional to required to match database schema
  source: string;
  leadMagnet?: string;
  metadata?: Record<string, any>;
}

export const submitLead = async (leadData: LeadData) => {
  try {
    // Insert a single lead object rather than an array
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData);
    
    if (error) throw new Error(error.message);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error submitting lead:', error);
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
