import React, { useState, useEffect } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { preconnectToDomains } from '@/utils/performance';
import VideoBackground from './hero/VideoBackground';
import HeroContent from './hero/HeroContent';
import VideoDialog from './hero/VideoDialog';

// Define the YouTube video ID that will be used for the demo
const DEMO_VIDEO_ID = "5QWLpAUv6r8"; // Replace this with your actual YouTube video ID

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Preload the dashboard image
    const dashboardImg = new Image();
    dashboardImg.src = `/lovable-uploads/84929246-b3ad-45e9-99c1-497718c3a71c.png`;
    dashboardImg.onload = () => {
      console.log('Dashboard image preloaded');
      setImageLoaded(true);
    };
    dashboardImg.onerror = (err) => {
      console.error('Error preloading dashboard image:', err);
      setImageLoaded(true);
    };

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

  return (
    <section className="relative min-h-[100vh] flex items-center pb-16 overflow-hidden">
      <VideoBackground />
      <Dialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      >
        <HeroContent imageLoaded={imageLoaded} onOpenVideoDialog={() => setDialogOpen(true)} />
        {dialogOpen && <VideoDialog videoId={DEMO_VIDEO_ID} />}
      </Dialog>
      
      <div 
        className="pointer-events-none absolute left-0 right-0 bottom-0 w-full h-40 sm:h-52 lg:h-64 z-30" 
        aria-hidden="true" 
        style={{
          background: 'linear-gradient(to bottom, transparent, #1A1F2C 80%, #0F1117 100%)'
        }} 
      />
      
      {!isMobile && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-40">
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
