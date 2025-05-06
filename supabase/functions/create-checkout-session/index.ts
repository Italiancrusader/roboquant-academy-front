
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // Get request body
    const body = await req.json();
    const { courseId, courseTitle, userId, price, successUrl, cancelUrl } = body;

    console.log('Checkout request received:', { courseId, courseTitle, userId, price, successUrl, cancelUrl });

    if (!courseId || !courseTitle || !price || !successUrl || !cancelUrl) {
      console.error('Missing required fields:', { courseId, courseTitle, price, successUrl, cancelUrl });
      throw new Error("Missing required fields for checkout");
    }

    // Convert price to cents for Stripe
    const priceInCents = price * 100;
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if we should use authentication
    let customerEmail = undefined;
    let customerId = undefined;
    
    if (userId && userId !== 'guest') {
      // Initialize Supabase admin client
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        { auth: { persistSession: false } }
      );

      // Get user email from Supabase
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userError) {
        console.error("Error fetching user:", userError);
      } else if (userData?.user?.email) {
        customerEmail = userData.user.email;
        
        // Check if a Stripe customer exists for this user
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }
    }

    console.log('Creating checkout session with:', { customerId, customerEmail, priceInCents });
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: !customerId ? customerEmail : undefined, // Only set if we don't have customerId
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: courseTitle },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        courseId,
        userId
      }
    });

    console.log('Checkout session created:', { sessionId: session.id, url: session.url });
    
    // Return the session URL
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
