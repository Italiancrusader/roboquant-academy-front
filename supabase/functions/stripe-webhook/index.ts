import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });
  
  // Create Supabase client with service role key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log("🔔 Webhook received");
    
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      console.error("⚠️ No signature provided");
      return new Response(JSON.stringify({ error: "No signature provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const body = await req.text();
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    
    if (!endpointSecret) {
      console.error("⚠️ Webhook secret not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Verify the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log(`✅ Event verified: ${event.type}`);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log(`🔄 Processing checkout session completed: ${event.data.object.id}`);
        await handleCheckoutSessionCompleted(supabase, event.data.object);
        
        // Track purchase event with Meta Conversion API
        await trackMetaConversionPurchase(event.data.object);
        break;
      case 'payment_intent.succeeded':
        console.log('💰 Payment succeeded:', event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object.id);
        break;
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutSessionCompleted(supabase: any, session: any) {
  console.log(`🛒 Checkout session completed: ${session.id}`);
  console.log(`💳 Payment status: ${session.payment_status}`);
  
  if (session.payment_status === 'paid' && session.metadata) {
    const { userId, courseId } = session.metadata;
    
    console.log(`👤 User ID: ${userId || 'Not provided'}`);
    console.log(`📚 Course ID: ${courseId || 'Not provided'}`);
    
    if (userId && courseId) {
      try {
        // Check if enrollment already exists to avoid duplicates
        console.log(`🔍 Checking for existing enrollment: user=${userId}, course=${courseId}`);
        const { data: existingEnrollment, error: queryError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single();
        
        if (queryError && queryError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which is expected if not enrolled
          console.log(`⚠️ Query error: ${queryError.message}`);
        }
        
        if (!existingEnrollment) {
          console.log(`➕ Creating new enrollment record`);
          // Create enrollment record
          const { data, error } = await supabase
            .from('enrollments')
            .insert({
              user_id: userId,
              course_id: courseId,
              stripe_session_id: session.id,
              payment_status: 'completed'
            });
            
          if (error) {
            console.error(`❌ Error creating enrollment: ${error.message}`);
            throw error;
          }
          
          console.log(`✅ Enrollment created for user ${userId} and course ${courseId}`);
        } else {
          console.log(`⚠️ Enrollment already exists for user ${userId} and course ${courseId}`);
        }
      } catch (error) {
        console.error('❌ Error creating enrollment:', error);
      }
    } else {
      console.error('⚠️ Missing userId or courseId in session metadata');
      console.log('Session metadata:', session.metadata);
    }
  } else {
    console.log(`⚠️ Session ${session.id} is not paid or missing metadata`);
  }
}

async function trackMetaConversionPurchase(session: any) {
  try {
    const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID");
    const META_CONVERSION_API_TOKEN = Deno.env.get("META_CONVERSION_API_TOKEN");
    
    if (!META_PIXEL_ID || !META_CONVERSION_API_TOKEN) {
      console.log("⚠️ Meta Pixel ID or Conversion API Token not configured, skipping purchase tracking");
      return;
    }
    
    const { customer_details, amount_total, currency } = session;
    
    // Prepare user data hash for Meta API
    const userData = {
      em: customer_details?.email ? hashValue(customer_details.email.toLowerCase()) : undefined,
      ph: customer_details?.phone ? hashValue(customer_details.phone) : undefined,
      fn: customer_details?.name ? hashValue(customer_details.name.split(' ')[0]) : undefined,
      ln: customer_details?.name ? hashValue(customer_details.name.split(' ').slice(1).join(' ')) : undefined,
      ct: customer_details?.address?.city ? hashValue(customer_details.address.city) : undefined,
      st: customer_details?.address?.state ? hashValue(customer_details.address.state) : undefined,
      zp: customer_details?.address?.postal_code ? hashValue(customer_details.address.postal_code) : undefined,
      country: customer_details?.address?.country ? hashValue(customer_details.address.country) : undefined,
      client_user_agent: session.client_reference_id || "Stripe Checkout"
    };
    
    // Prepare custom data for the purchase event
    const customData = {
      value: amount_total ? amount_total / 100 : 0, // Convert cents to dollars
      currency: currency || "USD",
      content_type: "product",
      content_ids: [session.metadata?.courseId || "premium-course"],
      content_name: session.metadata?.courseTitle || "RoboQuant Academy",
      num_items: 1,
    };
    
    console.log("🔄 Sending purchase event to Meta Conversion API");
    
    // Send the purchase event to Meta Conversion API
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${META_PIXEL_ID}/events?access_token=${META_CONVERSION_API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [{
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: session.success_url || session.cancel_url,
            action_source: "website",
            user_data: userData,
            custom_data: customData,
          }],
        }),
      }
    );
    
    const result = await response.json();
    console.log("✅ Meta Conversion API response:", result);
  } catch (error) {
    console.error("❌ Error tracking purchase with Meta Conversion API:", error);
  }
}

// Simple hash function for privacy (Meta requires hashed user data)
function hashValue(value: string): string {
  if (!value) return "";
  // Note: In production, use a proper SHA-256 hashing
  return btoa(value).replace(/=/g, '');
}
