
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
      
      toast({
        title: "Submission Error",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    // Track lead in analytics
    trackEvent("generate_lead", {
      event_category: "Conversion",
      event_label: leadData.source,
      lead_type: leadData.leadMagnet || "enrollment"
    });

    // If the lead is for a free bot, call the edge function to send the bot source code
    if (leadData.leadMagnet === "free_mt5_bot_source_code") {
      const emailResult = await sendLeadMagnetEmail(leadData);
      
      if (!emailResult) {
        toast({
          title: "Bot Delivery Info",
          description: "Your information was saved but there was an issue sending the email. Our team has been notified and will send your bot soon.",
          variant: "default",
        });
        return true; // Still return true as the lead was saved
      }
    }

    return true;
  } catch (error) {
    console.error("Error in submitLead:", error);
    toast({
      title: "Submission Error",
      description: "There was an error submitting your information. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

// Send email with the lead magnet
const sendLeadMagnetEmail = async (leadData: LeadData): Promise<boolean> => {
  try {
    console.log("Sending lead magnet email to:", leadData.email);
    
    const { data, error } = await supabase.functions.invoke("send-lead-magnet", {
      body: {
        name: leadData.name,
        email: leadData.email,
        leadMagnet: leadData.leadMagnet
      }
    });

    if (error) {
      console.error("Error sending lead magnet email:", error);
      return false;
    } 
    
    if (!data?.success) {
      console.error("Function returned unsuccessful response:", data);
      return false;
    }
    
    console.log("Successfully sent lead magnet email");
    toast({
      title: "Success!",
      description: "Your free MT5 bot source code has been sent to your email address!",
      variant: "default",
    });
    return true;
  } catch (error) {
    console.error("Error in sendLeadMagnetEmail:", error);
    return false;
  }
};
