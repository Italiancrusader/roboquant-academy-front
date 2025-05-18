
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { trackEvent } from '@/utils/googleAnalytics';
import { trackLead } from '@/utils/metaPixel';
import { submitLead } from '@/services/leadService';
import { LoaderCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { TypeformEmbed } from '@/components/EnrollmentSurvey';

// Typeform embed ID - using the correct form ID from the URL
const TYPEFORM_ID = "Mxpdceu1";

const Quiz = () => {
  const [step, setStep] = useState<'questions' | 'completed'>('questions');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();
  
  // Track page view when component mounts
  useEffect(() => {
    // Track page view with both Google Analytics and gtag
    trackEvent('quiz_page_view', {
      event_category: 'Quiz',
      event_label: 'Quiz Page'
    });

    // Check for query parameters to show quiz directly
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('apply') === 'true') {
      navigate('/quiz');
    }
  }, [navigate]);
  
  // Function to handle typeform webhook results
  const handleTypeformSubmit = (data?: any) => {
    console.log('Typeform submitted successfully', data);
    
    // Extract user info from typeform responses if available
    if (data && data.form_response && data.form_response.answers) {
      // This would need to be customized based on the actual Typeform structure
      try {
        // Process any data from Typeform if needed
        const answers = data.form_response.answers;
        console.log('Typeform answers:', answers);
      } catch (error) {
        console.error('Error processing Typeform data:', error);
      }
    }
    
    // Show completed state
    setStep('completed');
    
    // Track completion event
    trackEvent('quiz_completed', {
      event_category: 'Quiz',
      event_label: userInfo.email || 'Unknown'
    });
  };
  
  const handleTypeformError = () => {
    console.error('Error loading Typeform');
    
    toast({
      title: "Survey Error",
      description: "There was an error loading the survey. Please refresh the page to try again.",
      variant: "destructive",
    });
  };
  
  // Preconnect to typeform domain
  useEffect(() => {
    const links = [
      { rel: 'preconnect', href: 'https://form.typeform.com', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://renderer-assets.typeform.com', crossOrigin: 'anonymous' }
    ];
    
    const elements = links.map(link => {
      const element = document.createElement('link');
      element.rel = link.rel;
      element.href = link.href;
      if (link.crossOrigin) element.crossOrigin = link.crossOrigin;
      document.head.appendChild(element);
      return element;
    });
    
    return () => {
      elements.forEach(element => {
        if (document.head.contains(element)) {
          document.head.removeChild(element);
        }
      });
    };
  }, []);

  // Debug the current step
  useEffect(() => {
    console.log('Current step:', step);
  }, [step]);
  
  // Implement a fallback redirect for when the form is completed
  useEffect(() => {
    if (step === 'completed') {
      // Add a fallback redirect timer as a safety measure
      const redirectTimeout = setTimeout(() => {
        console.log('Fallback redirect to book-call');
        navigate('/book-call');
      }, 3000);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [step, navigate]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-text">
            Apply For RoboQuant Academy
          </h1>
          
          {step === 'completed' ? (
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
                We're reviewing your information. You will be redirected based on your qualification status shortly.
              </p>
              <div className="w-full max-w-md mx-auto">
                <Progress value={100} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">Redirecting you to the next step...</p>
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
