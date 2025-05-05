import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import LeadDialog from "@/components/LeadDialog";

interface EnrollButtonProps {
  isScrolled: boolean;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({ isScrolled }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  
  const handleEnroll = async () => {
    // If user is already logged in, go directly to pricing
    if (user) {
      navigateToPricing();
      return;
    }
    
    // Otherwise, show the lead dialog
    setShowLeadDialog(true);
  };

  const navigateToPricing = () => {
    setIsLoading(true);
    
    // If on home page, scroll to pricing section
    if (location.pathname === '/') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
        setIsLoading(false);
        return;
      }
    }
    
    // Otherwise, redirect to pricing page
    navigate('/pricing');
    setIsLoading(false);
  };
  
  return (
    <>
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
            Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      
      <LeadDialog
        isOpen={showLeadDialog}
        onOpenChange={setShowLeadDialog}
        title="Start Your Trading Journey"
        description="Enter your details below to get started with RoboQuant Academy."
        source="navbar_enroll_button"
        buttonText="Continue to Pricing"
        onSubmitSuccess={navigateToPricing}
      />
    </>
  );
};
