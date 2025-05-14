
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check, Calendar, Clock, User, FileCheck, Trophy } from 'lucide-react';
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
  
  // Debug info - logged on component load
  console.log("[BookCall] Component loaded", {
    currentUrl: window.location.href,
    searchParams: Object.fromEntries(searchParams.entries()),
    step: step
  });
  
  // Check if payment was successful
  useEffect(() => {
    console.log("[BookCall] useEffect running, checking URL parameters");
    
    if (searchParams.get('paid') === '1') {
      console.log("[BookCall] Paid parameter detected, setting step to calendar");
      setStep('calendar');
      trackEvent('deposit_paid', {
        event_category: 'Payment',
        event_label: 'Call Deposit',
        value: 100
      });
    }
    
    // Load Calendly widget script
    console.log("[BookCall] Loading Calendly widget");
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
    console.log("[BookCall] Pay deposit button clicked");
    setIsLoading(true);
    
    try {
      const userId = user ? user.id : undefined;
      console.log("[BookCall] Initiating checkout with user ID:", userId);
      
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
      console.error('[BookCall] Error during checkout:', error);
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
    console.log("[BookCall] Calendly event received:", e.data.event);
    
    if (e.data.event === "calendly.event_scheduled") {
      console.log("[BookCall] Call successfully booked");
      trackEvent('call_booked', {
        event_category: 'Booking',
        event_label: 'Strategy Call'
      });
      
      toast({
        title: "Call Booked!",
        description: "Your strategy call has been scheduled. Check your email for details.",
        variant: "default"
      });
      
      // Show confirmation message after booking
      const bookingConfirmation = document.getElementById('booking-confirmation');
      if (bookingConfirmation) {
        bookingConfirmation.classList.remove('hidden');
        bookingConfirmation.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  // Listen for Calendly events
  useEffect(() => {
    console.log("[BookCall] Setting up Calendly event listener");
    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center gradient-text">
            Book Your 1-on-1 Strategy Session
          </h1>
          
          <p className="text-xl text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Get personalized guidance on implementing profitable trading algorithms with our expert team
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                icon: <Clock className="h-8 w-8 text-primary mb-2" />,
                title: "30-Minute Deep Dive", 
                description: "Focused session analyzing your trading strategy and automation needs"
              },
              { 
                icon: <User className="h-8 w-8 text-primary mb-2" />,
                title: "Senior Strategist", 
                description: "Direct access to our experienced trading automation experts"
              },
              { 
                icon: <FileCheck className="h-8 w-8 text-primary mb-2" />,
                title: "Custom Action Plan", 
                description: "Leave with clear next steps to automate your trading"
              }
            ].map((item, i) => (
              <Card key={i} className="bg-card border border-border">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  {item.icon}
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="bg-card p-8 rounded-lg shadow-lg mb-8">
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
                {step === 'deposit' ? 'Step 1: Reserve Your Spot' : 'Step 2: Choose a Time That Works For You'}
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                {step === 'deposit' 
                  ? 'Secure your dedicated strategy session with a fully-refundable $100 deposit'
                  : 'Select a convenient time slot for your personalized consultation'}
              </p>
            </div>
            
            {step === 'deposit' ? (
              <div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-primary" />
                    What You'll Get From This Call:
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Expert assessment of your current trading strategy",
                      "Custom automation roadmap for your specific needs",
                      "Implementation timeline with clear next steps",
                      "Technical feasibility analysis of your strategy",
                      "Recommendations for your specific market and trading style"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1">Strategy Call Reservation</h3>
                        <p className="text-primary font-semibold text-xl mb-1">$100 USD</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">100% refundable</span> after your call
                        </p>
                      </div>
                      <Button 
                        onClick={handlePayDeposit}
                        className="py-6 px-8"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Reserve Your Call Now <Calendar className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-sm text-center text-muted-foreground space-y-2">
                  <p>The deposit ensures you're committed to the call and helps us prepare effectively for your session.</p>
                  <p>Your deposit is fully refunded immediately after your call is completed.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium mb-4">To Prepare For Your Call:</h3>
                  <ul className="space-y-3">
                    {[
                      "Have your trading strategy notes ready to share",
                      "Think about your goals for automation",
                      "Prepare questions about implementation challenges",
                      "Consider your budget and timeline constraints",
                      "Be ready to discuss your technical comfort level"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div id="calendlyWrap" className="mb-6">
                  <div 
                    className="calendly-inline-widget" 
                    data-url="https://calendly.com/tim-hutter92/30min" 
                    style={{ minWidth: '320px', height: '650px' }} 
                  />
                </div>
                
                <div id="booking-confirmation" className="hidden bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Your Call is Confirmed!</h3>
                  <p className="mb-4">Check your email for details and calendar invitation.</p>
                  <p className="text-sm text-muted-foreground">
                    We'll send a reminder 24 hours before your call with preparation instructions to make the most of your session.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-card p-8 rounded-lg shadow-md">
            <h3 className="font-semibold text-xl mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                {
                  q: "Why do I need to pay a deposit?",
                  a: "The deposit ensures you're serious about the call and helps us prepare properly. It's fully refunded after your call is completed."
                },
                {
                  q: "How long is the strategy session?",
                  a: "Each call is scheduled for 30 minutes with one of our senior trading automation strategists."
                },
                {
                  q: "What should I prepare before the call?",
                  a: "Have a basic outline of your trading strategy ready, and think about what you want to automate. Any specific challenges you're facing are helpful to discuss."
                },
                {
                  q: "What if I need to reschedule?",
                  a: "You can reschedule through the calendar link in your confirmation email up to 24 hours before the call."
                }
              ].map((item, i) => (
                <div key={i}>
                  <h4 className="font-medium mb-1">{item.q}</h4>
                  <p className="text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookCall;
