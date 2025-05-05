
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { trackEvent } from "@/utils/googleAnalytics";

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  source: string;
  leadMagnet?: string;
}

export const submitLead = async (leadData: LeadData): Promise<boolean> => {
  try {
    console.log("Submitting lead:", leadData);
    
    // Save lead to Supabase
    const { error } = await supabase.from("leads").insert({
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      source: leadData.source,
      lead_magnet: leadData.leadMagnet,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving lead:", error);
      throw error;
    }

    // Track lead in analytics
    trackEvent("generate_lead", {
      event_category: "Conversion",
      event_label: leadData.source,
      lead_type: leadData.leadMagnet || "enrollment"
    });

    // If the lead is for a free bot, call the edge function to send the bot source code
    if (leadData.leadMagnet === "free_mt5_bot_source_code") {
      await sendLeadMagnetEmail(leadData);
    }

    return true;
  } catch (error) {
    console.error("Error in submitLead:", error);
    return false;
  }
};

// Send email with the lead magnet
const sendLeadMagnetEmail = async (leadData: LeadData): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke("send-lead-magnet", {
      body: {
        name: leadData.name,
        email: leadData.email,
        leadMagnet: leadData.leadMagnet
      }
    });

    if (error) {
      console.error("Error sending lead magnet email:", error);
      toast({
        title: "Email Delivery Issue",
        description: "There was a problem sending your free bot. Please contact support.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error in sendLeadMagnetEmail:", error);
  }
};
