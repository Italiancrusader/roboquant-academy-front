
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { trackEvent } from '@/utils/googleAnalytics';
import { trackLead } from '@/utils/metaPixel';
import { submitLead } from '@/services/leadService';
import LeadForm from '@/components/LeadForm';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Quiz = () => {
  const [step, setStep] = useState<'form' | 'redirect'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
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
      
      // Show success message
      toast({
        title: "Success!",
        description: "Your information has been submitted successfully.",
      });
      
      // Update state to show redirect options
      setStep('redirect');
      
      // Track completion
      trackEvent('quiz_lead_captured', {
        event_category: 'Quiz',
        event_label: values.email
      });
      
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
  
  // Navigate to Typeform survey (externally)
  const goToSurvey = () => {
    // Redirect to the external Typeform survey
    // Replace with your actual Typeform URL
    window.location.href = "https://form.typeform.com/to/01JTNA7K4WFXEEAEX34KT7NFR9";
  };
  
  // Skip survey and go directly to VSL
  const skipToVSL = () => {
    navigate('/vsl');
  };
  
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
                buttonText="Continue →"
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
            <div id="quiz-step-redirect" className="bg-card p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Thank You!</h2>
              <p className="mb-8 text-muted-foreground">
                Your information has been submitted successfully. You can now proceed to our qualification survey or go directly to watch our video.
              </p>
              
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Taking our qualification survey helps us determine if you're eligible for a personalized strategy call.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={goToSurvey} 
                  className="flex-1"
                  variant="default"
                >
                  Take Qualification Survey
                </Button>
                <Button 
                  onClick={skipToVSL} 
                  className="flex-1"
                  variant="outline"
                >
                  Skip to Video
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Quiz;
