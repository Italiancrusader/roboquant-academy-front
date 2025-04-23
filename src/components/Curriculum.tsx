
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
    description: "Welcome and orientation",
    icon: Check,
    subModules: [
      { title: "Getting Started", duration: "2:35" }
    ]
  },
  {
    title: "Trading Basics",
    description: "Core trading concepts for beginners",
    icon: BookOpen,
    subModules: [
      { title: "Fundamental Concepts", duration: "1:40" },
      { title: "Platform Setup Guide", duration: "13:32" }
    ]
  },
  {
    title: "Advanced Trading Concepts",
    description: "Learn about market structure and smart trading techniques",
    icon: BookOpen,
    subModules: [
      { title: "Overview", duration: "3:24" },
      { title: "Understanding Price Patterns", duration: "8:07" },
      { title: "Market Drivers", duration: "10:44" },
      { title: "Cycle Theory", duration: "11:41" },
      { title: "Order Flows & Price Gaps", duration: "11:44" },
      { title: "Quick Knowledge Check", duration: null }
    ]
  },
  {
    title: "Pinescript Basics",
    description: "Intro to script-based automation",
    icon: Code,
    subModules: [
      { title: "Script Fundamentals - Part 1", duration: "27:09" },
      { title: "Scripting Resources", duration: null },
      { title: "Script Fundamentals - Part 2", duration: "23:37" },
      { title: "Knowledge Check", duration: null }
    ]
  },
  {
    title: "Strategy Development",
    description: "Design and test simple to advanced automated strategies",
    icon: Terminal,
    subModules: [
      { title: "Strategy Overview", duration: "6:06" },
      { title: "From Idea to Indicator", duration: "9:02" },
      { title: "Coding a Basic Strategy", duration: "26:18" },
      { title: "Strategy Testing & Validation", duration: "10:19" },
      { title: "Finishing Touches", duration: "22:42" },
      { title: "Optimization Basics", duration: "18:38" },
      { title: "Publishing Workflows", duration: "7:11" },
      { title: "Performance Review", duration: "4:07" },
      { title: "Knowledge Check", duration: null }
    ]
  },
  {
    title: "Tradingview Automation",
    description: "Automating using platform features",
    icon: Terminal,
    subModules: [
      { title: "Automated Trading Concepts", duration: "10:05" },
      { title: "Crypto Bot Automation Overview", duration: "10:33" }
    ]
  },
  {
    title: "MT5 Expert Advisors",
    description: "Working with trading automations for pro platforms",
    icon: Settings,
    subModules: [
      { title: "Virtual Hosting Basics", duration: "4:23" },
      { title: "MT5 Platform Introduction", duration: "3:54" },
      { title: "About Trading Automations", duration: "5:27" },
      { title: "Types of Trading Bots", duration: "6:48" },
      { title: "Setting up Automations", duration: "5:39" },
      { title: "Exploring Automation Tools", duration: "6:23" },
      { title: "Strategy Setup Guidance", duration: "5:03" },
      { title: "Producing Automated Workflows", duration: "10:25" },
      { title: "Debugging & Troubleshooting", duration: "12:19" },
      { title: "Version Control Principles", duration: "9:53" }
    ]
  },
  {
    title: "Python",
    description: "Automating tasks and integrations using Python",
    icon: Code,
    subModules: [
      { title: "Intro to Python", duration: null },
      { title: "When & Why to Use Python?", duration: null },
      { title: "Installing and Using Python", duration: null },
      { title: "Automating with Python Tools", duration: null },
      { title: "APIs & Data Processing", duration: null },
      { title: "Sending Automated Notifications", duration: null }
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
