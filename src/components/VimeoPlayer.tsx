
import React, { useState, useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';

interface VimeoPlayerProps {
  videoUrl: string;
  onComplete?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
}

const VimeoPlayer: React.FC<VimeoPlayerProps> = ({ 
  videoUrl, 
  onComplete,
  onTimeUpdate,
  onDurationChange
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = useRef<any>(null);
  
  // Extract Vimeo ID from URL
  const getVimeoId = (url: string): string | null => {
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  const vimeoId = getVimeoId(videoUrl);

  // Set up event listeners for the Vimeo player
  useEffect(() => {
    // Skip if no event handlers provided
    if (!onTimeUpdate && !onComplete && !onDurationChange) return;
    
    // Skip if no iframe or no vimeo ID
    if (!iframeRef.current || !vimeoId) return;

    let timeUpdateInterval: number | undefined;
    
    // Load Vimeo Player API script if it's not already loaded
    if (!window.Vimeo) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);
    } else {
      initializePlayer();
    }
    
    function initializePlayer() {
      try {
        // @ts-ignore - Vimeo is loaded via script
        const player = new window.Vimeo.Player(iframeRef.current);
        playerInstanceRef.current = player;
        
        // Get video duration once it's ready
        player.getDuration().then((duration: number) => {
          if (onDurationChange) {
            onDurationChange(duration);
          }
        });
        
        // Set up time update polling if needed
        if (onTimeUpdate) {
          timeUpdateInterval = window.setInterval(() => {
            player.getCurrentTime().then((time: number) => {
              onTimeUpdate(time);
            });
          }, 1000) as unknown as number;
        }
        
        // Listen for video completion
        if (onComplete) {
          player.on('ended', onComplete);
        }
      } catch (err) {
        console.error('Error initializing Vimeo player:', err);
      }
    }
    
    // Clean up
    return () => {
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
      }
      
      if (playerInstanceRef.current) {
        playerInstanceRef.current.off('ended');
        playerInstanceRef.current = null;
      }
    };
  }, [vimeoId, onComplete, onTimeUpdate, onDurationChange]);
  
  if (!vimeoId) {
    return <div className="p-4 text-center text-red-500">Invalid Vimeo URL</div>;
  }
  
  return (
    <div className="relative aspect-video bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader className="h-10 w-10 text-primary animate-spin" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&autoplay=0`}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo video player"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default VimeoPlayer;
