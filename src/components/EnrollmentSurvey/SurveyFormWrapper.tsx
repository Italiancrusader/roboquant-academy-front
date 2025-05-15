
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
      await onSurveyComplete(combinedData);
      toast({
        title: "Application Received",
        description: "Your application has been received. We'll contact you shortly.",
      });
    } catch (error) {
      console.error('Error completing survey:', error);
      
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
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
