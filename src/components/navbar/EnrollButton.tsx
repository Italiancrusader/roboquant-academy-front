
import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { trackInitiateCheckout } from "@/utils/metaPixel";
import { handleStripeCheckout } from "@/services/stripe";

interface EnrollButtonProps {
  isScrolled: boolean;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({ isScrolled }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      // Track InitiateCheckout event
      trackInitiateCheckout({
        value: 1500,
        currency: 'USD',
        content_name: 'RoboQuant Academy',
        content_type: 'product'
      });
      
      // Process checkout with Stripe
      const userId = user ? user.id : undefined;
      const result = await handleStripeCheckout({
        courseId: 'roboquant-academy',
        courseTitle: 'RoboQuant Academy',
        price: 1500,
        userId: userId,
        successUrl: window.location.origin + '/dashboard',
        cancelUrl: window.location.origin + window.location.pathname,
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
    <Button 
      className={cn(
        "hidden sm:flex cta-button text-white",
        isScrolled ? "py-2 px-4" : "py-2 px-4 hover:scale-105"
      )}
      onClick={handleEnroll}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Join the Academy Now <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};
