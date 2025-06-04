import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { trackLead } from '@/utils/metaPixel';
import { trackLeadConversionsAPI } from '@/utils/metaConversionsApi';

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
    if (!leadData.name || leadData.name.trim() === '') {
      throw new Error("Name is required");
    }
    
    if (!leadData.email || !leadData.email.includes('@')) {
      throw new Error("Valid email is required");
    }
    
    if (!leadData.phone || leadData.phone.trim() === '') {
      throw new Error("Phone is required");
    }
    
    // Ensure source is provided
    if (!leadData.source || leadData.source.trim() === '') {
      throw new Error("Source is required");
    }
    
    // Using the new secure function to insert lead (bypasses RLS)
    const { data, error } = await supabase.rpc('insert_lead_service', {
      name: leadData.name.trim(),
      email: leadData.email.trim().toLowerCase(),
      phone: leadData.phone.trim(),
      source: leadData.source,
      lead_magnet: leadData.leadMagnet || null,
      metadata: leadData.metadata || null
    });
    
    if (error) {
      console.error("Supabase error details:", error);
      throw new Error(error.message);
    }
    
    console.log("Lead submitted successfully, ID:", data);
    
    // Track Meta Pixel Lead event
    trackLead({
      content_name: leadData.leadMagnet || 'Lead Capture',
      content_category: 'lead_generation'
    });

    // Track Meta Conversions API Lead event
    trackLeadConversionsAPI({
      userData: {
        email: leadData.email,
        firstName: leadData.name.split(' ')[0],
        lastName: leadData.name.split(' ').slice(1).join(' '),
      },
      contentName: leadData.leadMagnet || 'Lead Capture',
    }).catch(error => {
      console.error('Failed to send Lead Conversions API event:', error);
    });
    
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
