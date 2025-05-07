
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Unlock, Check, ArrowRight, ShieldCheck, BadgeCheck } from 'lucide-react';
import { trackEvent } from '@/utils/googleAnalytics';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Define interface for YouTube player
interface YouTubePlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  addEventListener: (event: string, listener: (e: any) => void) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (id: string, options: any) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        ENDED: number;
      };
    };
  }
}

const VSL = () => {
  const [watched, setWatched] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if user is qualified from URL parameter
  const isQualified = searchParams.get('qualified') === 'true';
  
  // If user is qualified, show them as having "watched" the video
  useEffect(() => {
    if (isQualified) {
      setWatched(true);
      
      trackEvent('qualified_viewer', {
        event_category: 'Qualification',
        event_label: 'Qualified via quiz'
      });
    }
  }, [isQualified]);
  
  // Load YouTube iframe API
  useEffect(() => {
    // Create script element
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    
    // Callback when API is ready
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('ytplayer', {
        events: {
          'onStateChange': onStateChange
        }
      });
      setPlayer(newPlayer);
    };
    
    // Append script to document
    document.head.appendChild(tag);
    
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);
  
  // Handle player state changes
  const onStateChange = (e: any) => {
    if (e.data === window.YT.PlayerState.PLAYING && player) {
      const duration = player.getDuration();
      const gatePercentage = 0.3; // 30% - Showing CTAs earlier for better conversion
      const gateTime = duration * gatePercentage;
      
      // Check progress every second
      const interval = setInterval(() => {
        if (player && player.getCurrentTime() >= gateTime && !watched) {
          setWatched(true);
          clearInterval(interval);
          
          // Track VSL watch milestone
          trackEvent('vsl_30_percent', {
            event_category: 'Video',
            event_label: 'VSL 30% Complete'
          });
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  };

  // Navigate to checkout page
  const handleCheckout = () => {
    trackEvent('vsl_direct_checkout', {
      event_category: 'Conversion',
      event_label: 'VSL Direct Checkout'
    });
    navigate('/checkout');
  };
  
  // Navigate to book call page
  const handleBookCall = () => {
    trackEvent('vsl_book_call', {
      event_category: 'Conversion',
      event_label: 'VSL Book Call'
    });
    navigate('/book-call');
  };
  
  // FAQ items for the accordion
  const faqItems = [
    {
      question: "Do I need coding experience to build trading bots?",
      answer: "No, RoboQuant Academy is specifically designed for traders with zero coding knowledge. Our no-code approach lets you build fully-automated trading bots without any programming experience."
    },
    {
      question: "How soon can I deploy my first trading bot?",
      answer: "Most students deploy their first trading bot within one week of starting the course, following our step-by-step methodology."
    },
    {
      question: "Which trading platforms are supported?",
      answer: "The course teaches you to build bots for MT4, MT5, TradingView, NinjaTrader, and is adaptable for any other platform."
    },
    {
      question: "Do you offer a money-back guarantee?",
      answer: "Yes, we offer a 30-day no-questions-asked money-back guarantee. If you're not completely satisfied, simply email our support team for a full refund."
    }
  ];
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center gradient-text">
            How To Build Profitable Trading Bots (Without Code)
          </h1>
          
          <p className="text-xl text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
            Join 1,200+ traders who have automated their strategies with RoboQuant Academy's proven system
          </p>
          
          {/* Video Container */}
          <div className="bg-card rounded-lg overflow-hidden shadow-2xl mb-12 border border-primary/20">
            <div className="aspect-video bg-black relative">
              <iframe 
                id="ytplayer"
                src="https://www.youtube-nocookie.com/embed/5QWLpAUv6r8?enablejsapi=1&rel=0"
                frameBorder="0" 
                allowFullScreen
                className="w-full h-full"
                title="RoboQuant VSL"
              ></iframe>
            </div>
            
            {/* CTA Section Below Video */}
            <div className="p-6 bg-gradient-to-br from-card to-card/90">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Get Instant Access to RoboQuant Academy
                </h2>
                
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 w-full max-w-2xl">
                  {[
                    "Build profitable bots without any coding",
                    "Deploy on MT4, MT5 & TradingView",
                    "Lifetime access to all materials",
                    "30-day money-back guarantee",
                    "Step-by-step video tutorials",
                    "Private community support"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="w-full max-w-md space-y-4">
                  <Button 
                    onClick={handleCheckout}
                    className="w-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground text-lg"
                  >
                    <ShieldCheck className="mr-2 h-5 w-5" /> 
                    Get Instant Access — $1,500
                  </Button>
                  
                  <Button 
                    onClick={handleBookCall}
                    className="w-full py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    <Unlock className="mr-2 h-5 w-5" /> 
                    Book a Free Strategy Call
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  One-time payment • Lifetime access • 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="mb-16">
            <h3 className="text-xl font-medium mb-6 text-center">Trusted by traders from</h3>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              {['JP Morgan', 'Goldman Sachs', 'BlackRock', 'Citadel', 'Interactive Brokers'].map((company, i) => (
                <div key={i} className="text-lg font-medium">{company}</div>
              ))}
            </div>
          </div>
          
          {/* Benefit Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "Ready-To-Use Bots",
                description: "Get access to proven trading strategies you can deploy immediately"
              },
              {
                title: "Step-By-Step Training",
                description: "Follow our clear process to build your own custom bots"
              },
              {
                title: "Lifetime Updates",
                description: "All future strategies and features included at no extra cost"
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <BadgeCheck className="mr-2 h-5 w-5 text-primary" />
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {/* Final CTA */}
          <div className="bg-card border border-primary/20 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to transform your trading?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Join RoboQuant Academy today and build your first profitable trading bot within days, even if you have no coding experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleCheckout}
                className="py-6 px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-lg"
              >
                Get Instant Access <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={handleBookCall}
                variant="outline"
                className="py-6 px-8"
              >
                Book a Free Strategy Call
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VSL;
