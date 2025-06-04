
import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/utils/googleAnalytics";

interface EnrollButtonProps {
  isScrolled: boolean;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({ isScrolled }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleApplyNow = async () => {
    setIsLoading(true);
    try {
      // Track the event
      trackEvent('nav_apply_clicked', {
        event_category: 'Navigation',
        event_label: 'Apply Now Button'
      });
      
      // Scroll to pricing section
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error scrolling to pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className={cn(
        "hidden sm:flex cta-button text-white",
        isScrolled ? "py-2 px-4" : "py-2 px-4 hover:scale-105"
      )}
      onClick={handleApplyNow}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Apply Now <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};
