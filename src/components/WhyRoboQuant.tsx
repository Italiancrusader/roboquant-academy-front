
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote, Zap, Copy } from 'lucide-react';

const features = [
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
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Why <span className="gradient-text">RoboQuant Academy</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We turn manual traders into algorithm creators without the coding learning curve.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <div 
              key={index}
              className={`glass-card p-8 rounded-2xl ${
                isVisible ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
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

