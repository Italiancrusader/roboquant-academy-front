
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
      // Determine if the user qualifies for a call based on the survey answers
      const qualifiesForCall = checkQualification(combinedData);
      
      console.log("Survey wrapper data:", combinedData);
      console.log("Wrapper qualifies for call:", qualifiesForCall);
      console.log("Wrapper trading capital:", combinedData.tradingCapital);
      
      // Submit lead data regardless of qualification
      await submitLead({
        name: combinedData.fullName,
        email: combinedData.email,
        phone: combinedData.phone || "",
        source: "enrollment_survey",
        leadMagnet: qualifiesForCall ? "strategy_call" : "course_enrollment"
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // Show success toast
      toast({
        title: qualifiesForCall ? "You qualify for a strategy call!" : "Thank you for your application",
        description: qualifiesForCall 
          ? "Redirecting you to book your strategy call." 
          : "Redirecting you to our pricing page.",
        duration: 3000,
      });
      
      // Route based on qualification with slight delay for toast
      setTimeout(() => {
        if (qualifiesForCall) {
          // Redirect to calendar booking page
          navigate("/book-call");
        } else {
          // Redirect to pricing/checkout page
          navigate("/vsl?qualified=false");
        }
      }, 1000);
    } catch (error) {
      console.error("Error submitting survey:", error);
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
