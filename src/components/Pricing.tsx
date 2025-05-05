
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          courseId: 'premium', // Use a default courseId for the main course
          courseTitle: 'RoboQuant Academy',
          userId: user?.id || 'guest', // Allow guest checkout
          priceInCents: 150000, // $1500.00
          successUrl: window.location.origin + '/auth?redirect=/dashboard', // Redirect to auth after successful payment
          cancelUrl: window.location.origin + '/pricing',
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Checkout error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center px-4 sm:px-6">
      <Card className="w-full max-w-md border-primary">
        <CardHeader>
          <div className="bg-primary text-primary-foreground px-3 py-1 text-xs rounded-full w-fit">Premium</div>
          <CardTitle className="mt-2">RoboQuant Academy</CardTitle>
          <CardDescription>Full access to all trading strategies and bots</CardDescription>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold">$1,500</span>
            <span className="ml-2 text-sm text-muted-foreground line-through">$1,875</span>
            <span className="ml-2 text-xs bg-primary/20 text-primary py-0.5 px-2 rounded-full">20% off</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Full access to all trading algorithms</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Step-by-step bot creation tutorials</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>All future updates included</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Lifetime access</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full cta-button"
            onClick={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : "Enroll Now"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Pricing;
