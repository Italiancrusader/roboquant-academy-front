
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const curriculumModules = [
  {
    title: 'Foundations of Quantitative Finance',
    description: 'Build a solid understanding of financial markets, statistics, and programming fundamentals necessary for quantitative trading.',
    topics: ['Market Mechanics', 'Statistical Analysis', 'Python for Finance', 'Data Structures']
  },
  {
    title: 'Strategy Development & Backtesting',
    description: 'Learn to design algorithmic strategies and rigorously test them against historical data to validate performance.',
    topics: ['Strategy Design Patterns', 'Backtesting Frameworks', 'Overfitting Prevention', 'Performance Metrics']
  },
  {
    title: 'Risk Management & Portfolio Construction',
    description: 'Master advanced techniques to manage risk and optimize portfolio allocation for consistent returns.',
    topics: ['Position Sizing', 'Risk Metrics', 'Portfolio Optimization', 'Diversification Strategies']
  },
  {
    title: 'Algorithmic Execution & Implementation',
    description: 'Deploy your trading systems in live markets with efficient execution algorithms and infrastructure.',
    topics: ['Execution Algorithms', 'API Integration', 'Latency Optimization', 'Infrastructure Setup']
  },
];

const Curriculum: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="curriculum" 
      className="section-padding"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive <span className="gradient-text">Curriculum</span>
          </h2>
          <p className="text-xl text-white-primary/80 max-w-2xl mx-auto">
            Our meticulously structured program takes you from fundamentals to mastery.
          </p>
        </div>
        
        <div className="space-y-12">
          {curriculumModules.map((module, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="md:w-1/2">
                <div className="h-1 w-20 bg-gradient-primary rounded mb-4"></div>
                <h3 className="text-2xl font-bold mb-3">{module.title}</h3>
                <p className="text-white-primary/70 mb-4">{module.description}</p>
              </div>
              <div className="md:w-1/2 glass-card p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-3 gradient-text">Key Topics</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {module.topics.map((topic, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-teal-primary rounded-full mr-2"></span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Curriculum;
