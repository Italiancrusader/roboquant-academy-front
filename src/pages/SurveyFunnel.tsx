
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SurveyForm from '@/components/EnrollmentSurvey/SurveyForm';
import { submitLead } from '@/services/leadService';

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
      
      // Submit lead data regardless of qualification
      await submitLead({
        name: combinedData.fullName,
        email: combinedData.email,
        phone: combinedData.phone || "",
        source: "enrollment_survey",
        leadMagnet: qualifiesForCall ? "strategy_call" : "course_enrollment"
      });
      
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
