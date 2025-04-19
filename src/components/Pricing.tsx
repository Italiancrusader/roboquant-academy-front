
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const features = [
  'Lifetime access to all course modules',
  'Interactive quizzes and assignments',
  'Trading simulation environment',
  'Real-time market data integration',
  'Private community access',
  'Strategy backtesting tools',
  'Certificate of completion',
  'Regular content updates',
];

const Pricing: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="pricing" 
      className="section-padding"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-xl text-white-primary/80 max-w-2xl mx-auto">
            One-time payment for lifetime access to all course materials.
          </p>
        </div>
        
        <div className={`max-w-xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="glass-card rounded-2xl p-8 md:p-10 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Lifetime Access</h3>
              <div className="text-right">
                <span className="text-white-primary/70 text-sm line-through">$1,999</span>
                <div className="text-3xl font-bold gradient-text">$1,499</div>
              </div>
            </div>
            
            <div className="h-px w-full bg-white/10 my-6"></div>
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-teal-primary mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity py-6 text-lg font-medium">
              Enroll Now
            </Button>
            <div className="text-center mt-4 text-white-primary/60 text-sm">
              Secure payment • 30-day money-back guarantee
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
