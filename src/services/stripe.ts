import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { loadStripe } from '@stripe/stripe-js';

export interface CheckoutOptions {
  courseId: string;
  courseTitle: string;
  price: number;
  userId?: string;
  successUrl?: string;
  cancelUrl?: string;
  couponCode?: string;
  isTestMode?: boolean;
}

export const createCheckoutSession = async (options: CheckoutOptions) => {
  try {
    console.log(`Creating checkout session for course: ${options.courseId}`);
    console.log(`Price: $${options.price}`);
    console.log(`Test mode: ${options.isTestMode ? 'YES' : 'NO'}`);
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: options,
    });

    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error('No checkout URL returned');
    
    console.log(`Checkout session created, redirecting to: ${data.url}`);
    return data;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    toast({
      title: "Payment error",
      description: error.message || 'Failed to initiate payment process',
      variant: "destructive",
    });
    return null;
  }
};

export const handleStripeCheckout = async (options: CheckoutOptions) => {
  const response = await createCheckoutSession(options);
  
  if (response?.url) {
    window.location.href = response.url;
    return true;
  }
  
  return false;
};

// Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

/**
 * Handles redirecting to Stripe Checkout for a specific product/course
 * @param courseId The ID of the course to purchase
 * @param priceId The Stripe Price ID for the course
 * @param successUrl The URL to redirect to on successful payment
 * @param cancelUrl The URL to redirect to if payment is cancelled
 */
export const redirectToCheckout = async (
  courseId: string,
  priceId: string,
  successUrl: string = `${window.location.origin}/thank-you?course=${courseId}`,
  cancelUrl: string = `${window.location.origin}/courses/${courseId}`
) => {
  try {
    // Make sure Stripe has loaded
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    // Create a checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        courseId,
        successUrl,
        cancelUrl,
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error: any) {
    console.error('Error redirecting to checkout:', error);
    return {
      error: error.message || 'An error occurred during checkout',
    };
  }
};

/**
 * Creates a Stripe customer portal session for managing subscriptions
 */
export const createCustomerPortalSession = async () => {
  try {
    const response = await fetch('/api/create-customer-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    // Redirect to the customer portal
    window.location.href = session.url;
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return {
      error: error.message || 'An error occurred while accessing subscription management',
    };
  }
};
