
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { handleStripeCheckout } from '@/services/stripe';
import { trackEvent } from '@/utils/googleAnalytics';
import { useAuth } from '@/contexts/AuthContext';

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      trackEvent('direct_checkout_started', {
        event_category: 'Checkout',
        event_label: 'Academy Direct Purchase',
        value: 1500
      });
      
      // Process checkout with Stripe
      const userId = user ? user.id : undefined;
      const result = await handleStripeCheckout({
        courseId: 'roboquant-academy',
        courseTitle: 'RoboQuant Academy',
        price: 1500,
        userId: userId,
        successUrl: window.location.origin + '/thank-you',
        cancelUrl: window.location.origin + '/checkout',
      });
      
      if (!result) {
        throw new Error("Failed to initiate checkout");
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center gradient-text">
            Skip the Call — Grab Lifetime Access Now
          </h1>
          
          <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
            You can still get access to our complete program today without scheduling a strategy call.
          </p>
          
          <Card className="border-primary mb-8">
            <CardHeader>
              <div className="bg-primary text-primary-foreground px-3 py-1 text-xs rounded-full w-fit">
                Lifetime Access
              </div>
              <CardTitle className="mt-2">RoboQuant Academy</CardTitle>
              <CardDescription>Full access to all trading strategies and bots</CardDescription>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">$1,500</span>
                <span className="ml-2 text-sm text-muted-foreground line-through">$1,875</span>
                <span className="ml-2 text-xs bg-primary/20 text-primary py-0.5 px-2 rounded-full">
                  20% off
                </span>
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
                className="w-full py-6" 
                onClick={handlePurchase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Enroll Now — Get Instant Access"}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center">
            <p className="text-muted-foreground">
              One-time payment • Lifetime access • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
