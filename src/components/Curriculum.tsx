
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
    status: "100% Complete",
    description: "An overview of the program and how to proceed.",
    icon: Check,
    subModules: [
      { title: "Welcome & Orientation", duration: "2:35" }
    ]
  },
  {
    title: "Trading Basics",
    status: "0% Complete",
    description: "Foundational knowledge to get started.",
    icon: BookOpen,
    subModules: [
      { title: "Beginner's Guide", duration: "1:40" },
      { title: "Platform Setup", duration: "13:32" }
    ]
  },
  {
    title: "Advanced Trading Concepts",
    status: "0% Complete",
    description: "Deepen your understanding of the markets.",
    icon: BookOpen,
    subModules: [
      { title: "Advanced Introduction", duration: "3:24" },
      { title: "Market Structure Concepts", duration: "8:07" },
      { title: "Liquidity & Movement", duration: "10:44" },
      { title: "Cycles In The Market", duration: "11:41" },
      { title: "Imbalance & Reversals", duration: "11:44" },
      { title: "Knowledge Check", duration: null }
    ]
  },
  {
    title: "Pine Script Fundamentals",
    status: "0% Complete",
    description: "Introduction to scripting for automation.",
    icon: Code,
    subModules: [
      { title: "Scripting Basics Part 1", duration: "27:09" },
      { title: "Resources Overview", duration: null },
      { title: "Scripting Basics Part 2", duration: "23:37" },
      { title: "Knowledge Check", duration: null }
    ]
  },
  {
    title: "Strategy Development",
    status: "0% Complete",
    description: "Turning trading ideas into automated strategies.",
    icon: Terminal,
    subModules: [
      { title: "Module Introduction", duration: "6:06" },
      { title: "From Idea to Indicator", duration: "9:02" },
      { title: "Strategy Coding", duration: "26:18" },
      { title: "Automated Testing", duration: "10:19" },
      { title: "Strategy Finalization", duration: "22:42" },
      { title: "Optimization Techniques", duration: "18:38" },
      { title: "Publishing Guide", duration: "7:11" },
      { title: "Performance Enhancements", duration: "4:07" },
      { title: "Knowledge Check", duration: null }
    ]
  },
  {
    title: "Automation Techniques",
    status: "0% Complete",
    description: "Automating strategies and processes.",
    icon: Terminal,
    subModules: [
      { title: "Futures Trading Automation", duration: "10:05" },
      { title: "Crypto Trading Automation", duration: "10:33" }
    ]
  },
  {
    title: "Expert Advisors",
    status: "0% Complete",
    description: "Automation on advanced trading platforms.",
    icon: Settings,
    subModules: [
      { title: "Remote Environment Setup", duration: "4:23" },
      { title: "Getting Started", duration: "3:54" },
      { title: "Advisor Overview", duration: "5:27" },
      { title: "Automated Bots Explained", duration: "6:48" },
      { title: "Setup Assistance", duration: "5:39" },
      { title: "Choosing Models", duration: "6:23" },
      { title: "Strategy Parameterization", duration: "5:03" },
      { title: "Producing Solutions", duration: "10:25" },
      { title: "Debugging Practices", duration: "12:19" },
      { title: "Version Control Basics", duration: "9:53" }
    ]
  },
  {
    title: "Python for Trading",
    status: "0% Complete",
    description: "Using Python for advanced automation.",
    icon: Code,
    subModules: [
      { title: "Introduction to Python", duration: null },
      { title: "Applications of Python", duration: null },
      { title: "Installation & Setup", duration: null },
      { title: "Python Automation Guide", duration: null },
      { title: "API Data Processing", duration: null },
      { title: "Messaging Automation", duration: null }
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
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          module.status === '100% Complete' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {module.status}
                        </span>
                      </div>
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

