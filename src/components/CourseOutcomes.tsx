
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Terminal, BarChart4, AlertCircle, Rocket, Briefcase, Users, TrendingUp, GraduationCap, Code, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight, HelpCircle } from 'lucide-react';

const outcomes = [
  {
    title: 'Develop Profitable Bots (Even If You’re Brand New)',
    description: 'Learn from scratch—no manual strategy, no coding background needed. We show you how to discover, design, and automate winning trading strategies.',
    icon: <HelpCircle className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Build Bots Across Multiple Trading Platforms',
    description: 'Create automated trading systems for MetaTrader 4/5, TradingView, NinjaTrader, and adaptable to any other platform.',
    icon: <Terminal className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Back-test With Pro Workflows',
    description: 'Test your strategies against historical data with institutional-grade methodology.',
    icon: <BarChart4 className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Avoid Fatal Algo-Trading Mistakes',
    description: 'Learn to sidestep the top 7 critical errors that sink most algorithmic traders.',
    icon: <AlertCircle className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Deploy & Scale Your Systems',
    description: 'Put your bots into production and manage them efficiently as you scale.',
    icon: <Rocket className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Freelance Bot Development',
    description: 'Sell your bot creation skills by working as a freelancer for clients worldwide.',
    icon: <Briefcase className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Create Bot Business',
    description: 'Build and sell trading robots with licensing, creating a scalable digital product.',
    icon: <Users className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Get Ready-to-Use Bots & Source Code',
    description: 'Access real-world bot examples, source code, and practical tools you can use or deploy immediately.',
    icon: <FileText className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Quant Trading Career',
    description: 'Begin your journey towards a professional career in quantitative trading.',
    icon: <TrendingUp className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Advanced Trading Education',
    description: 'Continue studying to potentially work in banks, hedge funds, or financial institutions.',
    icon: <GraduationCap className="w-10 h-10 text-teal-primary" />
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
        <div className="flex flex-col items-center mb-16">
          <span className="inline-block bg-blue-primary/80 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
            Anyone Can Learn: No Prior Experience Required
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
            <span className="gradient-text">Course Outcomes</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto text-center">
            Transform from total beginner to algorithm creator. We guide you through every step—from your first strategy to scaling and selling fully automated trading bots, even if you've never traded manually.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {outcomes.map((item, index) => (
            <div 
              key={index}
              className={`glass-card p-8 rounded-2xl ${
                isVisible ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
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
                Our step-by-step system has helped hundreds of traders and complete beginners automate strategies and deploy working bots—no prior experience needed.
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

