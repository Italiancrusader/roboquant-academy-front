
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trackViewContent } from '@/utils/metaPixel';

const BookCall = () => {
  useEffect(() => {
    // Track ViewContent event for booking page
    trackViewContent({
      content_name: 'Strategy Call Booking Page',
      content_category: 'consultation',
      content_type: 'booking_page'
    });

    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
            Book Your Strategy Call
          </h1>
          
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Schedule a personalized strategy session to discuss your trading goals and see if RoboQuant Academy is right for you.
          </p>
          
          <div className="bg-card rounded-lg shadow-md overflow-hidden">
            {/* Calendly inline widget embed */}
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/your-calendly-username/strategy-call" 
              style={{ minWidth: '320px', height: '700px' }}
            ></div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookCall;
