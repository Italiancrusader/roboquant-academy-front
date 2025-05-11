// Vercel serverless function for handling Stripe webhook events
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the raw body for Stripe signature verification
  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];
  
  let event;
  
  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Extract user and course info from the session
      const userId = session.client_reference_id;
      const courseId = session.metadata.courseId;
      
      // Update user's course access in the database
      if (userId && courseId) {
        try {
          // Check if the user already has access to the course
          const { data: existingAccess, error: fetchError } = await supabase
            .from('user_course_access')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
          }
          
          // If the user doesn't have access, grant it
          if (!existingAccess) {
            const { error: insertError } = await supabase
              .from('user_course_access')
              .insert([
                {
                  user_id: userId,
                  course_id: courseId,
                  access_granted_at: new Date().toISOString(),
                  payment_id: session.id,
                  status: 'active',
                },
              ]);
            
            if (insertError) {
              throw insertError;
            }
          }
          
          // Add this purchase to the order history
          const { error: orderError } = await supabase
            .from('orders')
            .insert([
              {
                user_id: userId,
                course_id: courseId,
                amount: session.amount_total,
                currency: session.currency,
                payment_id: session.id,
                payment_status: 'completed',
              },
            ]);
          
          if (orderError) {
            throw orderError;
          }
        } catch (error) {
          console.error('Error updating database:', error);
          return res.status(500).json({ error: 'Database update failed' });
        }
      }
      break;
    }
    
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      
      // Get user ID from Stripe customer ID
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();
      
      if (customerError) {
        console.error('Error finding customer:', customerError);
        return res.status(500).json({ error: 'Customer lookup failed' });
      }
      
      // Update user's subscription status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          subscription_tier: subscription.items.data[0].price.nickname || 'standard',
          subscription_expires: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', customer.user_id);
      
      if (updateError) {
        console.error('Error updating subscription status:', updateError);
        return res.status(500).json({ error: 'Subscription update failed' });
      }
      
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  // Return a 200 success response
  res.json({ received: true });
}

// Helper function to get the raw body as a Buffer
async function buffer(req) {
  const chunks = [];
  
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  
  return Buffer.concat(chunks);
}

// Tell Vercel to handle raw body instead of parsing it as JSON
export const config = {
  api: {
    bodyParser: false,
  },
}; 