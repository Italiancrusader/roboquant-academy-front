
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyForm from './SurveyForm';
import { submitLead } from '@/services/leadService';
import { toast } from '@/components/ui/use-toast';
import { checkQualification } from './index';

interface SurveyFormWrapperProps {
  onComplete?: () => void;
  className?: string;
}

const SurveyFormWrapper: React.FC<SurveyFormWrapperProps> = ({ 
  onComplete,
  className
}) => {
  const [step, setStep] = useState(1);
  const [surveyData, setSurveyData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSurveyComplete = async (formData: Record<string, any>) => {
    const combinedData = { ...surveyData, ...formData };
    setSurveyData(combinedData);
    
    setIsSubmitting(true);
    
    try {
      // CRITICAL FIX: Handle special case for high capital values directly and clearly
      if (combinedData.tradingCapital === "> $25k" || combinedData.tradingCapital === "> $250k") {
        console.log("[SurveyFormWrapper] Direct qualifying high capital value detected:", combinedData.tradingCapital);
        
        // Submit lead data for qualified lead
        await submitLead({
          name: combinedData.fullName,
          email: combinedData.email,
          phone: combinedData.phone || "",
          source: "enrollment_survey",
          leadMagnet: "strategy_call"
        });
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete();
        }
        
        // Show success toast
        toast({
          title: "You qualify for a strategy call!",
          description: "Redirecting you to book your strategy call.",
          duration: 3000,
        });
        
        // Redirect to calendar booking page with slight delay for toast
        setTimeout(() => {
          navigate("/book-call");
        }, 1000);
        
        setIsSubmitting(false);
        return;
      }
      
      // Standard flow for all other cases
      const qualifiesForCall = checkQualification(combinedData);
      
      console.log("[SurveyFormWrapper] FULL QUALIFICATION DEBUG");
      console.log("[SurveyFormWrapper] Survey wrapper data:", combinedData);
      console.log("[SurveyFormWrapper] Wrapper qualifies for call:", qualifiesForCall);
      console.log("[SurveyFormWrapper] Wrapper trading capital:", combinedData.tradingCapital);
      console.log("[SurveyFormWrapper] Trading capital type:", typeof combinedData.tradingCapital);
      
      // Hard-coded mapping for Typeform responses to our internal format
      // This is a fallback in case the webhook fails
      if (combinedData.tradingCapital === "< $1k") {
        combinedData.tradingCapital = "Under $1,000";
      } else if (combinedData.tradingCapital === "$1k-$5k") {
        combinedData.tradingCapital = "$1,000 – $5,000";
      } else if (combinedData.tradingCapital === "$5k-$10k") {
        combinedData.tradingCapital = "$5,000 – $10,000";
      } else if (combinedData.tradingCapital === "$10k-$250k" || combinedData.tradingCapital === "$10k-$25k") {
        combinedData.tradingCapital = "$10,000 – $250,000";
      } else if (combinedData.tradingCapital === "> $250k" || combinedData.tradingCapital === "> $25k") {
        combinedData.tradingCapital = "Over $250,000";
      }
      
      // Recalculate qualification after potential mapping
      const finalQualification = checkQualification(combinedData);
      console.log("[SurveyFormWrapper] Final qualification after mapping:", finalQualification);
      
      // Submit lead data regardless of qualification
      await submitLead({
        name: combinedData.fullName,
        email: combinedData.email,
        phone: combinedData.phone || "",
        source: "enrollment_survey",
        leadMagnet: finalQualification ? "strategy_call" : "course_enrollment"
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // Show success toast
      toast({
        title: finalQualification ? "You qualify for a strategy call!" : "Thank you for your application",
        description: finalQualification 
          ? "Redirecting you to book your strategy call." 
          : "Redirecting you to our pricing page.",
        duration: 3000,
      });
      
      console.log("[SurveyFormWrapper] About to redirect to:", finalQualification ? "/book-call" : "/vsl?qualified=false");
      
      // Route based on qualification with slight delay for toast
      setTimeout(() => {
        if (finalQualification) {
          // Redirect to calendar booking page
          console.log("[SurveyFormWrapper] Redirecting to /book-call");
          navigate("/book-call");
        } else {
          // Redirect to pricing/checkout page
          console.log("[SurveyFormWrapper] Redirecting to /vsl?qualified=false");
          navigate("/vsl?qualified=false");
        }
      }, 1000);
    } catch (error) {
      console.error("[SurveyFormWrapper] Error submitting survey:", error);
      toast({
        title: "Error",
        description: "There was an error processing your survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStepSubmit = (formData: Record<string, any>) => {
    // Save current step data
    setSurveyData({...surveyData, ...formData});
    
    // Move to next step
    setStep(step + 1);
  };

  return (
    <div className={className}>
      <SurveyForm 
        step={step}
        onStepSubmit={handleStepSubmit}
        onComplete={handleSurveyComplete}
        isSubmitting={isSubmitting}
        initialData={surveyData}
      />
    </div>
  );
};

export default SurveyFormWrapper;
