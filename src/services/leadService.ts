
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
      try {
        const emailResult = await sendLeadMagnetEmail(leadData);
        
        if (!emailResult) {
          toast({
            title: "Thank You!",
            description: "Your information was saved, but there was an issue sending the email. We'll send your bot shortly.",
            variant: "default",
          });
          return true; // Still return true as the lead was saved
        }
      } catch (error) {
        console.error("Error sending lead magnet email, but lead was saved:", error);
        toast({
          title: "Thank You!",
          description: "Your information was saved. We'll send your bot to your email address shortly!",
          variant: "default",
        });
        return true; // Still return true as the lead was saved
      }
    } else {
      // For regular leads without lead magnets
      toast({
        title: "Thank You!",
        description: "Your information was submitted successfully. We'll be in touch soon!",
        variant: "default",
      });
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
    
    // Set a reasonable timeout for the function call using Promise.race instead of AbortController
    const timeoutPromise = new Promise<{data: null, error: {message: string}}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: null,
          error: { message: 'Function call timed out after 10 seconds' }
        });
      }, 10000); // 10 second timeout
    });
    
    // Call the edge function
    const functionPromise = supabase.functions.invoke("send-lead-magnet", {
      body: {
        name: leadData.name,
        email: leadData.email,
        leadMagnet: leadData.leadMagnet
      }
    }).catch(err => {
      console.error("Error invoking send-lead-magnet function:", err);
      // Return a structured error object similar to supabase error format
      return { data: null, error: { message: err.message } };
    });
    
    // Race between the actual call and the timeout
    const { data, error } = await Promise.race([functionPromise, timeoutPromise]);

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
      title: "Thank You!",
      description: "Your free MT5 bot source code has been sent to your email address!",
      variant: "default",
    });
    return true;
  } catch (error) {
    console.error("Error in sendLeadMagnetEmail:", error);
    return false;
  }
};
