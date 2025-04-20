
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Terminal, BarChart4, AlertCircle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const outcomes = [
  {
    title: 'Launch MT4/MT5 & cTrader Bots',
    description: 'Build fully-automated trading systems for major platforms with our no-code approach.',
    icon: <Terminal className="w-10 h-10 text-teal-primary mb-4" />
  },
  {
    title: 'Back-test With Pro Workflows',
    description: 'Test your strategies against historical data with institutional-grade methodology.',
    icon: <BarChart4 className="w-10 h-10 text-teal-primary mb-4" />
  },
  {
    title: 'Avoid Fatal Algo-Trading Mistakes',
    description: 'Learn to sidestep the top 7 critical errors that sink most algorithmic traders.',
    icon: <AlertCircle className="w-10 h-10 text-teal-primary mb-4" />
  },
  {
    title: 'Deploy & Scale Your Systems',
    description: 'Put your bots into production and manage them efficiently as you scale.',
    icon: <Rocket className="w-10 h-10 text-teal-primary mb-4" />
  }
];

const CourseOutcomes: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section 
      id="outcomes" 
      className="section-padding bg-background"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            <span className="gradient-text">Course Outcomes</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform from manual trader to algorithm creator with these core skills.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {outcomes.map((item, index) => (
            <div 
              key={index}
              className={`glass-card p-8 rounded-2xl ${
                isVisible ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="bg-accent/50 w-20 h-20 flex items-center justify-center rounded-full mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
              <p className="text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 md:p-12 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold mb-4 text-white">Build & launch profitable trading bots — without writing code.</h3>
              <p className="text-gray-300 mb-6">
                Our step-by-step system has helped hundreds of traders automate their strategies, even with zero coding experience.
              </p>
            </div>
            <div className="md:w-1/3 text-center md:text-right">
              <a href="#curriculum">
                <Button className="cta-button text-white py-5 px-8">
                  See Full Curriculum <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseOutcomes;
