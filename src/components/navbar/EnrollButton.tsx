import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface EnrollButtonProps {
  isScrolled: boolean;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({ isScrolled }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEnroll = async () => {
    // If on home page, scroll to pricing section
    if (location.pathname === '/') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    // Otherwise, redirect to pricing page
    navigate('/pricing');
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
          Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};
