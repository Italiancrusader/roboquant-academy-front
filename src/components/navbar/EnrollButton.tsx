
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnrollButtonProps {
  isScrolled: boolean;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({ isScrolled }) => {
  return (
    <Button 
      asChild
      className={cn(
        "hidden sm:flex cta-button text-white",
        isScrolled ? "py-2 px-4" : "py-2 px-4 hover:scale-105"
      )}
      onClick={() => window.open('https://whop.com/checkout/plan_h6SjTvT4JxgxA/', '_blank')}
    >
      <Link to="/courses">
        Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
};
