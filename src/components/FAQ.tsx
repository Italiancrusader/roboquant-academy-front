
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Do I need coding experience to take this course?",
    answer: "No, RoboQuant Academy is specifically designed for traders with zero coding knowledge. Our no-code approach lets you build fully-automated trading bots without any programming experience."
  },
  {
    question: "How soon can I deploy my first trading bot?",
    answer: "Most students deploy their first trading bot within one week of starting the course, following our step-by-step methodology."
  },
  {
    question: "Which trading platforms are supported?",
    answer: "The course teaches you to build bots for MT4, MT5, and cTrader platforms, which cover the vast majority of retail trading brokers worldwide."
  },
  {
    question: "How does the back-testing module work?",
    answer: "Our course includes a professional-grade back-testing system that lets you validate your strategy against historical data, optimize parameters, and analyze performance metrics without risking real money."
  },
  {
    question: "Can I sell the trading bots I create?",
    answer: "Absolutely! Many of our students build profitable trading bots not just for their own use but also to sell as EAs (Expert Advisors) to other traders, creating an additional income stream."
  },
  {
    question: "Is there ongoing support after I purchase?",
    answer: "Yes, with your one-time payment you get lifetime access to all course materials, future updates, and our private community where you can get help from instructors and fellow students."
  },
  {
    question: "What if the course isn't right for me?",
    answer: "We offer a 14-day no-questions-asked money-back guarantee. If you're not completely satisfied, simply email our support team for a full refund."
  }
];

const FAQ: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="faq" 
      className="section-padding bg-section-dark"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about RoboQuant Academy.
          </p>
        </div>
        
        <div className={`max-w-3xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <Accordion type="single" collapsible className="bg-card rounded-2xl shadow-lg border border-border/20 overflow-hidden">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border-b border-border/20 last:border-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-accent/50 text-left text-white font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 text-gray-300">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
