
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";
import { 
  qualifiedTemplate, 
  nonQualifiedTemplate, 
  reminderTemplate,
  educationalTemplate,
  specialOfferTemplate,
  reEngagementTemplate
} from "./email-templates.ts";

// Initialize Resend client
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, origin, accept",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface EmailRequest {
  emailType: "qualified" | "non-qualified" | "reminder" | "educational" | "special-offer" | "re-engagement";
  recipientId?: string;
  recipientEmail?: string;
  recipientName?: string;
  additionalData?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const { emailType, recipientId, recipientEmail, recipientName, additionalData = {} } = await req.json() as EmailRequest;
    
    let email = recipientEmail;
    let name = recipientName || "there";
    let userData = null;
    
    // If we have a recipientId but no email, fetch user data from the leads table
    if (recipientId && !recipientEmail) {
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('name, email')
        .eq('id', recipientId)
        .single();
        
      if (leadError) {
        throw new Error(`Error fetching lead data: ${leadError.message}`);
      }
      
      if (leadData) {
        email = leadData.email;
        name = leadData.name || name;
        userData = leadData;
      } else {
        throw new Error("No lead found with the provided ID");
      }
    }
    
    if (!email) {
      throw new Error("Recipient email is required");
    }
    
    console.log(`Sending ${emailType} email to ${email}`);
    
    // Select the appropriate template based on the email type
    let subject = "";
    let htmlContent = "";
    
    switch (emailType) {
      case "qualified":
        subject = "Next Steps: Schedule Your Strategy Call with RoboQuant Academy";
        htmlContent = qualifiedTemplate({
          firstName: name.split(' ')[0],
          ...additionalData
        });
        break;
        
      case "non-qualified":
        subject = "Your RoboQuant Academy Path Forward";
        htmlContent = nonQualifiedTemplate({
          firstName: name.split(' ')[0],
          ...additionalData
        });
        break;
        
      case "reminder":
        subject = "Don't Forget to Book Your Strategy Call";
        htmlContent = reminderTemplate({
          firstName: name.split(' ')[0],
          ...additionalData
        });
        break;
        
      case "educational":
        subject = additionalData.subject || "Trading Insights from RoboQuant Academy";
        htmlContent = educationalTemplate({
          firstName: name.split(' ')[0],
          lessonNumber: additionalData.lessonNumber || 1,
          lessonTitle: additionalData.lessonTitle || "Getting Started with Algorithmic Trading",
          lessonContent: additionalData.lessonContent || "",
          ...additionalData
        });
        break;
        
      case "special-offer":
        subject = "Limited-Time Offer Just for You";
        htmlContent = specialOfferTemplate({
          firstName: name.split(' ')[0],
          offerDetails: additionalData.offerDetails || {},
          expiryDate: additionalData.expiryDate || "",
          ...additionalData
        });
        break;
        
      case "re-engagement":
        subject = "We Miss You at RoboQuant Academy";
        htmlContent = reEngagementTemplate({
          firstName: name.split(' ')[0],
          ...additionalData
        });
        break;
        
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }
    
    // Send the email
    const emailResponse = await resend.emails.send({
      from: "RoboQuant Academy <team@roboquant.ai>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });
    
    // Log the email send for tracking
    await supabase
      .from('email_logs')
      .insert({
        recipient_email: email,
        recipient_name: name,
        email_type: emailType,
        subject: subject,
        status: 'sent',
        metadata: {
          resend_id: emailResponse.id,
          additional_data: additionalData
        }
      });
    
    return new Response(JSON.stringify({
      success: true,
      message: `${emailType} email sent successfully`,
      emailId: emailResponse.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
    
  } catch (error: any) {
    console.error(`Error sending email: ${error.message}`);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);
