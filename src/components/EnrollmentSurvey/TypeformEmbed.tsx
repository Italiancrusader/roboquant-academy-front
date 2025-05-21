
import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { LoaderCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface TypeformEmbedProps {
  typeformId: string;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onSubmit: (data?: any) => void;
  onError: () => void;
}

const TypeformEmbed: React.FC<TypeformEmbedProps> = ({ 
  typeformId, 
  userInfo, 
  onSubmit, 
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
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
  }, [isLoading]);
  
  useEffect(() => {
    const container = document.getElementById('typeform-container');
    if (!container) return;
    
    // Clear existing container content
    container.innerHTML = '';
    
    // Create iframe with safeguards
    try {
      const iframe = document.createElement('iframe');
      iframe.id = 'typeform-iframe';
      
      // Build URL with hidden fields for contact information
      let typeformUrl = `https://form.typeform.com/to/${typeformId}?embed-hide-header=true&embed-hide-footer=true`;
      
      // Add hidden fields - this passes user info to Typeform
      if (userInfo.email) {
        typeformUrl += `&email=${encodeURIComponent(userInfo.email)}`;
      }
      if (userInfo.firstName) {
        typeformUrl += `&firstName=${encodeURIComponent(userInfo.firstName)}`;
      }
      if (userInfo.lastName) {
        typeformUrl += `&lastName=${encodeURIComponent(userInfo.lastName)}`;
      }
      if (userInfo.phone) {
        typeformUrl += `&phone=${encodeURIComponent(userInfo.phone)}`;
      }
      // Add full name if available (first and last name combined)
      if (userInfo.firstName && userInfo.lastName) {
        typeformUrl += `&name=${encodeURIComponent(`${userInfo.firstName} ${userInfo.lastName}`)}`;
      }
      
      console.log("Typeform URL with hidden fields:", typeformUrl);
      iframe.src = typeformUrl;
      
      // Set iframe attributes
      iframe.style.width = '100%';
      iframe.style.height = '650px';
      iframe.style.border = 'none';
      
      // Add sandbox attributes for security
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation');
      
      // Handle load events
      iframe.onload = () => {
        console.log('Typeform iframe loaded successfully');
        setIsLoading(false);
      };
      
      iframe.onerror = () => {
        console.error('Failed to load Typeform iframe');
        onError();
      };
      
      // Append iframe to container
      container.appendChild(iframe);
      
      // Set up message listener for Typeform submission events
      const messageHandler = (event: MessageEvent) => {
        // Only accept messages from Typeform domains
        if (event.origin.includes('typeform.com')) {
          try {
            console.log('Received message from Typeform:', event.data);
            
            let isSubmitEvent = false;
            let eventData = null;
            
            // Handle different message formats
            if (typeof event.data === 'string') {
              try {
                const data = JSON.parse(event.data);
                eventData = data;
                
                // Check for various submission event formats
                if (data.type === 'form-submit' || 
                    (data.eventName && data.eventName === 'form_submit') ||
                    (data.event && data.event === 'submit')) {
                  isSubmitEvent = true;
                }
              } catch (parseError) {
                // If it's not valid JSON, check for other event formats
                if (event.data.includes('form-submit') || event.data.includes('form_submit')) {
                  isSubmitEvent = true;
                }
              }
            } else if (event.data && typeof event.data === 'object') {
              eventData = event.data;
              // Handle object format events
              if (event.data.type === 'form-submit' || 
                  (event.data.eventName && event.data.eventName === 'form_submit') ||
                  (event.data.event && event.data.event === 'submit')) {
                isSubmitEvent = true;
              }
            }
            
            // Handle submission event
            if (isSubmitEvent) {
              console.log('Typeform submission detected!', eventData);
              
              // Show submission state
              setIsSubmitting(true);
              
              // Call the onSubmit callback with any available data
              onSubmit(eventData);
              
              // Show success toast
              toast({
                title: "Survey Completed",
                description: "Thank you for completing the qualification survey! We'll be in touch soon.",
              });
              
              // Process form data to determine capital amount
              const extractCapitalFromResponses = (data: any): string | null => {
                try {
                  // Try to extract from event data structure
                  if (data?.form_response?.answers) {
                    const capitalAnswer = data.form_response.answers.find(
                      (answer: any) => answer.field?.ref?.includes("bc58b7b4-c80f-4e7b-baf7-367a9b5cfa52")
                    );
                    if (capitalAnswer?.choice?.label) {
                      return capitalAnswer.choice.label;
                    }
                  }
                  return null;
                } catch (error) {
                  console.error('Error extracting capital from responses:', error);
                  return null;
                }
              };
              
              // Extract capital value
              const capitalValue = extractCapitalFromResponses(eventData);
              console.log('Extracted capital value:', capitalValue);
              
              // Determine qualification manually as a fallback
              const qualifyingCapitalValues = [
                "$5k-$10k", "$10k-$25k", "> $25k", 
                "$5,000-$10,000", "$10,000-$25,000", 
                "Over $25,000", "Over $25k"
              ];
              
              const nonQualifyingCapitalValues = [
                "< $1k", "$1k-$5k",
                "$0-$5,000", "$1,000-$5,000"
              ];
              
              const isQualified = capitalValue ? qualifyingCapitalValues.some(
                val => capitalValue.toLowerCase().includes(val.toLowerCase())
              ) : false;
              
              const isDisqualified = capitalValue ? nonQualifyingCapitalValues.some(
                val => capitalValue.toLowerCase() === val.toLowerCase()
              ) : false;
              
              console.log('Capital qualification check:', { 
                capitalValue, 
                isQualified, 
                isDisqualified 
              });
              
              // Inform the user about next steps
              setTimeout(() => {
                if (isDisqualified) {
                  toast({
                    title: "Your Application Has Been Processed",
                    description: "Check your email for your personalized enrollment options.",
                  });
                } else if (isQualified) {
                  toast({
                    title: "Congratulations! You qualify for a Strategy Call",
                    description: "Check your email for instructions on scheduling your call.",
                  });
                }
              }, 2000);
              
              // Make redirection decision based on capital value
              setTimeout(() => {
                if (isDisqualified) {
                  console.log('Redirecting to checkout (non-qualifying capital)');
                  navigate('/checkout');
                } else if (isQualified) {
                  console.log('Redirecting to book-call (qualifying capital)');
                  navigate('/book-call');
                } else {
                  // Default handling - rely on webhook results (fallback to checkout for safety)
                  console.log('Using default redirect to checkout');
                  navigate('/checkout');
                }
              }, 3500); // Extended delay to ensure proper visual feedback
            }
          } catch (error) {
            console.error('Error processing Typeform message:', error);
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      return () => {
        window.removeEventListener('message', messageHandler);
      };
    } catch (error) {
      console.error('Error setting up Typeform:', error);
      onError();
    }
  }, [typeformId, userInfo, onSubmit, onError, navigate]);
  
  return (
    <>
      {isLoading && (
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
      )}
      
      {isSubmitting && (
        <div className="flex flex-col items-center justify-center space-y-6 py-16">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">Processing your submission...</h3>
            <div className="w-full max-w-md mx-auto">
              <Progress value={75} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we analyze your responses</p>
            <p className="text-sm text-primary mt-4">Check your email for important next steps!</p>
          </div>
        </div>
      )}
      
      <div 
        id="typeform-container"
        className={`w-full min-h-[650px] ${isLoading || isSubmitting ? 'hidden' : 'block'}`}
      />
    </>
  );
};

export default TypeformEmbed;
