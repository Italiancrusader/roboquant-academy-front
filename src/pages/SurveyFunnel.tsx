
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SurveyForm from '@/components/EnrollmentSurvey/SurveyForm';
import { submitLead } from '@/services/leadService';
import { toast } from '@/components/ui/use-toast';
import { checkQualification } from '@/components/EnrollmentSurvey';

const SurveyFunnel = () => {
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
      
      console.log("[SurveyFunnel] FULL QUALIFICATION DEBUG");
      console.log("[SurveyFunnel] Survey data:", combinedData);
      console.log("[SurveyFunnel] Qualifies for call:", qualifiesForCall);
      console.log("[SurveyFunnel] Trading capital:", combinedData.tradingCapital);
      console.log("[SurveyFunnel] Trading capital type:", typeof combinedData.tradingCapital);
      console.log("[SurveyFunnel] Is included in approved list:", ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"].includes(combinedData.tradingCapital));
      
      // Submit lead data regardless of qualification
      await submitLead({
        name: combinedData.fullName,
        email: combinedData.email,
        phone: combinedData.phone || "",
        source: "enrollment_survey",
        leadMagnet: qualifiesForCall ? "strategy_call" : "course_enrollment"
      });
      
      // Show success toast
      toast({
        title: qualifiesForCall ? "You qualify for a strategy call!" : "Thank you for your application",
        description: qualifiesForCall 
          ? "Redirecting you to book your strategy call." 
          : "Redirecting you to our pricing page.",
        duration: 3000,
      });
      
      console.log("[SurveyFunnel] About to redirect to:", qualifiesForCall ? "/book-call" : "/vsl?qualified=false");
      
      // Route based on qualification with slight delay for toast
      setTimeout(() => {
        if (qualifiesForCall) {
          // Redirect to calendar booking page
          console.log("[SurveyFunnel] Redirecting to /book-call");
          navigate("/book-call");
        } else {
          // Redirect to pricing/checkout page
          console.log("[SurveyFunnel] Redirecting to /vsl?qualified=false");
          navigate("/vsl?qualified=false");
        }
      }, 1000);
    } catch (error) {
      console.error("[SurveyFunnel] Error submitting survey:", error);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-4">
              Let's See If You're a Good Fit
            </h1>
            <p className="text-muted-foreground mb-8">
              Complete this short survey to find out if you qualify for a strategy call with our team.
            </p>
            
            <SurveyForm 
              step={step}
              onStepSubmit={handleStepSubmit}
              onComplete={handleSurveyComplete}
              isSubmitting={isSubmitting}
              initialData={surveyData}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SurveyFunnel;
