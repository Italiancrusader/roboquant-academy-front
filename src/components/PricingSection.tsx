
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check, ArrowRight, Star, Loader2 } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '@/utils/googleAnalytics';

const PricingSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { ref, isVisible } = useIntersectionObserver();
  
  const handleApply = async () => {
    setIsLoading(true);
    try {
      // Track event
      trackEvent('pricing_apply_clicked', {
        event_category: 'Pricing',
        event_label: 'Apply Button'
      });

      // Navigate directly to quiz - Typeform is shown immediately
      navigate('/quiz');
    } catch (error) {
      console.error("Error navigating to quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section id="pricing" className="section-padding py-20 bg-gradient-to-b from-background to-secondary/50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Investment Options</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get lifetime access to RoboQuant Academy and join our weekly Q&A calls
          </p>
        </div>
        
        <div className={`max-w-lg mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <Card className="relative overflow-hidden backdrop-blur-sm border transition-all duration-300 hover:translate-y-[-8px] bg-gradient-to-br from-blue-primary/20 to-teal-primary/20 border-blue-primary/40 shadow-lg shadow-blue-primary/10">
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-blue-primary to-teal-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center">
                Lifetime Access
              </div>
            </div>
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl font-bold">RoboQuant Academy</CardTitle>
              <CardDescription className="text-sm text-gray-400 mt-2">
                Complete trading bot building program with ongoing support
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-2xl font-medium text-gray-400">$</span>
                  <span className="text-4xl font-bold gradient-text">1,497</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="text-teal-primary">One-time payment, lifetime access</span>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-teal-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-sm text-gray-300">Complete No-Code Bot Building Course</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-teal-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-sm text-gray-300">Weekly Live Q&A Calls</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-teal-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-sm text-gray-300">Lifetime Community Access</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-teal-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-sm text-gray-300">Advanced Strategy Templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-teal-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-sm text-gray-300">24/7 Access to Course Materials</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-teal-primary shrink-0 mt-0.5 mr-3" />
                  <span className="text-sm text-gray-300">Priority Support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button 
                onClick={handleApply}
                disabled={isLoading}
                className="w-full py-6 cta-button text-white"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center bg-card/80 backdrop-blur-sm py-3 px-5 rounded-lg border border-white/5">
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
              <span className="mx-2 text-gray-400">100% Satisfaction Guarantee</span>
              <span className="text-teal-primary">|</span>
              <span className="mx-2 text-gray-400">30-Day Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
