
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.0.0";
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
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type = "all", email = "ventos99@gmail.com" } = await req.json();
    const results = [];
    
    // Purchase Confirmation Test
    if (type === "purchase" || type === "all") {
      const { data: purchaseData, error: purchaseError } = await resend.emails.send({
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
        success: !purchaseError,
        email_id: purchaseData?.id,
        error: purchaseError?.message
      });
    }
    
    // Course Completion Test
    if (type === "completion" || type === "all") {
      const { data: completionData, error: completionError } = await resend.emails.send({
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
        success: !completionError,
        email_id: completionData?.id,
        error: completionError?.message
      });
    }
    
    // Abandoned Cart Test
    if (type === "cart" || type === "all") {
      const { data: cartData, error: cartError } = await resend.emails.send({
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
        success: !cartError,
        email_id: cartData?.id,
        error: cartError?.message
      });
    }
    
    // Re-engagement Test
    if (type === "reengagement" || type === "all") {
      const { data: reengagementData, error: reengagementError } = await resend.emails.send({
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
        success: !reengagementError,
        email_id: reengagementData?.id,
        error: reengagementError?.message
      });
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
