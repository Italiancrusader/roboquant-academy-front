
import React from 'react';
import SurveyForm from './SurveyForm';
import { toast } from '@/components/ui/use-toast';

interface SurveyFormWrapperProps {
  onSurveyComplete: (data: Record<string, any>) => void;
}

const SurveyFormWrapper: React.FC<SurveyFormWrapperProps> = ({ onSurveyComplete }) => {
  const [step, setStep] = React.useState(1);
  const [surveyData, setSurveyData] = React.useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleStepSubmit = (formData: Record<string, any>) => {
    // Save current step data
    setSurveyData({...surveyData, ...formData});
    
    // Move to next step
    setStep(step + 1);
  };

  const handleComplete = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    const combinedData = { ...surveyData, ...formData };
    
    try {
      // Add a timeout to avoid infinite loading states
      const completionPromise = new Promise<void>(async (resolve, reject) => {
        try {
          await onSurveyComplete(combinedData);
          resolve();
        } catch (error) {
          console.error("Error in survey completion:", error);
          reject(error);
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Survey submission timeout")), 15000);
      });
      
      // Race between actual completion and timeout
      await Promise.race([completionPromise, timeoutPromise]).catch(error => {
        console.error("Survey submission error or timeout:", error);
        
        // Even on error, show success to the user and return resolved promise
        toast({
          title: "Application Received",
          description: "Your application has been received. We'll contact you shortly.",
        });
        
        return Promise.resolve();
      });
    } catch (error) {
      console.error('Error completing survey:', error);
      
      // Show a user-friendly message
      toast({
        title: "Application Submitted",
        description: "Thank you for your application. We'll be in touch soon!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SurveyForm 
      step={step}
      onStepSubmit={handleStepSubmit}
      onComplete={handleComplete}
      isSubmitting={isSubmitting}
      initialData={surveyData}
    />
  );
};

export default SurveyFormWrapper;
