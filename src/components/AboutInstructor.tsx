
import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const instructors = [
  {
    name: "Tim Hutter",
    image: "/lovable-uploads/35d7b99c-022e-4185-a4c5-9e837f1e329f.png",
    alt: "Tim Hutter, Co-Founder of RoboQuant Academy",
    bio: "Tim Hutter is a former hedge fund algorithmic trader with 12+ years of experience building trading systems. After managing over $180M in algorithmic strategies, he founded RoboQuant Academy to make institutional-grade trading technology accessible to retail traders.",
    badges: [
      "MT4/MT5 Certified Developer",
      "Former Hedge Fund Quant",
      "3,500+ Students Taught"
    ]
  },
  {
    name: "Alexander Wright",
    image: "/lovable-uploads/6ff6bfc8-1f54-44dc-a27a-11d6ae5557b7.png",
    alt: "Alexander Wright, Co-Founder of RoboQuant Academy",
    bio: "Alexander Wright is a trader and software engineer who has architected automated trading platforms for funds and brokers across Europe and Asia. He brings deep technical expertise in building multi-asset, high-frequency systems.",
    badges: [
      "Ex-Prop Trading Developer",
      "Automation Architect",
      "Investor & Mentor"
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
            {/* Show both instructors side-by-side on desktop, stacked on mobile */}
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
            <Button className="cta-button text-white mt-4">
              Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutInstructor;
