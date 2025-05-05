
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

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { type = "all", email = "ventos99@gmail.com" } = await req.json();
    const results = [];
    
    // Purchase Confirmation Test
    if (type === "purchase" || type === "all") {
      try {
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
          error: error.message
        });
      }
    }
    
    // Course Completion Test
    if (type === "completion" || type === "all") {
      try {
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
          error: error.message
        });
      }
    }
    
    // Abandoned Cart Test
    if (type === "cart" || type === "all") {
      try {
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
          error: error.message
        });
      }
    }
    
    // Re-engagement Test
    if (type === "reengagement" || type === "all") {
      try {
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
          error: error.message
        });
      }
    }
    
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
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
