
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
    answer: "The course teaches you to build bots for MT4, MT5, TradingView, NinjaTrader, and is adaptable for any other platform."
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
    answer: "We offer a 30-day no-questions-asked money-back guarantee. If you're not completely satisfied, simply email our support team for a full refund."
  },
  {
    question: "How much time do I need to learn and develop bots with this course?",
    answer: "Once you've learned the skills taught, it takes just minutes to develop strategies. Typically, you can go from a strategy idea to a working MT4/MT5 bot within 10-15 minutes. Time requirements can vary if you're brainstorming or debugging, but a step-by-step module is included demonstrating a real strategy from start to finish."
  },
  {
    question: "Will there be support if I get stuck along the way?",
    answer: "Yes, we provide support through course materials, future updates, and a private community. Our aim is to help you overcome challenges as you go."
  },
  {
    question: "Can I build and sell trading bots commercially after taking this course?",
    answer: "Yes, you receive all source codes developed in the course, enabling you to use, license, and sell your bots commercially. You'll also learn about licensing and selling."
  },
  {
    question: "Why is the course priced at $2,000 when other options are cheaper?",
    answer: "The investment saves you tens of thousands of dollars in development costs. Hiring a developer can cost $1,250+ per bot with additional update fees, whereas our course empowers you to build bots yourself."
  },
  {
    question: "Is this course useful if I don't have my own manual strategies?",
    answer: "Absolutely. The course not only teaches how to automate strategies but also how to develop and optimize profitable trading strategies from scratch, even if you don't trade manually."
  },
  {
    question: "Do I get something ready to use immediately after purchase?",
    answer: "Yes. Along with the step-by-step instruction, you get access to real bot examples, source code, and practical tools to start building or deploying bots right away."
  },
  {
    question: "How is this different from tools like AlgoBuilder AI?",
    answer: "AlgoBuilder AI is a software product, but our academy teaches you a transferable skill set—you're not restricted by someone's tool or AI limitations. You have full creative freedom and total platform flexibility."
  }
];

const FAQ: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="faq" 
      className="section-padding bg-background"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
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
                <AccordionTrigger className="px-6 py-4 hover:bg-accent/50 text-left text-foreground font-semibold">
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
