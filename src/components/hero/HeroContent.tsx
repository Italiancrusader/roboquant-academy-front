
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from 'lucide-react';
import { DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';

const HeroContent: React.FC<{ imageLoaded: boolean }> = ({ imageLoaded }) => {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto px-4 relative z-20 mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-left max-w-[90%] sm:max-w-none">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Build & launch profitable trading bots — <span className="gradient-text">without writing code</span>.
          </h1>
          <p className="text-lg sm:text-xl max-w-xl mb-8 text-gray-200">
            Create, test and deploy algorithmic trading strategies that run 24/7 — even if you've never coded before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#pricing">
              <Button className="cta-button text-white text-base sm:text-lg py-6 px-8 w-full sm:w-auto">
                Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-gray-300 text-white hover:text-white hover:bg-gray-700 text-base sm:text-lg py-6 px-8 w-full sm:w-auto"
              >
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </Button>
            </DialogTrigger>
          </div>
        </div>
        <div className={`flex justify-center items-center ${isMobile ? "my-2" : "mt-8"}`}>
          <div 
            className="w-full max-w-[480px] min-h-[432px]" 
            style={{
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            <object 
              type="image/svg+xml" 
              data="./Phone Mockup Roboquant.svg" 
              className="w-full h-auto object-contain"
              aria-label="RoboQuant dashboard visualization"
              onLoad={() => console.log('SVG object loaded')}
              onError={() => console.error('SVG object failed to load')}
            >
              {/* Fallback for browsers that don't support SVG */}
              <img 
                src="./lovable-uploads/75ec0136-6eac-4af5-a2ef-798104dbc59a.png" 
                alt="RoboQuant dashboard visualization"
                className="w-full h-auto object-contain"
              />
            </object>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
