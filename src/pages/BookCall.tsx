
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '@/components/ui/card';

const BookCall = () => {
  // Load Calendly widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-neulis">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Book Your Strategy Call</h1>
          
          <Card className="overflow-hidden mb-8">
            <CardContent className="p-0">
              {/* Calendly inline widget */}
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/tim-hutter92/30min" 
                style={{ minWidth: '320px', height: '700px' }} 
              />
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Having trouble scheduling? Contact us at support@roboquant.io</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCall;
