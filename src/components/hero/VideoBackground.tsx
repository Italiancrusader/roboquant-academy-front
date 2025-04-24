
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const VideoBackground: React.FC = () => {
  const isMobile = useIsMobile();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  
  useEffect(() => {
    // Defer video loading to improve initial page load
    const timer = setTimeout(() => {
      setShouldLoadVideo(true);
    }, 1000); // Load video after 1 second
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none">
      <div 
        className="absolute inset-0 z-0" 
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }} 
      />
      {shouldLoadVideo && (
        <iframe 
          className={`w-full h-full ${isMobile ? "rotate-90" : ""}`}
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
          title="RoboQuant Academy Background Video"
        />
      )}
    </div>
  );
};

export default VideoBackground;
