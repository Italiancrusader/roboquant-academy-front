
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Terminal, Code, AlertCircle, Rocket, Briefcase, Users, TrendingUp, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const outcomes = [
  {
    title: 'MT4/MT5 Bot Development',
    description: 'Create advanced trading bots for MetaTrader 4 and 5 platforms.',
    icon: <Terminal className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'PineScript Strategy Creation',
    description: 'Design and implement trading strategies using TradingView\'s PineScript language.',
    icon: <Code className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'cTrader & NinjaTrader Bots',
    description: 'Develop automated trading systems for cTrader and NinjaTrader platforms.',
    icon: <Rocket className="w-10 h-10 text-teal-primary" />
  },
  {
    title: 'Multi-Platform Bot Strategy',
    description: 'Learn to adapt and deploy bots across different trading platforms.',
    icon: <AlertCircle className="w-10 h-10 text-teal-primary" />
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
