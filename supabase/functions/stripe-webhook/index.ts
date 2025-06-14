
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
          
          // Get user details for Meta Conversions API
          const { data: userData, error: authError } = await supabase.auth.admin.getUserById(userId);
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          // Send Meta Conversions API event for purchase
          try {
            console.log(`📊 Sending Meta Conversions API purchase event`);
            
            const metaEventData = {
              eventName: 'Purchase',
              userData: {
                email: userData?.user?.email,
                firstName: userProfile?.first_name,
                lastName: userProfile?.last_name,
                externalId: userId,
              },
              customData: {
                value: session.amount_total ? session.amount_total / 100 : 1500, // Convert from cents
                currency: session.currency?.toUpperCase() || 'USD',
                contentName: 'RoboQuant Academy',
                contentCategory: 'online_course',
              },
              eventId: `purchase_${session.id}`, // Use session ID for deduplication
            };

            const metaResponse = await fetch(`${supabaseUrl}/functions/v1/meta-conversions-api`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify(metaEventData)
            });

            if (metaResponse.ok) {
              console.log(`✅ Meta Conversions API purchase event sent successfully`);
            } else {
              const errorData = await metaResponse.json();
              console.error(`❌ Meta Conversions API error:`, errorData);
            }
          } catch (metaError) {
            console.error(`❌ Error sending Meta Conversions API event:`, metaError);
            // Continue with the process even if Meta API fails
          }
          
          // Send purchase confirmation email
          try {
            console.log(`📧 Sending purchase confirmation email`);
            
            // Get the amount from the session
            const amountTotal = session.amount_total;
            
            // Make a request to our purchase confirmation endpoint
            const response = await fetch(`${supabaseUrl}/functions/v1/purchase-confirmation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({
                userId,
                courseId,
                sessionId: session.id,
                priceInCents: amountTotal
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Failed to send purchase confirmation: ${errorData.error || response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`📧 Purchase confirmation email sent: ${result.email_id || 'unknown'}`);
          } catch (emailError) {
            console.error(`❌ Error sending purchase confirmation email: ${emailError.message}`);
            // Continue with the process even if email sending fails
          }
          
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
