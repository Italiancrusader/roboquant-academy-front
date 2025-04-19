import React from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative h-[100svh] flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="relative w-full h-full scale-[1.6] sm:scale-[1.2] origin-center">
          <div className="absolute inset-0 bg-black/40 z-[1]"></div>
          <iframe 
            className="absolute top-0 left-0 w-full h-full object-cover"
            src="https://www.youtube.com/embed/f14SlGPD4gM?autoplay=1&mute=1&loop=1&controls=0&playlist=f14SlGPD4gM&showinfo=0&rel=0&modestbranding=1&vq=hd720" 
            title="Background Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            frameBorder="0"
          ></iframe>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-charcoal to-transparent z-[2]"></div>
      
      <div className="relative z-10 text-center px-4 max-w-[90%] sm:max-w-none mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 gradient-text leading-tight">
          Master Quantitative Trading
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-6 sm:mb-8 text-white/90">
          Learn algorithmic trading strategies and systems with our comprehensive lifetime access course.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button 
            className="bg-gradient-primary hover:opacity-90 transition-opacity text-base sm:text-lg py-5 sm:py-6 px-6 sm:px-8 w-full sm:w-auto"
          >
            Enroll Now
          </Button>
          <Button 
            variant="outline" 
            className="border-white/20 hover:bg-white/5 text-base sm:text-lg py-5 sm:py-6 px-6 sm:px-8 w-full sm:w-auto"
          >
            Explore Curriculum
          </Button>
        </div>
      </div>
      
      {!isMobile && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#features" className="text-white opacity-80 hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </a>
        </div>
      )}
    </section>
  );
};

export default Hero;
