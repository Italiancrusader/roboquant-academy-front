
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";

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
    const { courseId, courseTitle, price, userId, successUrl, cancelUrl, couponCode } = await req.json();
    
    if (!courseId || !courseTitle || !price) {
      throw new Error("Required parameters missing: courseId, courseTitle, and price are required");
    }
    
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    console.log(`Creating checkout session for course: ${courseId}, user: ${userId || 'anonymous'}`);

    // Customer management - find or create
    let customerId;
    if (userId) {
      const { data: searchResult } = await stripe.customers.search({
        query: `metadata['supabase_id']:'${userId}'`,
      });

      if (searchResult && searchResult.length > 0) {
        customerId = searchResult[0].id;
        console.log(`Found existing Stripe customer: ${customerId}`);
      }
    }

    // Prepare checkout session parameters
    const checkoutParams: any = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: courseTitle,
              description: `Enrollment for ${courseTitle}`,
              metadata: {
                courseId,
              },
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${req.headers.get("origin")}/courses/${courseId}?payment=success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/courses/${courseId}?payment=canceled`,
      metadata: {
        courseId,
        userId,
      }
    };

    // Add coupon to checkout if provided
    if (couponCode) {
      console.log(`Applying coupon: ${couponCode}`);
      
      // Verify the coupon exists and is valid
      try {
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (coupon.valid) {
          checkoutParams.discounts = [
            {
              coupon: couponCode,
            },
          ];
          console.log(`Coupon ${couponCode} applied successfully`);
        } else {
          console.log(`Coupon ${couponCode} is invalid`);
        }
      } catch (error) {
        console.error(`Error retrieving coupon ${couponCode}:`, error);
        // Continue checkout without the coupon if it doesn't exist
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(checkoutParams);

    console.log(`✅ Checkout session created: ${session.id}`);

    // Return the session ID and URL
    return new Response(JSON.stringify({ 
      id: session.id, 
      url: session.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
