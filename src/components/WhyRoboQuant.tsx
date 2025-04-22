
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote, Zap, Copy, HelpCircle } from 'lucide-react';

const features = [
  {
    title: 'No Prior Trading or Coding Experience Required',
    description: 'We guide you from absolute basics—learn, develop, and automate trading strategies even if you have never traded manually or coded before.',
    icon: <HelpCircle className="w-12 h-12 text-blue-primary" />
  },
  {
    title: 'No Dev Hire Fees',
    description: 'Save $10k+ per project by building trading bots yourself without hiring expensive developers.',
    icon: <Banknote className="w-12 h-12 text-blue-primary" />
  },
  {
    title: 'Faster to Market',
    description: 'Take your trading idea from concept to live bot in less than one week, not months.',
    icon: <Zap className="w-12 h-12 text-blue-primary" />
  },
  {
    title: 'Scale Unlimited Strategies',
    description: 'Clone, tweak, and deploy as many strategies as you want without additional development costs.',
    icon: <Copy className="w-12 h-12 text-blue-primary" />
  },
];

const WhyRoboQuant: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section 
      id="why" 
      className="section-padding bg-background"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-16">
          <span className="inline-block bg-blue-primary/80 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
            No Prior Trading or Coding Experience Required
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
            Why <span className="gradient-text">RoboQuant Academy</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto text-center">
            We turn aspiring traders and beginners into algorithm creators—no manual trading or programming background needed. You'll learn to discover, build, and even license profitable bots, all shown step-by-step.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <div 
              key={index}
              className={`glass-card p-8 rounded-2xl ${
                isVisible ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 180}ms` }}
            >
              <div className="bg-accent/50 w-20 h-20 flex items-center justify-center rounded-full mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
              <p className="text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a href="#outcomes">
            <Button className="cta-button text-white py-5 px-8">
              See What You'll Learn <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyRoboQuant;

