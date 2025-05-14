
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
import { toast } from "@/components/ui/use-toast";
import { checkQualification } from "./index";

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
      
      console.log("[SurveyDialog] FULL QUALIFICATION DEBUG");
      console.log("[SurveyDialog] Survey dialog data:", combinedData);
      console.log("[SurveyDialog] Dialog qualifies for call:", qualifiesForCall);
      console.log("[SurveyDialog] Dialog trading capital:", combinedData.tradingCapital);
      console.log("[SurveyDialog] Trading capital type:", typeof combinedData.tradingCapital);
      console.log("[SurveyDialog] Is included in approved list:", ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"].includes(combinedData.tradingCapital));
      
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
      
      // Show toast notification
      toast({
        title: qualifiesForCall ? "You qualify for a strategy call!" : "Thank you for your application",
        description: qualifiesForCall 
          ? "Redirecting you to book your strategy call." 
          : "Redirecting you to our pricing page.",
        duration: 3000,
      });
      
      console.log("[SurveyDialog] About to redirect to:", qualifiesForCall ? "/book-call" : "/vsl?qualified=false");
      
      // Route based on qualification with a slight delay for the toast to be visible
      setTimeout(() => {
        if (qualifiesForCall) {
          // Redirect to calendar booking page
          console.log("[SurveyDialog] Redirecting to /book-call");
          navigate("/book-call");
        } else {
          // Redirect to pricing/checkout page with qualified parameter
          console.log("[SurveyDialog] Redirecting to /vsl?qualified=false");
          navigate("/vsl?qualified=false");
        }
      }, 1000);
    } catch (error) {
      console.error("[SurveyDialog] Error submitting survey:", error);
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
