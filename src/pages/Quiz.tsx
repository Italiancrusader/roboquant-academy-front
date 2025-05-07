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
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const Quiz = () => {
  const [step, setStep] = useState<'form' | 'questions'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTypeformLoading, setIsTypeformLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Typeform embed ID from your code
  const typeformEmbedId = "01JTNA7K4WFXEEAEX34KT7NFR9";
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
        throw new Error(result.error || "Failed to save your information");
      }
      
      // Store user info for typeform hidden fields
      setUserInfo({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone
      });
      
      toast({
        title: "Success!",
        description: "Your information has been submitted. Please continue with the survey.",
      });
      
      // Proceed to questions
      setStep('questions');
    } catch (error: any) {
      console.error('Error submitting info:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error saving your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Simulate loading progress
  useEffect(() => {
    if (step === 'questions' && isTypeformLoading) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setLoadingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 150);
      
      return () => clearInterval(interval);
    }
  }, [step, isTypeformLoading]);
  
  // Load Typeform script when needed
  useEffect(() => {
    // Only load the script when on questions step
    if (step === 'questions') {
      const script = document.createElement('script');
      script.src = "//embed.typeform.com/next/embed.js";
      script.async = true;
      
      // Listen for when Typeform is fully loaded
      const checkTypeformLoaded = setInterval(() => {
        const typeformEmbed = document.querySelector('[data-tf-loaded="true"]');
        if (typeformEmbed) {
          setIsTypeformLoading(false);
          clearInterval(checkTypeformLoaded);
        }
      }, 300);
      
      document.body.appendChild(script);
      
      return () => {
        // Cleanup script and interval when component unmounts
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        clearInterval(checkTypeformLoaded);
      };
    }
  }, [step]);
  
  // Handle visibility check for Typeform container
  useEffect(() => {
    if (step === 'questions' && !isTypeformLoading) {
      // Additional check after Typeform is considered loaded
      const typeformInterval = setInterval(() => {
        const typeformEmbed = document.querySelector('.typeform-iframe');
        if (typeformEmbed) {
          setIsTypeformLoading(false);
          clearInterval(typeformInterval);
        }
      }, 500);
      
      return () => clearInterval(typeformInterval);
    }
  }, [step, isTypeformLoading]);
  
  // Handle performance optimization and cleanup
  useEffect(() => {
    // Preconnect to typeform domain to improve loading performance
    const cleanupPreconnect = preconnectToDomains(['https://embed.typeform.com']);
    
    return () => {
      // Clean up preconnect links when component unmounts
      cleanupPreconnect();
    };
  }, []);
  
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
          ) : (
            <div id="quiz-step-questions" className="bg-card p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Qualification Survey</h2>
              
              {isTypeformLoading ? (
                <div className="flex flex-col items-center justify-center space-y-6 py-16">
                  <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-3">Loading your survey...</h3>
                    <div className="w-full max-w-md mx-auto">
                      <Progress value={loadingProgress} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Please wait while we prepare your application survey</p>
                  </div>
                </div>
              ) : null}
              
              <div 
                data-tf-live={typeformEmbedId}
                className={`w-full min-h-[650px] ${isTypeformLoading ? 'hidden' : 'block'}`}
                data-tf-medium="snippet"
                data-tf-hidden={`email=${encodeURIComponent(userInfo.email)}&firstName=${encodeURIComponent(userInfo.firstName)}&lastName=${encodeURIComponent(userInfo.lastName)}&phone=${encodeURIComponent(userInfo.phone)}`}
              ></div>
              
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
