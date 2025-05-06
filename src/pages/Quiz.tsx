
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { trackEvent } from '@/utils/googleAnalytics';
import { trackLead } from '@/utils/metaPixel';
import { submitLead } from '@/services/leadService';

const Quiz = () => {
  const [step, setStep] = useState<'email' | 'questions'>('email');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Track email submission event
      trackEvent('lead_email_submit', {
        event_category: 'Quiz',
        event_label: email
      });
      
      trackLead({
        content_name: 'Quiz Lead',
        email: email
      });
      
      // Save lead in Supabase using our service
      const result = await submitLead({
        name: "Quiz Lead", 
        email: email,
        phone: "Not provided", 
        source: "quiz",
        leadMagnet: "application"
      });
      
      if (!result.success) {
        throw new Error(result.error || "Failed to save your information");
      }
      
      toast({
        title: "Success!",
        description: "Your email has been submitted. Please continue with the survey.",
      });
      
      // Proceed to questions
      setStep('questions');
    } catch (error: any) {
      console.error('Error submitting email:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error saving your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Set the correct Typeform URL with your actual form ID
  const typeformUrl = "https://form.typeform.com/to/YourTypeformID";
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-text">
            Apply For RoboQuant Academy
          </h1>
          
          {step === 'email' ? (
            <div id="quiz-step-email" className="bg-card p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Let's get started</h2>
              <p className="mb-8 text-muted-foreground">
                Enter your best email to start the application process and see if you qualify for our program.
              </p>
              
              <form id="leadEmailForm" onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="leadEmail" className="block text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="leadEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your best email"
                    className="w-full p-3 border border-input bg-background rounded-md"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Survey →"
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  We respect your privacy and will never share your email with third parties.
                </p>
              </form>
            </div>
          ) : (
            <div id="quiz-step-questions" className="bg-card p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Qualification Survey</h2>
              
              <iframe
                id="typeformEmbed"
                src={`${typeformUrl}?email=${encodeURIComponent(email)}`}
                frameBorder="0"
                className="w-full h-[650px] rounded-md"
                title="RoboQuant Qualification Survey"
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
