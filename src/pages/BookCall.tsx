
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
          
          <div className="bg-card p-8 rounded-lg shadow-md">
            <iframe
              src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jGkdGGnC_FlCx8U8t1hQXrK4Z7TiYaHlEDH5mV6F7UQP8pjBvdZj5jZV5Z5Z5Z5Z5"
              style={{ border: 0 }}
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="no"
              title="Book Strategy Call"
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookCall;
