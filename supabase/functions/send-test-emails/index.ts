
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { purchaseConfirmationTemplate } from "../utils/email-templates-enhanced.ts";
import { generateOrderNumber, formatDate } from "../utils/emailUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Initialize Resend with API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(JSON.stringify({
        success: false,
        error: "API key not configured"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const resend = new Resend(resendApiKey);
    
    // Parse request body
    const { type = "purchase", email = "ventos99@gmail.com" } = await req.json();
    const results = [];
    
    console.log(`Sending ${type} email(s) to ${email}`);
    
    // Use your verified custom domain
    const fromEmail = "Roboquant <team@updates.roboquant.ai>";
    
    // Purchase Confirmation Test
    try {
      console.log("Sending purchase confirmation email...");
      const data = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `[TEST] RoboQuant Academy Purchase Confirmation`,
        html: purchaseConfirmationTemplate({
          orderNumber: generateOrderNumber(),
          customerName: "John Doe",
          customerEmail: email,
          courseTitle: "RoboQuant Academy Premium Course",
          courseCoverImage: "https://p4uhxduk6ms8wmoc.public.blob.vercel-storage.com/roboquant%20%281%29.pdf-QeaP5rnNKRjSPHBW03oXOJ7DveVz7Q.png",
          purchaseDate: formatDate(new Date()),
          purchaseAmount: 15000,
          currency: "USD"
        })
      });
      
      console.log("Purchase email sent, response:", data);
      
      results.push({
        type: "purchase",
        success: true,
        email_id: data.id
      });
    } catch (error) {
      console.error("Purchase email error:", error);
      results.push({
        type: "purchase",
        success: false,
        error: error.message || String(error)
      });
    }
    
    console.log("Email sending complete. Results:", results);
    
    return new Response(JSON.stringify({ 
      success: true,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error sending test emails:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
