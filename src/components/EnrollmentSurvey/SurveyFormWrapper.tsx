
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
      // CRITICAL FIX: Handle all high capital values with separate conditions
      // Check for high capital values directly without any further processing
      const highCapitalValues = ["> $25k", "> $250k", "Haa2tZ1srkPu"];
      
      let qualifies = false;
      
      if (highCapitalValues.includes(combinedData.tradingCapital)) {
        console.log("[SurveyFormWrapper] Direct qualifying high capital value detected:", combinedData.tradingCapital);
        qualifies = true;
      } else {
        // Standard flow for all other cases - check mapped values
        qualifies = checkQualification(combinedData);
        console.log("[SurveyFormWrapper] Standard qualification check result:", qualifies);
      }
      
      console.log("[SurveyFormWrapper] FULL QUALIFICATION DEBUG");
      console.log("[SurveyFormWrapper] Survey wrapper data:", combinedData);
      console.log("[SurveyFormWrapper] Wrapper qualifies for call:", qualifies);
      console.log("[SurveyFormWrapper] Wrapper trading capital:", combinedData.tradingCapital);
      console.log("[SurveyFormWrapper] Trading capital type:", typeof combinedData.tradingCapital);
      
      // Submit lead data regardless of qualification, with timeout protection
      try {
        const submitPromise = submitLead({
          name: combinedData.fullName,
          email: combinedData.email,
          phone: combinedData.phone || "",
          source: "enrollment_survey",
          leadMagnet: qualifies ? "strategy_call" : "course_enrollment"
        });
        
        const timeoutPromise = new Promise((_resolve, reject) => {
          setTimeout(() => reject(new Error("Lead submission timeout")), 8000);
        });
        
        await Promise.race([submitPromise, timeoutPromise]).catch(error => {
          console.error("[SurveyFormWrapper] Lead submission error:", error);
          // We continue despite errors to ensure user flow isn't interrupted
        });
      } catch (leadError) {
        console.error("[SurveyFormWrapper] Error submitting lead:", leadError);
        // Continue despite errors
      }
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // Show success toast
      toast({
        title: qualifies ? "You qualify for a strategy call!" : "Thank you for your application",
        description: qualifies 
          ? "Redirecting you to book your strategy call." 
          : "Redirecting you to our pricing page.",
        duration: 3000,
      });
      
      console.log("[SurveyFormWrapper] About to redirect to:", qualifies ? "/book-call" : "/vsl?qualified=false");
      
      // Route based on qualification with slight delay for toast
      setTimeout(() => {
        if (qualifies) {
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
        title: "Survey Received",
        description: "We've processed your information. You'll be redirected to the next steps shortly.",
        // Show a friendly message despite errors
      });
      
      // Fallback to default path
      setTimeout(() => {
        navigate("/vsl?qualified=false");
      }, 1000);
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
