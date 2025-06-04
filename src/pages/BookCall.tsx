
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check, Calendar, Clock, User, FileCheck, Trophy, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { handleStripeCheckout } from '@/services/stripe';
import { trackEvent } from '@/utils/googleAnalytics';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const BookCall = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Track page view when component mounts
  useEffect(() => {
    trackEvent('book_call_page_view', {
      event_category: 'Booking',
      event_label: 'Strategy Call Page'
    });
    
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
  
  // Handle direct checkout without booking a call
  const handleDirectCheckout = async () => {
    setIsLoading(true);
    
    try {
      trackEvent('direct_checkout_from_call_page', {
        event_category: 'Checkout',
        event_label: 'Skip Call',
        value: 1500
      });
      
      const userId = user ? user.id : undefined;
      const result = await handleStripeCheckout({
        courseId: 'roboquant-academy',
        courseTitle: 'RoboQuant Academy',
        price: 1500, // $1,500
        userId: userId,
        successUrl: window.location.origin + '/thank-you',
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
            
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-lg font-medium mb-4 text-center">
                Prefer Immediate Access Without a Call?
              </h3>
              <div className="flex justify-center">
                <Button 
                  onClick={handleDirectCheckout}
                  className="py-6 px-8"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Instant Access <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Skip the call and get immediate access to the complete RoboQuant Academy for $1,500
              </p>
            </div>
          </div>
          
          <div className="bg-card p-8 rounded-lg shadow-md">
            <h3 className="font-semibold text-xl mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
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
                },
                {
                  q: "Can I get access without booking a call?",
                  a: "Yes, you can choose to skip the call and get immediate access to the full academy by clicking the 'Get Instant Access' button above."
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
