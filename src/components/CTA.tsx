
import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/utils/googleAnalytics';

const CTA: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleApplyNow = async () => {
    setIsLoading(true);
    
    try {
      // Track event
      trackEvent('apply_now_clicked', {
        event_category: 'CTA',
        event_label: 'Apply Now Button'
      });
      
      // Scroll to pricing section
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error scrolling to pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section 
      className="section-padding relative bg-gradient-to-r from-blue-primary to-teal-primary overflow-hidden"
      ref={ref as React.RefObject<HTMLElement>}
    >
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black/10 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full border-8 border-white/10"></div>
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full border-4 border-white/10"></div>
      </div>
      
      <div className="container mx-auto relative">
        <div className={`max-w-3xl mx-auto text-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to build profitable trading bots without writing code?
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Take our quick quiz to see if you qualify for RoboQuant Academy.
          </p>
          
          <Button 
            className="bg-white text-blue-primary hover:bg-gray-100 py-6 px-10 text-lg font-semibold"
            onClick={handleApplyNow}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          <p className="mt-6 text-white/80 text-sm">
            One-time payment • Lifetime access • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
