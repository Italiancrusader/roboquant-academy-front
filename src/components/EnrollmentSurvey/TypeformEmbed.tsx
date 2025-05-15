
import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { LoaderCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
      
      // Build URL with hidden fields
      let typeformUrl = `https://form.typeform.com/to/${typeformId}?embed-hide-header=true&embed-hide-footer=true`;
      
      // Add hidden fields
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
      
      // Add sandbox attributes for security
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation');
      
      // Handle load events
      iframe.onload = () => {
        console.log('Typeform iframe loaded successfully');
        setIsLoading(false);
      };
      
      iframe.onerror = () => {
        console.error('Failed to load Typeform iframe');
        handleTypeformError();
      };
      
      // Append iframe to container
      container.appendChild(iframe);
      
      // Set up message handler
      const messageHandler = (event: MessageEvent) => {
        if (event.origin.includes('typeform.com')) {
          try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            // Check for various submission event formats
            if (data.type === 'form-submit' || 
                (data.eventName && data.eventName === 'form_submit') ||
                (data.event && data.event === 'submit')) {
              onSubmit(data);
            }
          } catch (error) {
            console.error('Error parsing Typeform message:', error);
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Set fallback timeout for failed loads that don't trigger onerror
      const fetchErrorTimeout = setTimeout(() => {
        if (isLoading) {
          console.log('Typeform may have failed to load - checking status');
          handleTypeformError();
        }
      }, 15000);
      
      // Fallback for completion
      const autoCompleteTimeout = setTimeout(() => {
        console.log('Auto-completing survey after timeout');
        onSubmit();
      }, 180000); // 3 minutes
      
      return () => {
        window.removeEventListener('message', messageHandler);
        clearTimeout(fetchErrorTimeout);
        clearTimeout(autoCompleteTimeout);
      };
    } catch (error) {
      console.error('Error setting up Typeform:', error);
      handleTypeformError();
    }
  }, [typeformId, userInfo]);
  
  const handleTypeformError = () => {
    setIsLoading(false);
    
    toast({
      title: "Survey Loading Issue",
      description: "We're having trouble loading the survey. You'll be directed to the next step automatically.",
      variant: "destructive",
    });
    
    // Wait 3 seconds, then notify parent
    setTimeout(() => {
      onError();
    }, 3000);
  };
  
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
      
      <div 
        id="typeform-container"
        className={`w-full min-h-[650px] ${isLoading ? 'hidden' : 'block'}`}
      />
    </>
  );
};

export default TypeformEmbed;
