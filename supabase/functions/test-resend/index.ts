
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Resend with the API key from environment variables
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    // Send a test email
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["ventos99@gmail.com"],
      subject: "Hello World",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>"
    });
    
    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test email sent successfully!", 
        data 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
