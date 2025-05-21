
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
} from "../survey-emails/email-templates.ts";

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

interface EmailTestRequest {
  emailType: string;
  recipientEmail: string;
  recipientName?: string;
  additionalData?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const { emailType, recipientEmail, recipientName = "Test User", additionalData = {} } = await req.json() as EmailTestRequest;
    
    if (!recipientEmail) {
      throw new Error("Recipient email is required");
    }
    
    if (!emailType) {
      throw new Error("Email type is required");
    }
    
    console.log(`Sending test ${emailType} email to ${recipientEmail}`);
    
    // Select the appropriate template based on the email type
    let subject = `[TEST] `;
    let htmlContent = "";
    const firstName = recipientName.split(' ')[0];
    
    switch (emailType) {
      case "qualified":
        subject += "Next Steps: Schedule Your Strategy Call with RoboQuant Academy";
        htmlContent = qualifiedTemplate({
          firstName,
          ...additionalData
        });
        break;
        
      case "non-qualified":
        subject += "Your RoboQuant Academy Path Forward";
        htmlContent = nonQualifiedTemplate({
          firstName,
          ...additionalData
        });
        break;
        
      case "reminder":
        subject += "Don't Forget to Book Your Strategy Call";
        htmlContent = reminderTemplate({
          firstName,
          ...additionalData
        });
        break;
        
      case "educational":
        let lessonNumber = additionalData.lessonNumber || 1;
        let lessonTitle = additionalData.lessonTitle || "Getting Started with Algorithmic Trading";
        subject += `Trading Insights #${lessonNumber}: ${lessonTitle}`;
        htmlContent = educationalTemplate({
          firstName,
          lessonNumber,
          lessonTitle,
          lessonContent: additionalData.lessonContent || "This is sample lesson content for testing purposes.",
          ...additionalData
        });
        break;
        
      case "special-offer":
        subject += "Limited-Time Offer Just for You";
        htmlContent = specialOfferTemplate({
          firstName,
          offerDetails: additionalData.offerDetails || {
            discount: "25%",
            originalPrice: "$2,000",
            discountedPrice: "$1,500"
          },
          expiryDate: additionalData.expiryDate || "May 30, 2025",
          ...additionalData
        });
        break;
        
      case "re-engagement":
        subject += "We Miss You at RoboQuant Academy";
        htmlContent = reEngagementTemplate({
          firstName,
          ...additionalData
        });
        break;
        
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }
    
    // Send the email
    const emailResponse = await resend.emails.send({
      from: "RoboQuant Academy <team@roboquant.ai>",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });
    
    // Log the email send for tracking
    await supabase
      .from('email_logs')
      .insert({
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        email_type: `test-${emailType}`,
        subject: subject,
        status: 'sent',
        metadata: {
          resend_id: emailResponse.id,
          test: true,
          additional_data: additionalData
        }
      });
    
    return new Response(JSON.stringify({
      success: true,
      message: `Test ${emailType} email sent successfully`,
      emailId: emailResponse.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
    
  } catch (error: any) {
    console.error(`Error sending test email: ${error.message}`);
    
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
