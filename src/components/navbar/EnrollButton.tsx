
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { handleStripeCheckout } from "@/services/stripe";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface EnrollButtonProps {
  isScrolled: boolean;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({ isScrolled }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth', { state: { from: '/' } });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if user is admin
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      
      if (adminCheckError) {
        console.error("Error checking admin status:", adminCheckError);
      }
      
      if (isAdmin) {
        // If user is admin, create enrollment directly
        const { error: enrollError } = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_id: 'premium', // Replace with your actual premium course ID
            payment_status: 'completed'
          });
          
        if (enrollError) {
          // Check if enrollment already exists
          if (enrollError.code === '23505') { // Unique violation error code
            navigate('/dashboard');
            return;
          }
          throw enrollError;
        }
        
        toast({
          title: "Access granted",
          description: "As an admin, you've been given direct access to this course.",
        });
        
        navigate('/dashboard');
        return;
      }
      
      // Regular checkout flow for non-admin users
      await handleStripeCheckout({
        courseId: 'premium', // Replace with your actual premium course ID
        courseTitle: 'RoboQuant Academy',
        price: 1500, // $1,500 (updated from $2,000)
        userId: user.id,
      });
    } catch (error: any) {
      toast({
        title: "Enrollment error",
        description: error.message || "An error occurred during enrollment",
        variant: "destructive",
      });
      console.error("Enrollment error:", error);
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
