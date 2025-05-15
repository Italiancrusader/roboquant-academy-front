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
        throw new Error(result.error || "Failed to save your information");
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
        duration: 3000, // 3 seconds duration
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
        duration: 3000, // Also add 3 second duration for error messages
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
      
      // Determine if user qualifies based on submitted responses
      let isQualified = false;
      
      try {
        // Process the Typeform submission data
        console.log("[Quiz] Processing typeform submission data:", JSON.stringify(data));
        
        if (data) {
          // Check if the data includes qualification status directly
          if (typeof data.qualifiesForCall === 'boolean') {
            isQualified = data.qualifiesForCall;
            console.log("[Quiz] Using direct qualifiesForCall value:", isQualified);
          } 
          // Special handling for high capital values with multiple possible formats
          else if (data.tradingCapital === "> $25k" || 
                  data.tradingCapital === "> $250k" || 
                  data.tradingCapital === "Haa2tZ1srkPu") {
            isQualified = true;
            console.log("[Quiz] High capital value detected, setting qualified = true");
          }
          else if (data.answers) {
            // Process answers to determine qualification
            console.log("[Quiz] Checking answers:", JSON.stringify(data.answers));
            
            // Find trading capital answer
            const tradingCapitalAnswer = getAnswerByFieldName(data.answers, 'trading_capital');
            console.log("[Quiz] Trading capital from answers:", tradingCapitalAnswer);
            
            // Special case handling for high capital values
            if (tradingCapitalAnswer === "> $25k" || 
                tradingCapitalAnswer === "> $250k" || 
                tradingCapitalAnswer === "Haa2tZ1srkPu") {
              isQualified = true;
              console.log("[Quiz] High capital value detected in answers, setting qualified = true");
            } else {
              // Map Typeform value format to our application format
              let mappedTradingCapital = tradingCapitalAnswer;
              
              if (tradingCapitalAnswer === "< $1k") {
                mappedTradingCapital = "Under $1,000";
              } else if (tradingCapitalAnswer === "$1k-$5k") {
                mappedTradingCapital = "$1,000 – $5,000";
              } else if (tradingCapitalAnswer === "$5k-$10k") {
                mappedTradingCapital = "$5,000 – $10,000";
              } else if (tradingCapitalAnswer === "$10k-$25k" || tradingCapitalAnswer === "$10k-$250k") {
                mappedTradingCapital = "$10,000 – $250,000";
              } else if (tradingCapitalAnswer === "> $250k" || tradingCapitalAnswer === "> $25k") {
                mappedTradingCapital = "Over $250,000";
              }
              
              console.log("[Quiz] Mapped trading capital:", mappedTradingCapital);
              
              // Apply qualification logic directly
              isQualified = ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"].includes(mappedTradingCapital);
              console.log("[Quiz] Final qualification status:", isQualified);
            }
          }
        }
      } catch (error) {
        console.error('[Quiz] Error processing qualification data:', error);
        console.log('[Quiz] Falling back to default qualification: false');
        isQualified = false;
      }
      
      // If we encounter issues with the regular qualification flow, 
      // check URL parameters directly as a last resort
      const urlParams = new URLSearchParams(window.location.search);
      const urlQualified = urlParams.get('qualified');
      
      if (urlQualified === 'true') {
        console.log("[Quiz] Using URL parameter qualification override: true");
        isQualified = true;
      }
      
      setQualificationResult(isQualified);
      
      // Add error handling for the redirect with a more robust approach
      try {
        // Redirect to the appropriate page based on qualification with error handling
        setTimeout(() => {
          try {
            if (isQualified) {
              console.log("[Quiz] Redirecting to /book-call");
              navigate('/book-call');
            } else {
              console.log("[Quiz] Redirecting to /vsl?qualified=false");
              navigate('/vsl?qualified=false');
            }
          } catch (redirectError) {
            console.error("[Quiz] Error during redirect:", redirectError);
            // Emergency direct window location change as last resort
            window.location.href = isQualified ? '/book-call' : '/vsl?qualified=false';
          }
        }, 1500);
      } catch (redirectSetupError) {
        console.error("[Quiz] Error setting up redirect:", redirectSetupError);
        // Immediate emergency fallback
        window.location.href = isQualified ? '/book-call' : '/vsl?qualified=false';
      }
    }
  };
  
  // Helper function to extract answer by field name
  const getAnswerByFieldName = (answers: any[], fieldName: string): string => {
    if (!answers || !Array.isArray(answers)) return '';
    
    const answer = answers.find(a => 
      a.field && (a.field.id.includes(fieldName) || a.field.ref.includes(fieldName))
    );
    
    if (!answer) return '';
    
    // Extract value based on answer type
    if (answer.type === 'choice') {
      return answer.choice.label;
    } else if (answer.type === 'text') {
      return answer.text;
    } else if (answer.type === 'number') {
      return answer.number.toString();
    }
    
    return '';
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
  
  // Load and configure Typeform - improved approach to handle errors better
  useEffect(() => {
    if (step === 'questions') {
      console.log('Loading Typeform...');
      
      // Create Typeform container first
      const typeformContainer = document.getElementById('typeform-container');
      if (!typeformContainer) return;
      
      // Clear existing container content
      typeformContainer.innerHTML = '';
      
      try {
        // Enhanced iframe method with better error handling
        const iframe = document.createElement('iframe');
        iframe.id = 'typeform-iframe';
        
        // Build the URL with hidden fields
        let typeformUrl = `https://form.typeform.com/to/${TYPEFORM_ID}?embed-hide-header=true&embed-hide-footer=true`;
        
        // Add hidden fields to URL if available - with proper encoding
        if (userInfo.email) {
          typeformUrl += `&email=${encodeURIComponent(userInfo.email)}`;
          typeformUrl += `&firstName=${encodeURIComponent(userInfo.firstName)}`;
          typeformUrl += `&lastName=${encodeURIComponent(userInfo.lastName)}`;
          typeformUrl += `&phone=${encodeURIComponent(userInfo.phone)}`;
        }
        
        iframe.src = typeformUrl;
        
        // Set iframe attributes for better responsiveness
        iframe.style.width = '100%';
        iframe.style.height = '650px';
        iframe.style.border = 'none';
        iframe.allow = "camera; microphone; autoplay; encrypted-media; fullscreen;";
        
        // Handle iframe load event
        iframe.onload = () => {
          console.log('Typeform iframe loaded');
          setIsTypeformLoading(false);
        };
        
        iframe.onerror = () => {
          console.error('Failed to load Typeform iframe');
          toast({
            title: "Error",
            description: "Failed to load the survey. Please refresh the page and try again.",
            variant: "destructive",
            duration: 3000,
          });
        };
        
        // Append the iframe to the container
        typeformContainer.appendChild(iframe);
        
        // Set up a message listener to detect form submission with enhanced error handling
        const messageHandler = (event: MessageEvent) => {
          // Make sure the origin check is robust (could be any typeform domain)
          if (event.origin.includes('typeform.com')) {
            try {
              // Parse the data if it's a string
              let data = event.data;
              if (typeof event.data === 'string') {
                try {
                  data = JSON.parse(event.data);
                } catch (parseError) {
                  // If it fails to parse, keep as string
                }
              }
              
              // Check if the form was submitted - look for multiple possible event formats
              if ((typeof data === 'object' && 
                  (data.type === 'form-submit' || 
                   (data.eventName && data.eventName === 'form_submit') ||
                   (data.event && data.event === 'submit')))) {
                console.log('Typeform submission detected via postMessage:', data);
                handleTypeformSubmit(data);
              }
            } catch (error) {
              console.error('Error handling message from Typeform:', error);
            }
          }
        };
        
        // Add event listener for messages
        window.addEventListener('message', messageHandler);
        
        // Handle automatic completion after 5 minutes in case other methods fail
        const autoCompleteTimeout = setTimeout(() => {
          // If still on questions step after 5 minutes, assume completion
          if (step === 'questions') {
            console.log('Auto-completing survey after timeout');
            handleTypeformSubmit();
          }
        }, 300000); // 5 minutes
        
        // Cleanup function
        return () => {
          window.removeEventListener('message', messageHandler);
          clearTimeout(autoCompleteTimeout);
        };
      } catch (setupError) {
        console.error('Error setting up Typeform:', setupError);
        
        // Fallback to manual completion after 10 seconds if iframe setup fails
        setTimeout(() => {
          if (step === 'questions') {
            console.log('Triggering fallback completion due to setup error');
            handleTypeformSubmit();
          }
        }, 10000);
        
        setIsTypeformLoading(false);
        toast({
          title: "Survey Loading Issue",
          description: "We're experiencing technical difficulties. Please continue to the next step.",
          duration: 5000,
        });
      }
    }
  }, [step, userInfo, navigate]);
  
  // Handle performance optimization
  useEffect(() => {
    // Preconnect to typeform domain to improve loading performance
    const cleanupPreconnect = preconnectToDomains(['https://form.typeform.com']);
    
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
