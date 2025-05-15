
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
      
      console.log("Survey dialog data:", combinedData);
      console.log("Dialog qualifies for call:", qualifiesForCall);
      console.log("Dialog trading capital:", combinedData.tradingCapital);
      
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

  // Logic to determine if user qualifies for a strategy call - using the expanded capital check
  const checkQualification = (data: Record<string, any>): boolean => {
    console.log("Dialog checking qualification with trading capital:", data.tradingCapital);
    
    if (!data.tradingCapital) return false;
    
    // Convert to lowercase for case-insensitive matching
    const userCapital = data.tradingCapital.toLowerCase();
    
    // Capital thresholds that qualify - expanded to include more variations
    const qualifyingCapitalValues = [
      "$5,000", "$5k", "5000", "5k",
      "$10,000", "$10k", "10000", "10k", 
      "$25,000", "$25k", "25000", "25k",
      "$250,000", "$250k", "250000", "250k",
      "$5,000 – $10,000", "$5k – $10k", "$5k-$10k",
      "$10,000 – $25,000", "$10k – $25k", "$10k-$25k",
      "$10,000 – $250,000", "$10k – $250k", "$10k-$250k",
      "over $5,000", "over $5k", "> $5k",
      "over $25,000", "over $25k", "> $25k",
      "over $250,000", "over $250k", "> $250k"
    ];
    
    // Check if the user's trading capital includes any qualifying value
    const hasMinimumCapital = qualifyingCapitalValues.some(value => 
      userCapital.includes(value.toLowerCase())
    );
    
    console.log("Dialog has minimum capital:", hasMinimumCapital);
    
    // Return true if minimum capital requirement is met
    return hasMinimumCapital;
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
