
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const AboutInstructor: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  
  return (
    <section 
      id="about" 
      className="section-padding"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className={`flex flex-col md:flex-row gap-8 items-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="md:w-1/3">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop" 
                  alt="Alexander Wright, Founder of RoboQuant Academy" 
                  className="rounded-2xl shadow-lg"
                />
                <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl border-2 border-dashed border-robo-aqua"></div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                About the <span className="gradient-text">Instructor</span>
              </h2>
              
              <p className="text-gray-700 mb-4">
                Alexander Wright is a former hedge fund algorithmic trader with 12+ years of experience building trading systems. After managing over $180M in algorithmic strategies, he founded RoboQuant Academy to make institutional-grade trading technology accessible to retail traders.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-gray-100 py-1 px-3 rounded-full text-sm text-gray-700">
                  MT4/MT5 Certified Developer
                </div>
                <div className="bg-gray-100 py-1 px-3 rounded-full text-sm text-gray-700">
                  Former Hedge Fund Quant
                </div>
                <div className="bg-gray-100 py-1 px-3 rounded-full text-sm text-gray-700">
                  3,500+ Students Taught
                </div>
              </div>
              
              <Button className="cta-button text-white">
                Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutInstructor;
