
import React, { useState, useEffect } from 'react';
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
  
  // Extract Vimeo ID from URL
  const getVimeoId = (url: string): string | null => {
    // Support multiple Vimeo URL formats
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
      /vimeo\.com\/channels\/[^/]+\/(\d+)/,
      /vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };
  
  const vimeoId = getVimeoId(videoUrl);
  
  useEffect(() => {
    if (!vimeoId) return;
    
    // Load Vimeo API script if not already loaded
    if (!window.Vimeo) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = initializePlayer;
      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializePlayer();
    }
    
    function initializePlayer() {
      try {
        // Make sure the iframe exists and the API is loaded
        const iframe = document.getElementById('vimeo-player') as HTMLIFrameElement;
        if (!iframe || !window.Vimeo) return;
        
        const player = new window.Vimeo.Player(iframe);
        
        player.ready().then(() => {
          setIsLoading(false);
        });
        
        // Set up event listeners
        player.on('ended', () => {
          if (onComplete) onComplete();
        });
        
        player.on('timeupdate', (data: { seconds: number }) => {
          if (onTimeUpdate) onTimeUpdate(data.seconds);
        });
        
        player.getDuration().then((duration: number) => {
          if (onDurationChange) onDurationChange(duration);
        });
      } catch (error) {
        console.error('Error initializing Vimeo player:', error);
        setIsLoading(false);
      }
    }
    
    return () => {
      // Clean up event listeners if needed
      try {
        if (window.Vimeo) {
          const iframe = document.getElementById('vimeo-player') as HTMLIFrameElement;
          if (iframe) {
            const player = new window.Vimeo.Player(iframe);
            player.destroy();
          }
        }
      } catch (error) {
        console.error('Error cleaning up Vimeo player:', error);
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
        id="vimeo-player"
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0&dnt=1&color=0062ff&background=1`}
        className="absolute top-0 left-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{ width: '100%', height: '100%' }}
        title="Vimeo video player"
      />
    </div>
  );
};

export default VimeoPlayer;
