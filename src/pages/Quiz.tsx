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

// Typeform embed ID - using the correct form ID from the URL
const TYPEFORM_ID = "Mxpdceu1";

const Quiz = () => {
  const [step, setStep] = useState<'form' | 'questions' | 'completed'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTypeformLoading, setIsTypeformLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
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
      
      // Show success message with 3 second duration
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
  
  // Load and configure Typeform with improved error handling
  useEffect(() => {
    if (step === 'questions') {
      console.log('Loading Typeform...');
      
      // Create Typeform container first
      const typeformContainer = document.getElementById('typeform-container');
      if (!typeformContainer) return;
      
      // Clear existing container content
      typeformContainer.innerHTML = '';
      
      // Use iframe method with fallback for failed fetch errors
      const iframe = document.createElement('iframe');
      iframe.id = 'typeform-iframe';
      
      // Build the URL with hidden fields
      let typeformUrl = `https://form.typeform.com/to/${TYPEFORM_ID}?embed-hide-header=true&embed-hide-footer=true`;
      
      // Add hidden fields to URL if available
      if (userInfo.email) {
        typeformUrl += `&email=${encodeURIComponent(userInfo.email)}`;
        typeformUrl += `&firstName=${encodeURIComponent(userInfo.firstName)}`;
        typeformUrl += `&lastName=${encodeURIComponent(userInfo.lastName)}`;
        typeformUrl += `&phone=${encodeURIComponent(userInfo.phone)}`;
      }
      
      iframe.src = typeformUrl;
      
      // Set iframe attributes
      iframe.style.width = '100%';
      iframe.style.height = '650px';
      iframe.style.border = 'none';
      
      // Add sandbox attributes to improve security
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation');
      
      // Handle iframe load and error events
      iframe.onload = () => {
        console.log('Typeform iframe loaded');
        setIsTypeformLoading(false);
      };
      
      iframe.onerror = () => {
        console.error('Failed to load Typeform iframe');
        handleTypeformError();
      };
      
      // Append the iframe to the container
      typeformContainer.appendChild(iframe);
      
      // Set up a message listener to detect form submission
      const messageHandler = (event: MessageEvent) => {
        if (event.origin.includes('typeform.com')) {
          try {
            // Parse the data if it's a string
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            // Check for multiple possible event formats
            if (data.type === 'form-submit' || 
                (data.eventName && data.eventName === 'form_submit') ||
                (data.event && data.event === 'submit')) {
              handleTypeformSubmit(data);
            }
          } catch (error) {
            console.error('Error parsing message from Typeform:', error);
          }
        }
      };
      
      // Add event listener for messages
      window.addEventListener('message', messageHandler);
      
      // Fallback: Handle completion after timeout in case other methods fail
      const autoCompleteTimeout = setTimeout(() => {
        if (step === 'questions') {
          console.log('Auto-completing survey after timeout');
          handleTypeformSubmit();
        }
      }, 180000); // 3 minutes
      
      // Set additional fallback timeout for "Failed to fetch" errors
      const fetchErrorTimeout = setTimeout(() => {
        if (isTypeformLoading) {
          console.log('Typeform may have failed to load - checking status');
          // Check if there are any fetch errors in the console
          const iframe = document.getElementById('typeform-iframe') as HTMLIFrameElement;
          if (iframe && iframe.contentWindow) {
            try {
              // Check if we can access the iframe content
              if (!iframe.contentWindow.document) {
                handleTypeformError();
              }
            } catch (e) {
              // If we can't access the iframe content, there might be a CORS or loading issue
              handleTypeformError();
            }
          }
        }
      }, 15000); // 15 seconds
      
      // Cleanup function
      return () => {
        if (typeformContainer) {
          typeformContainer.innerHTML = '';
        }
        
        window.removeEventListener('message', messageHandler);
        clearTimeout(autoCompleteTimeout);
        clearTimeout(fetchErrorTimeout);
      };
    }
  }, [step, userInfo, navigate]);
  
  // Helper function to handle Typeform errors
  const handleTypeformError = () => {
    console.log('Handling Typeform error');
    setIsTypeformLoading(false);
    
    toast({
      title: "Survey Loading Issue",
      description: "We're having trouble loading the survey. You'll be directed to the next step automatically.",
      variant: "destructive",
    });
    
    // Wait 3 seconds, then auto-complete
    setTimeout(() => {
      handleTypeformSubmit({ qualifiesForCall: true });
    }, 3000);
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
              
              {/* Typeform container */}
              <div 
                id="typeform-container"
                className={`w-full min-h-[650px] ${isTypeformLoading ? 'hidden' : 'block'}`}
              >
                {/* Typeform iframe will be added here */}
              </div>
              
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
