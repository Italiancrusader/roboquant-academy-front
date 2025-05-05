
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { 
  purchaseConfirmationTemplate, 
  courseCompletionEnhancedTemplate,
  abandonedCartTemplate,
  reEngagementTemplate
} from "../utils/email-templates-enhanced.ts";
import { generateOrderNumber, formatDate } from "../utils/emailUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

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
    const { type = "all", email = "ventos99@gmail.com" } = await req.json();
    const results = [];
    
    console.log(`Sending ${type} email(s) to ${email}`);
    
    // Purchase Confirmation Test
    if (type === "purchase" || type === "all") {
      try {
        console.log("Sending purchase confirmation email...");
        const data = await resend.emails.send({
          from: "RoboQuant Academy <info@roboquant.ai>",
          to: [email],
          subject: `[TEST] RoboQuant Academy Purchase Confirmation`,
          html: purchaseConfirmationTemplate({
            orderNumber: generateOrderNumber(),
            customerName: "John Doe",
            customerEmail: email,
            courseTitle: "RoboQuant Academy Premium Course",
            courseCoverImage: "https://roboquant.academy/lovable-uploads/fd0974dc-cbd8-4af8-b3c8-35c6a8182cf5.png",
            purchaseDate: formatDate(new Date()),
            purchaseAmount: 150000,
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
    }
    
    // Course Completion Test
    if (type === "completion" || type === "all") {
      try {
        console.log("Sending course completion email...");
        const data = await resend.emails.send({
          from: "RoboQuant Academy <info@roboquant.ai>",
          to: [email],
          subject: `[TEST] Congratulations on Completing Your Course!`,
          html: courseCompletionEnhancedTemplate(
            "John Doe",
            "RoboQuant Academy Premium Course",
            formatDate(new Date())
          )
        });
        
        console.log("Completion email sent, response:", data);
        
        results.push({
          type: "completion",
          success: true,
          email_id: data.id
        });
      } catch (error) {
        console.error("Completion email error:", error);
        results.push({
          type: "completion",
          success: false,
          error: error.message || String(error)
        });
      }
    }
    
    // Abandoned Cart Test
    if (type === "cart" || type === "all") {
      try {
        console.log("Sending abandoned cart email...");
        const data = await resend.emails.send({
          from: "RoboQuant Academy <info@roboquant.ai>",
          to: [email],
          subject: `[TEST] Complete Your RoboQuant Academy Enrollment`,
          html: abandonedCartTemplate(
            "John Doe",
            "RoboQuant Academy Premium Course",
            "https://roboquant.academy/checkout/test"
          )
        });
        
        console.log("Cart email sent, response:", data);
        
        results.push({
          type: "cart",
          success: true,
          email_id: data.id
        });
      } catch (error) {
        console.error("Cart email error:", error);
        results.push({
          type: "cart",
          success: false,
          error: error.message || String(error)
        });
      }
    }
    
    // Re-engagement Test
    if (type === "reengagement" || type === "all") {
      try {
        console.log("Sending re-engagement email...");
        const data = await resend.emails.send({
          from: "RoboQuant Academy <info@roboquant.ai>",
          to: [email],
          subject: `[TEST] We Miss You at RoboQuant Academy`,
          html: reEngagementTemplate(
            "John Doe",
            formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            [
              {
                title: "Advanced Trading Strategies",
                url: "https://roboquant.academy/courses/advanced-trading-strategies"
              },
              {
                title: "Risk Management Masterclass",
                url: "https://roboquant.academy/courses/risk-management"
              }
            ]
          )
        });
        
        console.log("Re-engagement email sent, response:", data);
        
        results.push({
          type: "reengagement",
          success: true,
          email_id: data.id
        });
      } catch (error) {
        console.error("Re-engagement email error:", error);
        results.push({
          type: "reengagement",
          success: false,
          error: error.message || String(error)
        });
      }
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
