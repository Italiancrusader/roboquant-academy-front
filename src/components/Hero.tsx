import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Loader, Volume2, VolumeX, Pause } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLIFrameElement | null>(null);
  
  const togglePlay = () => {
    if (videoElement) {
      const message = isPlaying ? 'pause' : 'play';
      videoElement.contentWindow?.postMessage({ method: message }, '*');
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoElement) {
      const message = isMuted ? 'unmute' : 'mute';
      videoElement.contentWindow?.postMessage({ method: message }, '*');
      setIsMuted(!isMuted);
    }
  };

  return <section className="relative min-h-[100vh] flex items-center pb-16 overflow-hidden">
      {/* Video + Enhanced Overlay in Hero */}
      <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none">
        {/* Enhanced Black Overlay with Increased Blur */}
        <div className="absolute inset-0 z-0" style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)',
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-base sm:text-lg py-6 px-8 w-full sm:w-auto">
                      <Play className="mr-2 h-5 w-5" /> Watch Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[90%] p-4 bg-background border-2">
                    <div className="video-container relative w-full aspect-video bg-black/90">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader className="w-8 h-8 animate-spin text-blue-primary" />
                        </div>
                      )}
                      <iframe
                        ref={(el) => setVideoElement(el)}
                        src="https://player.vimeo.com/video/1077981253?h=3cfe782ae5&autoplay=1&title=0&byline=0&portrait=0&background=1"
                        className="absolute top-0 left-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        style={{
                          border: 'none',
                          opacity: isLoading ? 0 : 1,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                        onLoad={() => setIsLoading(false)}
                      ></iframe>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlay}
                            className="text-white hover:bg-white/20"
                          >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20"
                          >
                            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-base sm:text-lg py-6 px-8 w-full sm:w-auto">
                      <Play className="mr-2 h-5 w-5" /> Watch Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[900px] p-0 bg-transparent border-0">
                    <div className="video-container relative w-full aspect-video bg-black/90">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader className="w-8 h-8 animate-spin text-blue-primary" />
                        </div>
                      )}
                      <iframe
                        src="https://player.vimeo.com/video/1077981253?h=3cfe782ae5&autoplay=1&title=0&byline=0&portrait=0&background=1"
                        className="absolute top-0 left-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        style={{
                          border: 'none',
                          opacity: isLoading ? 0 : 1,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                        onLoad={() => setIsLoading(false)}
                      ></iframe>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <div className={`flex justify-center items-center ${isMobile ? "my-2" : "mt-8"}`}>
            <img alt="RoboQuant dashboard visualization" className="w-full max-w-[4800px] h-auto object-contain" style={{
            minHeight: '432px'
          }} src="/lovable-uploads/84929246-b3ad-45e9-99c1-497718c3a71c.png" />
          </div>
        </div>
      </div>
      
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 w-full h-40 sm:h-52 lg:h-64 z-30" aria-hidden="true" style={{
      background: 'linear-gradient(to bottom, transparent, #1A1F2C 80%, #0F1117 100%)'
    }} />
      
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
