
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check, ArrowRight, Star, Trophy } from 'lucide-react';
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

      // Navigate to quiz
      navigate('/quiz');
    } catch (error) {
      console.error("Error navigating to quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pricingPlans = [
    {
      name: "Self-Paced",
      price: "997",
      originalPrice: "1,997",
      description: "Perfect for independent traders who want to learn at their own pace.",
      features: [
        "Complete No-Code Bot Building Course",
        "24/7 Access to Course Materials",
        "Practice Exercises & Templates",
        "6 Months Community Access",
        "Basic Strategy Library",
      ],
      mostPopular: false,
      buttonLabel: "Get Started",
    },
    {
      name: "Premium",
      price: "1,997",
      originalPrice: "3,997",
      description: "Our most popular option with personalized guidance and support.",
      features: [
        "Everything in Self-Paced",
        "1-on-1 Strategy Session",
        "Expert Code Reviews",
        "Priority Support",
        "Advanced Strategy Templates",
        "Lifetime Community Access",
      ],
      mostPopular: true,
      buttonLabel: "Apply Now",
    },
    {
      name: "VIP Mentorship",
      price: "4,997",
      originalPrice: "9,997",
      description: "For serious traders who want direct mentorship and fastest results.",
      features: [
        "Everything in Premium",
        "Weekly 1-on-1 Coaching (3 months)",
        "Custom Strategy Development",
        "Direct Message Access to Instructor",
        "Exclusive VIP Workshops",
        "Commercial EA Distribution Rights",
      ],
      mostPopular: false,
      buttonLabel: "Apply Now",
    }
  ];
  
  return (
    <section id="pricing" className="section-padding py-20 bg-gradient-to-b from-background to-secondary/50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Investment Options</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your trading goals and learning style
          </p>
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden backdrop-blur-sm border transition-all duration-300 hover:translate-y-[-8px] ${
                plan.mostPopular 
                  ? 'bg-gradient-to-br from-blue-primary/20 to-teal-primary/20 border-blue-primary/40 shadow-lg shadow-blue-primary/10' 
                  : 'bg-gradient-to-br from-card/90 to-secondary/70 border-white/5'
              }`}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-blue-primary to-teal-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center">
                    <Trophy className="w-3 h-3 mr-1" /> Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-gray-400 mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-2xl font-medium text-gray-400">$</span>
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="line-through">${plan.originalPrice}</span>
                    <span className="ml-2 text-teal-primary">Save 50%</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-teal-primary shrink-0 mt-0.5 mr-3" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button 
                  onClick={handleApply}
                  disabled={isLoading}
                  className={`w-full py-6 ${
                    plan.mostPopular
                      ? 'cta-button text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <ArrowRight className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {plan.buttonLabel} <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center bg-card/80 backdrop-blur-sm py-3 px-5 rounded-lg border border-white/5">
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
              <span className="mx-2 text-gray-400">100% Satisfaction Guarantee</span>
              <span className="text-teal-primary">|</span>
              <span className="mx-2 text-gray-400">14-Day Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
