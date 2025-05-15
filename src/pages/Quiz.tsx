
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { trackEvent } from '@/utils/googleAnalytics';
import { trackLead } from '@/utils/metaPixel';
import { submitLead } from '@/services/leadService';
import { preconnectToDomains } from '@/utils/performance';
import LeadForm from '@/components/LeadForm';
import { LoaderCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { TypeformEmbed } from '@/components/EnrollmentSurvey';

// Typeform embed ID - using the correct form ID from the URL
const TYPEFORM_ID = "Mxpdceu1";

const Quiz = () => {
  const [step, setStep] = useState<'form' | 'questions' | 'completed'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qualificationResult, setQualificationResult] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const handleLeadSubmit = async (values: { firstName: string, lastName: string, email: string, phone: string }) => {
    setIsSubmitting(true);
    
    try {
      // Track email submission event
      trackEvent('lead_email_submit', {
        event_category: 'Quiz',
        event_label: values.email
      });
      
      trackLead({
        content_name: 'Quiz Lead',
        email: values.email
      });
      
      // Save lead in Supabase using our service
      const fullName = `${values.firstName} ${values.lastName}`;
      const result = await submitLead({
        name: fullName,
        email: values.email.toLowerCase().trim(),
        phone: values.phone,
        source: "quiz",
        leadMagnet: "application_quiz",
        metadata: { 
          submission_date: new Date().toISOString(),
          entry_point: "quiz_page",
          firstName: values.firstName,
          lastName: values.lastName
        }
      });
      
      if (!result.success) {
        // Even on error, continue to typeform for better UX
        console.warn("Failed to save lead, but continuing to quiz:", result.error);
      }
      
      // Store user info for typeform hidden fields
      setUserInfo({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone
      });
      
      // Show success message
      toast({
        title: "Success!",
        description: "Your information has been submitted. Please continue with the survey.",
        duration: 3000,
      });
      
      // Proceed to questions
      setStep('questions');
      console.log('Step changed to questions, will load Typeform now');
      
    } catch (error: any) {
      console.error('Error submitting info:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error saving your information. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form completion - detect both manual and automatic completion
  const handleTypeformSubmit = (data?: any) => {
    console.log('Typeform submitted successfully', data);
    
    // Only proceed if not already completed
    if (step !== 'completed') {
      setStep('completed');
      
      // Track completion event
      trackEvent('quiz_completed', {
        event_category: 'Quiz',
        event_label: userInfo.email || 'Unknown'
      });
      
      // Determine qualification with fallbacks
      let isQualified = false;
      
      try {
        if (data && typeof data.qualifiesForCall === 'boolean') {
          // Use the value from the webhook response
          isQualified = data.qualifiesForCall;
        } else {
          // Default to qualified for better user experience if there was an error
          isQualified = true;
          console.log("No qualification data available, defaulting to qualified");
        }
      } catch (error) {
        console.error('Error processing qualification data:', error);
        isQualified = true; // Default to qualified on error for better user experience
      }
      
      setQualificationResult(isQualified);
      
      // Redirect with a small delay to show completion UI
      setTimeout(() => {
        const redirectPath = isQualified ? '/book-call' : '/vsl?qualified=false';
        navigate(redirectPath);
      }, 1500);
    }
  };
  
  const handleTypeformError = () => {
    console.log('Handling Typeform error - proceeding to next step');
    
    // If there's an error loading the typeform, we'll just consider the user qualified
    // This provides better UX than failing completely
    handleTypeformSubmit({ qualifiesForCall: true });
  };
  
  // Handle performance optimization
  useEffect(() => {
    // Preconnect to typeform domain to improve loading performance
    const cleanupPreconnect = preconnectToDomains(['https://form.typeform.com', 'https://renderer-assets.typeform.com']);
    
    return () => {
      cleanupPreconnect();
    };
  }, []);

  // Debug the current step
  useEffect(() => {
    console.log('Current step:', step);
  }, [step]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-text">
            Apply For RoboQuant Academy
          </h1>
          
          {step === 'form' ? (
            <div id="quiz-step-form" className="bg-card p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Let's get started</h2>
              <p className="mb-8 text-muted-foreground">
                Please fill in your details below to start the application process and see if you qualify for our program.
              </p>
              
              <LeadForm 
                onSubmit={handleLeadSubmit}
                buttonText="Start Survey →"
                source="quiz"
                leadMagnet="application_quiz"
                isSubmitting={isSubmitting}
                splitName={true}
              />
              
              <p className="text-xs text-center text-muted-foreground mt-6">
                We respect your privacy and will never share your information with third parties.
              </p>
            </div>
          ) : step === 'completed' ? (
            <div id="quiz-step-completed" className="bg-card p-8 rounded-lg shadow-lg text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-4">Thank You For Completing The Survey!</h2>
              <p className="mb-8 text-muted-foreground">
                We're reviewing your information and will redirect you to {qualificationResult ? 'book a strategy call' : 'the next step'} shortly.
              </p>
              <div className="w-full max-w-md mx-auto">
                <Progress value={100} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">Redirecting you in a moment...</p>
            </div>
          ) : (
            <div id="quiz-step-questions" className="bg-card p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Qualification Survey</h2>
              
              <TypeformEmbed 
                typeformId={TYPEFORM_ID}
                userInfo={userInfo}
                onSubmit={handleTypeformSubmit}
                onError={handleTypeformError}
              />
              
              <p className="text-xs mt-4 text-center text-muted-foreground">
                This information helps us determine if you're a good fit for our program.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Quiz;
