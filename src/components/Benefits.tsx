
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const stats = [
  { number: '95%', text: 'Course Completion Rate' },
  { number: '87%', text: 'Students Report Performance Improvement' },
  { number: '24/7', text: 'Access to Learning Materials' },
  { number: '250+', text: 'Hours of Expert Content' },
];

const benefits = [
  {
    title: 'Proven Trading Strategies',
    description: 'Learn battle-tested quantitative approaches with documented results across various market conditions.'
  },
  {
    title: 'Institutional Knowledge',
    description: 'Access trading techniques previously only available to professional fund managers and institutional traders.'
  },
  {
    title: 'Community Support',
    description: 'Join a thriving community of fellow quant traders to share insights, strategies and support.'
  },
];

const Benefits: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="benefits" 
      className="section-padding bg-gradient-to-b from-charcoal to-charcoal/80"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">RoboQuant Academy</span>
          </h2>
          <p className="text-xl text-white-primary/80 max-w-2xl mx-auto">
            Our program is designed to transform you into a systematic, data-driven trader.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`text-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">{stat.number}</h3>
              <p className="text-white-primary/80">{stat.text}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className={`glass-card p-8 rounded-2xl ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${300 + index * 200}ms` }}
            >
              <div className="h-1 w-20 bg-gradient-primary rounded mb-6"></div>
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-white-primary/70">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
