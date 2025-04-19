import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // If video doesn't load within 3 seconds, fallback to gradient
      // Note: We just use the timer as a fallback mechanism
      setVideoError(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {videoError ? (
        // Fallback gradient background
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 via-black to-purple-900"></div>
      ) : (
        // Video background with reduced quality to prevent errors
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-black/30 z-[1]"></div>
            <div className="w-full h-full overflow-hidden">
              <iframe 
                className="w-full h-full scale-[1.2] origin-center"
                src="https://www.youtube-nocookie.com/embed/f14SlGPD4gM?autoplay=1&mute=1&loop=1&controls=0&playlist=f14SlGPD4gM&modestbranding=1&vq=hd720" 
                title="Background Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
                referrerPolicy="no-referrer"
                onLoad={() => setVideoError(false)} // Clear error if iframe loads successfully
                onError={() => setVideoError(true)} // Set error if iframe fails to load
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Add a subtle pattern overlay for texture */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10" 
           style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 20L20 0h10L0 30zm0 10L30 0h10L0 40zM10 0L0 10v10L20 0zm10 0l20 20v10L20 0z'/%3E%3C/g%3E%3C/svg%3E')"}}></div>
      
      {/* Keep the bottom gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-charcoal to-transparent z-[2]"></div>
      
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
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
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a href="#features" className="text-white opacity-80 hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </a>
      </div>
    </section>
  );
};

export default Hero;
