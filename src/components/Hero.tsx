
import React from 'react';
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  return (
    <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '100vh', marginBottom: '-1px' }}>
      <div className="video-container absolute inset-0 z-0">
        <iframe 
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="https://www.youtube.com/embed/iftiNS7WOtI?autoplay=1&mute=1&loop=1&playlist=iftiNS7WOtI&controls=0" 
          frameBorder="0"
          allow="autoplay; encrypted-media"
          title="RoboQuant Trading Background"
        />
      </div>
      
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
          Master Quantitative Trading
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-white/90">
          Learn algorithmic trading strategies and systems with our comprehensive lifetime access course.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6 px-8">
            Enroll Now
          </Button>
          <Button variant="outline" className="border-white/20 hover:bg-white/5 text-lg py-6 px-8">
            Explore Curriculum
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
