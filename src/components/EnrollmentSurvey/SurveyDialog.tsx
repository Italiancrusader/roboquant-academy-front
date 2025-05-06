
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SurveyForm from "./SurveyForm";
import { useNavigate } from "react-router-dom";
import { submitLead } from "@/services/leadService";

interface SurveyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SurveyDialog: React.FC<SurveyDialogProps> = ({
  isOpen,
  onOpenChange,
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
      
      // Submit lead data regardless of qualification
      await submitLead({
        name: combinedData.fullName,
        email: combinedData.email,
        phone: combinedData.phone || "",
        source: "enrollment_survey",
        leadMagnet: qualifiesForCall ? "strategy_call" : "course_enrollment"
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Route based on qualification
      if (qualifiesForCall) {
        // Redirect to calendar booking page
        navigate("/book-call");
      } else {
        // Redirect to pricing/checkout page
        navigate("/pricing");
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
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

  // Logic to determine if user qualifies for a strategy call
  const checkQualification = (data: Record<string, any>): boolean => {
    // Qualification criteria based on survey answers
    const hasMinimumCapital = ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"].includes(data.tradingCapital);
    const hasMinimumExperience = !["I've never traded", "0–1 year"].includes(data.tradingExperience);
    const hasClearGoal = data.tradingGoal && data.tradingGoal !== "";
    const usesPropFirm = data.propFirmUsage === "Yes" || data.propFirmUsage === "No, but I plan to";
    
    // Main qualification gate
    return hasMinimumCapital && hasMinimumExperience && hasClearGoal;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(newOpen) => {
      // Prevent closing the dialog while submitting
      if (isSubmitting && !newOpen) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Let's See If You're a Good Fit
          </DialogTitle>
          <DialogDescription>
            Complete this short survey to find out if you qualify for a strategy call with our team.
          </DialogDescription>
        </DialogHeader>
        <SurveyForm 
          step={step}
          onStepSubmit={handleStepSubmit}
          onComplete={handleSurveyComplete}
          isSubmitting={isSubmitting}
          initialData={surveyData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;
