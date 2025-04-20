
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from 'lucide-react';

const features = [
  'Lifetime access to all course modules',
  'Interactive no-code bot builder',
  'MT4/MT5 & cTrader compatibility',
  'Professional back-testing suite',
  'Strategy optimization tools',
  'Private community access',
  '60+ pre-built strategy templates',
  '14-day money-back guarantee',
];

const Pricing: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="pricing" 
      className="section-padding bg-background"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            <span className="gradient-text">Pricing & Guarantee</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            One-time payment for lifetime access to all course materials.
          </p>
        </div>
        
        <div className={`max-w-xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="glass-card p-8 md:p-10 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-primary to-teal-primary text-white py-1 px-6 transform translate-x-8 translate-y-4 rotate-45">
              <span className="text-sm font-bold">Save $500</span>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-foreground">RoboQuant Academy</h3>
              <div className="text-right">
                <span className="text-gray-400 text-sm line-through">$1,997</span>
                <div className="text-3xl font-bold gradient-text">$1,497</div>
                <div className="text-sm text-gray-400">one-time payment</div>
              </div>
            </div>
            
            <div className="h-px w-full bg-border/20 my-6"></div>
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-teal-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button className="w-full cta-button text-white py-6 text-lg font-medium">
              Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="text-center mt-4 text-gray-400 text-sm flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Secure payment • 14-day money-back guarantee
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-card rounded-xl border border-border/20">
            <h4 className="font-bold text-lg mb-2 text-foreground">Our Risk-Free Guarantee</h4>
            <p className="text-gray-300">
              If you're not completely satisfied with the course within 14 days of purchase, simply email us for a full refund, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
