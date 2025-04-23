import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const instructors = [
  {
    name: "Tim Hutter",
    image: "/lovable-uploads/35d7b99c-022e-4185-a4c5-9e837f1e329f.png",
    alt: "Tim Hutter, Co-Founder of RoboQuant Academy",
    bio: "A veteran trader with 10 years of experience in forex and crypto markets, Tim has developed hundreds of trading robots and successfully run a trading business. Renowned for his reliability, high reputation, and transparent 'no BS' approach. His thriving Discord community boasts over 3,300 members.",
    badges: [
      "10+ Years Trading Experience",
      "300+ Trading Robots Developed",
      "3,300+ Discord Community"
    ]
  },
  {
    name: "Gabriel Venturini",
    image: "/lovable-uploads/6ff6bfc8-1f54-44dc-a27a-11d6ae5557b7.png",
    alt: "Gabriel Venturini, Co-Founder of RoboQuant Academy",
    bio: "With 6+ years of experience in finance and forex trading, Gabriel brings a strong tech background and deep interest in automation. As a former Chief Technology Officer for private equity funds, he has built hundreds of high-end trading algorithms. Working alongside Tim since 2020, he also successfully runs e-commerce businesses.",
    badges: [
      "6+ Years Finance Experience",
      "Hundreds of Trading Algorithms",
      "Tech & Trading Expert"
    ]
  }
];

const AboutInstructor: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);

  const handleSelectInstructor = (name: string) => {
    setSelectedInstructor(name);
  };

  return (
    <section id="about" className="section-padding bg-background" ref={ref as React.RefObject<HTMLElement>}>
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className={`flex flex-col gap-8 items-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground text-center w-full">
              About the <span className="gradient-text">Instructors</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
              {instructors.map((instructor) => (
                <div
                  key={instructor.name}
                  className={`flex-1 bg-accent/10 rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[280px] cursor-pointer
                    ${selectedInstructor === instructor.name ? 'ring-4 ring-teal-primary' : ''}
                  `}
                  onClick={() => handleSelectInstructor(instructor.name)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedInstructor === instructor.name}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectInstructor(instructor.name);
                    }
                  }}
                >
                  <div className="relative w-44 h-44 mb-4">
                    <img
                      alt={instructor.alt}
                      className="rounded-2xl shadow-lg object-cover w-44 h-44"
                      src={instructor.image}
                    />
                    <div className="absolute -z-10 -bottom-2 -right-2 w-full h-full rounded-2xl border-2 border-dashed border-teal-primary"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{instructor.name}</h3>
                  <p className="text-gray-300 mb-4 text-center">{instructor.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {instructor.badges.map((badge) => (
                      <div key={badge} className="bg-accent/30 py-1 px-3 rounded-full text-sm text-gray-300">
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="cta-button text-white mt-4"
              onClick={() => window.open('https://whop.com/checkout/plan_h6SjTvT4JxgxA/', '_blank')}
            >
              Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutInstructor;
