
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const handleCloseVideo = () => {
    setVideoPlaying(false);
    setShowVideo(false);
  };
  
  const handleOpenVideo = () => {
    setVideoPlaying(true);
    setShowVideo(true);
  };

  return <section className="relative min-h-[100vh] flex items-center pb-16 overflow-hidden">
      {/* Video + Enhanced Overlay in Hero */}
      <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none">
        {/* Enhanced Black Overlay with Increased Blur */}
        <div className="absolute inset-0 z-0" style={{
        background: 'rgba(0,0,0,0.75)',
        // Slightly darker overlay
        backdropFilter: 'blur(12px)',
        // Increased blur from 8px to 12px
        WebkitBackdropFilter: 'blur(12px)'
      }} />
        {/* Video - rotate and zoom on mobile */}
        <iframe className={`w-full h-full 
            ${isMobile ? "rotate-90" : ""}
          `} src="https://www.youtube.com/embed/f14SlGPD4gM?autoplay=1&controls=0&mute=1&loop=1&playlist=f14SlGPD4gM&playsinline=1&vq=hd1080" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style={isMobile ? {
        pointerEvents: 'none',
        transform: 'rotate(90deg) scale(3)',
        transformOrigin: 'center center'
      } : {
        pointerEvents: 'none',
        transform: 'scale(1.5)',
        transformOrigin: 'center center'
      }} title="RoboQuant Academy Background Video" />
      </div>

      {/* Hero Content */}
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
              {isMobile ? (
                <Sheet open={showVideo && isMobile} onOpenChange={setShowVideo}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-gray-300 hover:bg-gray-50 text-base sm:text-lg py-6 px-8 w-full sm:w-auto"
                      onClick={handleOpenVideo}
                    >
                      <Play className="mr-2 h-5 w-5" /> Watch Demo
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="p-0 bg-black border-0 h-[80vh]">
                    <div className="relative w-full h-full">
                      <button 
                        className="absolute top-4 right-4 z-50 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                        onClick={handleCloseVideo}
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        {/* Custom video player container */}
                        <div className="relative w-full h-full">
                          {/* Overlay to prevent interaction with YouTube controls */}
                          <div className="absolute inset-0 z-10" onClick={handleCloseVideo}></div>
                          {/* Custom styled iframe wrapper */}
                          <div className="absolute inset-0 overflow-hidden">
                            {showVideo && (
                              <iframe 
                                className="w-full h-full absolute"
                                src={`https://www.youtube.com/embed/5QWLpAUv6r8?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=0&color=white&iv_load_policy=3&disablekb=1${videoPlaying ? '' : '&mute=1'}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                style={{
                                  pointerEvents: "none", // This prevents interaction with YouTube controls
                                  width: "300%",
                                  height: "300%",
                                  top: "-100%",
                                  left: "-100%"
                                }}
                                title="RoboQuant Demo Video"
                              ></iframe>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <AlertDialog open={showVideo && !isMobile} onOpenChange={setShowVideo}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-gray-300 hover:bg-gray-50 text-base sm:text-lg py-6 px-8 w-full sm:w-auto"
                      onClick={handleOpenVideo}
                    >
                      <Play className="mr-2 h-5 w-5" /> Watch Demo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-[900px] p-0 bg-black border-0">
                    <AlertDialogTitle className="sr-only">Demo Video</AlertDialogTitle>
                    <div className="relative w-full aspect-video">
                      <button 
                        className="absolute top-4 right-4 z-50 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                        onClick={handleCloseVideo}
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <div className="w-full h-full">
                        {/* Custom video player container */}
                        <div className="relative w-full h-full">
                          {/* Overlay to prevent interaction with YouTube controls */}
                          <div className="absolute inset-0 z-10" onClick={handleCloseVideo}></div>
                          {/* Custom styled iframe wrapper */}
                          <div className="absolute inset-0 overflow-hidden">
                            {showVideo && (
                              <iframe 
                                className="w-full h-full absolute"
                                src={`https://www.youtube.com/embed/5QWLpAUv6r8?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=0&color=white&iv_load_policy=3&disablekb=1${videoPlaying ? '' : '&mute=1'}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                style={{
                                  pointerEvents: "none", // This prevents interaction with YouTube controls
                                  width: "150%",
                                  height: "150%", 
                                  top: "-25%",
                                  left: "-25%"
                                }}
                                title="RoboQuant Demo Video"
                              ></iframe>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          {/* Single image only, bigger */}
          <div className={`flex justify-center items-center ${isMobile ? "my-2" : "mt-8"}`}>
            <img alt="RoboQuant dashboard visualization" className="w-full max-w-[4800px] h-auto object-contain" style={{
            minHeight: '432px'
          }} src="/lovable-uploads/84929246-b3ad-45e9-99c1-497718c3a71c.png" />
          </div>
        </div>
      </div>
      {/* Bottom Gradient for Section Transition */}
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 w-full h-40 sm:h-52 lg:h-64 z-30" aria-hidden="true" style={{
      background: 'linear-gradient(to bottom, transparent, #1A1F2C 80%, #0F1117 100%)'
    }} />
      {/* Scroll indicator */}
      {!isMobile && <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-40">
          <a href="#why" className="text-gray-400 hover:text-robo-blue transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </a>
        </div>}
    </section>;
};

export default Hero;
