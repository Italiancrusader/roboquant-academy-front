
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
