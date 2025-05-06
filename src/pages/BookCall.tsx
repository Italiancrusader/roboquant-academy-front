
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check, Calendar } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { handleStripeCheckout } from '@/services/stripe';
import { trackEvent } from '@/utils/googleAnalytics';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const BookCall = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'deposit' | 'calendar'>('deposit');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if payment was successful
  useEffect(() => {
    if (searchParams.get('paid') === '1') {
      setStep('calendar');
      trackEvent('deposit_paid', {
        event_category: 'Payment',
        event_label: 'Call Deposit',
        value: 100
      });
    }
    
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [searchParams]);
  
  // Handle deposit payment
  const handlePayDeposit = async () => {
    setIsLoading(true);
    
    try {
      const userId = user ? user.id : undefined;
      const result = await handleStripeCheckout({
        courseId: 'call-deposit',
        courseTitle: 'Strategy Call Deposit',
        price: 100, // $100
        userId: userId,
        successUrl: window.location.origin + '/book-call?paid=1',
        cancelUrl: window.location.origin + '/book-call',
      });
      
      if (!result) {
        throw new Error("Failed to initiate checkout");
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Handle Calendly event
  const handleCalendlyEvent = (e: any) => {
    if (e.data.event === "calendly.event_scheduled") {
      trackEvent('call_booked', {
        event_category: 'Booking',
        event_label: 'Strategy Call'
      });
      
      toast({
        title: "Call Booked!",
        description: "Your strategy call has been scheduled. Check your email for details.",
        variant: "default"
      });
    }
  };
  
  // Listen for Calendly events
  useEffect(() => {
    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-text">
            Book Your Strategy Call
          </h1>
          
          <div className="bg-card p-8 rounded-lg shadow-lg">
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                <div className="flex items-center">
                  <div className={`rounded-full w-10 h-10 flex items-center justify-center ${step === 'deposit' ? 'bg-primary text-primary-foreground' : 'bg-primary-foreground text-primary'}`}>
                    {step === 'calendar' ? <Check className="h-5 w-5" /> : '1'}
                  </div>
                  <div className="w-16 h-1 bg-border"></div>
                  <div className={`rounded-full w-10 h-10 flex items-center justify-center ${step === 'calendar' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    2
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-center mb-2">
                {step === 'deposit' ? 'Step 1: Pay Seat Deposit' : 'Step 2: Schedule Your Call'}
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                {step === 'deposit' 
                  ? 'Secure your call with a $100 fully-refundable deposit'
                  : 'Choose a time that works best for your schedule'}
              </p>
            </div>
            
            {step === 'deposit' ? (
              <div className="text-center">
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Strategy Call Deposit</h3>
                    <p className="mb-2">$100 USD</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      100% refundable after your call
                    </p>
                    <Button 
                      onClick={handlePayDeposit}
                      className="w-full py-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay $100 Seat Deposit <Calendar className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">
                  Your deposit ensures commitment and is fully refunded after your call.
                </p>
              </div>
            ) : (
              <div id="calendlyWrap" className="min-h-[650px]">
                <div 
                  className="calendly-inline-widget" 
                  data-url="https://calendly.com/tim-hutter92/30min" 
                  style={{ minWidth: '320px', height: '650px' }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookCall;
