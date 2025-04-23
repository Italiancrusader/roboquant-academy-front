
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Loader, Volume2, VolumeX, Pause } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { preconnectToDomains } from '@/utils/performance';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLIFrameElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const vimeoRef = useRef<HTMLIFrameElement>(null);
  
  // Handle Vimeo player API messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only handle messages from Vimeo
      if (!event.origin.includes('player.vimeo.com')) return;
      
      try {
        // Parse the message data
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Handle Vimeo player events
        if (data.event === 'ready' && vimeoRef.current) {
          // After player is ready, set up communication with the iframe
          const player = vimeoRef.current;
          
          // Unmute the video (crucial step)
          player.contentWindow?.postMessage(
            JSON.stringify({ method: 'setVolume', value: 1 }),
            '*'
          );
          
          // Set initial state
          setIsPlaying(true);
          setIsMuted(false);
          
          console.log('Vimeo player ready, audio unmuted');
        }
      } catch (error) {
        console.error('Error handling Vimeo message:', error);
      }
    };
    
    // Add event listener
    window.addEventListener('message', handleMessage);
    
    // Clean up
    return () => {
      window.addEventListener('message', handleMessage);
    };
  }, []);

  // Toggle play/pause
  const togglePlay = () => {
    if (vimeoRef.current) {
      const message = isPlaying ? 'pause' : 'play';
      vimeoRef.current.contentWindow?.postMessage(
        JSON.stringify({ method: message }), 
        '*'
      );
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (vimeoRef.current) {
      const volume = isMuted ? 1 : 0;
      vimeoRef.current.contentWindow?.postMessage(
        JSON.stringify({ method: 'setVolume', value: volume }),
        '*'
      );
      setIsMuted(!isMuted);
    }
  };

  // Preload critical resources
  useEffect(() => {
    // Preload dashboard image
    const dashboardImg = new Image();
    dashboardImg.src = "/lovable-uploads/84929246-b3ad-45e9-99c1-497718c3a71c.png";
    dashboardImg.onload = () => setImageLoaded(true);
    
    // Preconnect to various domains
    const cleanupPreconnect = preconnectToDomains([
      'https://www.youtube.com',
      'https://player.vimeo.com',
      'https://i.vimeocdn.com',
      'https://f.vimeocdn.com'
    ]);
    
    return () => {
      cleanupPreconnect();
    };
  }, []);

  return <section className="relative min-h-[100vh] flex items-center pb-16 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none">
        <div className="absolute inset-0 z-0" style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }} />
        <iframe className={`w-full h-full 
            ${isMobile ? "rotate-90" : ""}
          `} 
          src="https://www.youtube.com/embed/f14SlGPD4gM?autoplay=1&controls=0&mute=1&loop=1&playlist=f14SlGPD4gM&playsinline=1&vq=hd1080" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          loading="lazy"
          style={isMobile ? {
            pointerEvents: 'none',
            transform: 'rotate(90deg) scale(3)',
            transformOrigin: 'center center'
          } : {
            pointerEvents: 'none',
            transform: 'scale(1.5)',
            transformOrigin: 'center center'
          }} 
          title="RoboQuant Academy Background Video" />
      </div>

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
                    <DialogTitle className="sr-only">Watch Demo Video</DialogTitle>
                    <div className="video-container relative w-full aspect-video bg-black/90">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader className="w-8 h-8 animate-spin text-blue-primary" />
                        </div>
                      )}
                      <iframe
                        ref={vimeoRef}
                        src="https://player.vimeo.com/video/1077981253?h=3cfe782ae5&autoplay=1&title=0&byline=0&portrait=0&background=0"
                        className="absolute top-0 left-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        loading="lazy"
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
                    <DialogTitle className="sr-only">Watch Demo Video</DialogTitle>
                    <div className="video-container relative w-full aspect-video bg-black/90">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader className="w-8 h-8 animate-spin text-blue-primary" />
                        </div>
                      )}
                      <iframe
                        ref={vimeoRef}
                        src="https://player.vimeo.com/video/1077981253?h=3cfe782ae5&autoplay=1&title=0&byline=0&portrait=0&background=0"
                        className="absolute top-0 left-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        loading="lazy"
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
              )}
            </div>
          </div>
          <div className={`flex justify-center items-center ${isMobile ? "my-2" : "mt-8"}`}>
            <img 
              alt="RoboQuant dashboard visualization" 
              className={`w-full max-w-[4800px] h-auto object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                minHeight: '432px',
                transition: 'opacity 0.3s ease-in-out'
              }} 
              src="/lovable-uploads/84929246-b3ad-45e9-99c1-497718c3a71c.png" 
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
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
