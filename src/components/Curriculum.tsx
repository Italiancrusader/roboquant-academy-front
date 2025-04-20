
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const curriculumModules = [
  {
    title: "Unit 1: Trading Foundations",
    description: "Master the essential concepts that form the foundation of algorithmic trading.",
    topics: [
      "Market mechanics and price action theory",
      "Identifying high-probability trading setups",
      "Risk management principles for algorithms",
      "Setting measurable performance objectives"
    ]
  },
  {
    title: "Unit 2: Strategy Discovery",
    description: "Learn how to transform manual trading ideas into algorithmic strategies.",
    topics: [
      "Converting discretionary rules to precise algorithms",
      "Entry and exit logic formulation",
      "Conditional logic and rule-based systems",
      "Filtering for optimal market conditions"
    ]
  },
  {
    title: "Unit 3: AI-assisted Coding",
    description: "Use our no-code tools to build your trading algorithms without programming.",
    topics: [
      "Using our drag-and-drop strategy builder",
      "Implementing technical indicators and filters",
      "Setting up custom alerts and notifications",
      "Configuring money management rules"
    ]
  },
  {
    title: "Unit 4: Back-testing & Optimization",
    description: "Validate your strategies with professional-grade back-testing.",
    topics: [
      "Historical data preparation and cleaning",
      "Walk-forward analysis methodology",
      "Avoiding over-optimization and curve-fitting",
      "Statistical validation of results"
    ]
  },
  {
    title: "Unit 5: Deployment & Scaling",
    description: "Take your strategies live and learn how to manage a portfolio of bots.",
    topics: [
      "Setting up reliable trading infrastructure",
      "MT4/MT5 and cTrader deployment walkthrough",
      "Monitoring live performance metrics",
      "Portfolio management across multiple bots"
    ]
  }
];

const Curriculum: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="curriculum" 
      className="section-padding bg-background"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Comprehensive <span className="gradient-text">Curriculum</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our five-unit program takes you from fundamentals to fully-deployed trading bots.
          </p>
        </div>
        
        <div className={`max-w-3xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <Accordion type="single" collapsible className="bg-card rounded-2xl shadow-lg border border-border/20 overflow-hidden">
            {curriculumModules.map((module, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/20 last:border-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-accent/50 text-left">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{module.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ul className="space-y-2 text-gray-300">
                    {module.topics.map((topic, i) => (
                      <li key={i} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-primary rounded-full mr-2 mt-2"></span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-12 text-center">
            <a href="#calculator">
              <Button className="cta-button text-white py-5 px-8">
                Calculate Your Savings <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Curriculum;
