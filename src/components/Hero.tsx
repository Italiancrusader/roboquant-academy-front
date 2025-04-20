
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Hero: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <section className="relative min-h-[100vh] flex items-center pb-16 overflow-hidden">
      {/* Video Background */}
      <div className="absolute top-0 inset-x-0 h-[calc(100vh+5rem)] w-full">
        <div className="absolute inset-0 bg-black/40 z-0" /> {/* Dark overlay */}
        <div className="absolute bottom-0 w-full h-96 bg-gradient-to-t from-background via-background/95 to-transparent z-0" /> {/* Bottom gradient */}
        <iframe 
          className="w-full h-full"
          src="https://www.youtube.com/embed/f14SlGPD4gM?autoplay=1&controls=0&mute=1&loop=1&playlist=f14SlGPD4gM&playsinline=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{ pointerEvents: 'none', transform: 'scale(1.5)', transformOrigin: 'center center' }}
        />
      </div>

      {/* Content */}
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
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-base sm:text-lg py-6 px-8 w-full sm:w-auto">
                    <Play className="mr-2 h-5 w-5" /> Watch Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px] p-0 bg-transparent border-0">
                  <div className="video-container">
                    <iframe src="https://www.youtube.com/embed/f14SlGPD4gM?autoplay=1&rel=0" title="RoboQuant Academy Demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className={`relative ${isMobile ? "mt-8" : ""}`}>
            <div className="relative rounded-xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-primary/20 to-teal-primary/20 mix-blend-overlay"></div>
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,229,255,0.2)]"></div>
                <img src="/lovable-uploads/e55e99bf-e708-4619-aead-4688dcd27672.png" alt="RoboQuant dashboard visualization" className="w-full h-auto relative z-0" />
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-primary/20 to-teal-primary/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-primary/20 to-blue-primary/20 rounded-full blur-2xl"></div>
            </div>
            
            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full rounded-xl border-2 border-dashed border-robo-aqua opacity-50"></div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      {!isMobile && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#why" className="text-gray-400 hover:text-robo-blue transition-colors">
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
