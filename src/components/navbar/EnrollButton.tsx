
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
      variant={isScrolled ? "default" : "outline"} 
      className={cn(
        "hidden sm:flex",
        !isScrolled ? "text-white border-white hover:text-white hover:bg-white/20" : ""
      )}
      onClick={() => window.open('https://whop.com/checkout/plan_h6SjTvT4JxgxA/', '_blank')}
    >
      <Link to="/courses">
        Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
};
