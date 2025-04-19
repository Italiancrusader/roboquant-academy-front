
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Code, Award } from 'lucide-react';

const ctaItems = [
  {
    number: '01',
    title: 'Advanced AI Tools',
    description: 'Access proprietary algorithmic tools and AI-powered market analysis.',
    icon: <Code className="w-6 h-6 text-teal-primary" />
  },
  {
    number: '02',
    title: 'Expert Community',
    description: 'Join a thriving network of quantitative traders and industry experts.',
    icon: <Users className="w-6 h-6 text-teal-primary" />
  },
  {
    number: '03',
    title: 'Structured Learning Path',
    description: 'Follow our step-by-step roadmap from beginner to professional trader.',
    icon: <BookOpen className="w-6 h-6 text-teal-primary" />
  },
  {
    number: '04',
    title: 'Personal Mentorship',
    description: 'Get guidance from experienced quant traders to accelerate your progress.',
    icon: <Award className="w-6 h-6 text-teal-primary" />
  },
];

const CTA: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="cta" 
      className="section-padding relative bg-gradient-to-b from-charcoal to-charcoal/90 overflow-hidden"
      ref={ref as React.RefObject<HTMLElement>}
    >
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-blue-primary/20 to-transparent blur-[100px]"></div>
      </div>
      
      <div className="container mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">Transform</span> Your Trading?
          </h2>
          <p className="text-xl text-white-primary/80 max-w-2xl mx-auto">
            Join the elite community of quantitative traders who are consistently outperforming the market.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ctaItems.map((item, index) => (
            <div 
              key={index}
              className={`glass-card p-6 rounded-xl border border-white/10 relative ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold">
                {item.number}
              </div>
              <div className="mb-4 mt-2">{item.icon}</div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-white-primary/70 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6 px-10">
            Begin Your Journey Now
          </Button>
          <p className="mt-4 text-white-primary/60">Limited spots available for our next cohort</p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
