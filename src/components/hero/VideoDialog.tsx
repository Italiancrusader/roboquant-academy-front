
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const VideoDialog: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const vimeoRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('player.vimeo.com')) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.event === 'ready' && vimeoRef.current) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error handling Vimeo message:', error);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[900px]'} p-0 bg-transparent border-0`}>
      <DialogTitle className="sr-only">Watch Demo Video</DialogTitle>
      <div className="video-container relative w-full aspect-video bg-black/90">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-primary" />
          </div>
        )}
        <iframe
          ref={vimeoRef}
          src="https://player.vimeo.com/video/1080278046?h=3cfe782ae5&autoplay=1&title=0&byline=0&portrait=0&color=0062ff&background=1"
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
      </div>
    </DialogContent>
  );
};

export default VideoDialog;
