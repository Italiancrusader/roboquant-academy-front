
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { BookOpen, Code, Compass } from 'lucide-react';

const featureItems = [
  {
    title: 'Interactive Learning',
    description: 'Engage with our dynamic trading simulations, quizzes, and real-time market analysis tools to apply concepts as you learn.',
    icon: <Code className="w-10 h-10 text-teal-primary mb-4" />
  },
  {
    title: 'Modular Curriculum',
    description: 'Progress through carefully structured learning paths from foundational concepts to advanced algorithmic strategies.',
    icon: <BookOpen className="w-10 h-10 text-teal-primary mb-4" />
  },
  {
    title: 'Structured Methodology',
    description: 'Follow our proven systematic approach to developing, testing, and deploying quantitative trading models.',
    icon: <Compass className="w-10 h-10 text-teal-primary mb-4" />
  },
];

const Features: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section 
      id="features" 
      className="section-padding"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Trading Excellence</span> Through Technology
          </h2>
          <p className="text-xl text-white-primary/80 max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with expert instruction to deliver an unparalleled learning experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureItems.map((item, index) => (
            <div 
              key={index}
              className={`glass-card p-8 rounded-2xl lift-on-hover ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {item.icon}
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-white-primary/70">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
