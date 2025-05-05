
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
    
    // Send a test email using your verified domain
    const data = await resend.emails.send({
      from: "RoboQuant Academy <no-reply@updates.roboquant.ai>",
      to: ["ventos99@gmail.com"],
      subject: "Hello from Your Verified Domain",
      html: "<p>Congrats on sending your <strong>first email</strong> from your verified domain!</p>"
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test email sent successfully from verified domain!", 
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
        error: error.message || "An unknown error occurred" 
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
