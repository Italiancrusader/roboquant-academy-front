
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Clock, Code, Terminal, BookOpen, FileText, Settings } from 'lucide-react';

const curriculumModules = [
  {
    title: "Introduction",
    description: "Start your journey",
    icon: Check,
    subModules: [
      { title: "Start Here!", duration: "2:35" }
    ]
  },
  {
    title: "Trading Basics",
    description: "Foundational knowledge to get started",
    icon: BookOpen,
    subModules: [
      { title: "Complete Beginner Course", duration: "1:40" },
      { title: "Setting Up Tradingview", duration: "13:32" }
    ]
  },
  {
    title: "Advanced Trading Concepts",
    description: "Deepen your understanding of the markets",
    icon: BookOpen,
    subModules: [
      { title: "Introduction", duration: "3:24" },
      { title: "The Market Is Fractal", duration: "8:07" },
      { title: "Liquidity Moves The Market", duration: "10:44" },
      { title: "The AMD Cycle", duration: "11:41" },
      { title: "Imbalances & Inversions", duration: "11:44" },
      { title: "Quick Knowledge Check", duration: null }
    ]
  },
  {
    title: "Pinescript Basics",
    description: "Introduction to scripting for automation",
    icon: Code,
    subModules: [
      { title: "Pinescript Basics Part 1", duration: "27:09" },
      { title: "Pinescript Resources", duration: null },
      { title: "Pinescript Basics Part 2", duration: "23:37" },
      { title: "Knowledge Check", duration: null }
    ]
  },
  {
    title: "Strategy Development",
    description: "Turning trading ideas into automated strategies",
    icon: Terminal,
    subModules: [
      { title: "Strategy Development Intro", duration: "6:06" },
      { title: "Turn Initial Idea Into an Indicator", duration: "9:02" },
      { title: "Coding a Simple Strategy", duration: "26:18" },
      { title: "Automated Backtesting", duration: "10:19" },
      { title: "Finalizing the Strategy", duration: "22:42" },
      { title: "Optimizing the Strategy", duration: "18:38" },
      { title: "Publishing on Tradingview", duration: "7:11" },
      { title: "Bonus Add Performance Table", duration: "4:07" },
      { title: "Knowledge Check", duration: null }
    ]
  },
  {
    title: "Tradingview Automation",
    description: "Automating strategies and processes",
    icon: Terminal,
    subModules: [
      { title: "Automated Futures Trading on Tradeovate", duration: "10:05" },
      { title: "Automated Crypto Trading", duration: "10:33" }
    ]
  },
  {
    title: "MT5 Expert Advisors",
    description: "Automation on advanced trading platforms",
    icon: Settings,
    subModules: [
      { title: "VPS Setup", duration: "4:23" },
      { title: "Getting Started with MT5", duration: "3:54" },
      { title: "What are Expert Advisors in Trading?", duration: "5:27" },
      { title: "The Different Type of Trading Bots", duration: "6:48" },
      { title: "Setting Up Your AI Code Assistant", duration: "5:39" },
      { title: "Which AI Model To Use", duration: "6:23" },
      { title: "Create Strategy Parameters and Prompt", duration: "5:03" },
      { title: "Producing Code", duration: "10:25" },
      { title: "Debugging Common Issues", duration: "12:19" },
      { title: "Version Control Basics", duration: "9:53" }
    ]
  },
  {
    title: "Python",
    description: "Using Python for advanced automation",
    icon: Code,
    subModules: [
      { title: "What is Python?", duration: null },
      { title: "When to use Python?", duration: null },
      { title: "Python Installation & Setup", duration: null },
      { title: "Setting Up Your Code Assistant", duration: null },
      { title: "Pulling & Processing Data from an API", duration: null },
      { title: "Sending Automated Messages", duration: null }
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
            A meticulously crafted journey from absolute beginner to algorithmic trading expert
          </p>
        </div>
        
        <div className={`max-w-4xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <Accordion type="single" collapsible className="bg-card rounded-2xl shadow-lg border border-border/20 overflow-hidden">
            {curriculumModules.map((module, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/20 last:border-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-accent/50 text-left">
                  <div className="flex items-center w-full">
                    <module.icon className="mr-4 w-8 h-8 text-blue-primary" />
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-foreground">{module.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ul className="space-y-2 text-gray-300">
                    {module.subModules.map((subModule, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-primary rounded-full mr-2"></span>
                          <span>{subModule.title}</span>
                        </div>
                        {subModule.duration && (
                          <span className="text-sm text-gray-500">{subModule.duration}</span>
                        )}
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
                Calculate Your Learning Path <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Curriculum;
