
import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { VideoErrorHandler } from '@/components/video';
import { AlertTriangle } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoPlayerWithFallbackProps {
  videoId: string;
  title: string;
  className?: string;
}

const VideoPlayerWithFallback: React.FC<VideoPlayerWithFallbackProps> = ({ 
  videoId, 
  title,
  className 
}) => {
  const [hasError, setHasError] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  
  // Handler for YouTube API errors
  const handleYouTubeError = (error: any) => {
    console.error('YouTube player error:', error);
    setHasError(true);
    toast({
      title: "Video Error",
      description: "There was an error loading the video. Please refresh the page and try again.",
      variant: "destructive",
      duration: 5000,
    });
  };

  // Handler for YouTube API initialization
  const onYouTubeIframeAPIReady = () => {
    if (!window.YT) {
      console.error('YouTube API not loaded');
      return;
    }
    
    try {
      const newPlayer = new window.YT.Player('ytplayer', {
        videoId: videoId,
        events: {
          'onError': handleYouTubeError,
          'onStateChange': (e) => {
            if (player) {
              // Pass state change to parent component if needed
            }
          }
        }
      });
      setPlayer(newPlayer);
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setHasError(true);
    }
  };

  // Load YouTube iframe API
  React.useEffect(() => {
    // Reset error state on component mount
    setHasError(false);
    
    // Create script element if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      
      // Callback when API is ready
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      
      // Append script to document
      document.head.appendChild(tag);
    } else {
      // If API is already loaded, initialize player directly
      onYouTubeIframeAPIReady();
    }
    
    return () => {
      // Cleanup
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoId]);

  return (
    <div className={`bg-black relative overflow-hidden rounded-lg ${className}`}>
      {hasError ? (
        <VideoErrorHandler
          error="There was an error loading the video. Please refresh the page."
          onRetry={() => setHasError(false)}
          videoId={videoId}
        />
      ) : (
        <AspectRatio ratio={16/9}>
          <div id="ytplayer" className="w-full h-full">
            {/* YouTube iframe will be created here by the YouTube API */}
            <div className="w-full h-full flex items-center justify-center bg-black/50">
              <AlertTriangle className="animate-pulse text-yellow-500 mr-2" />
              <span className="text-white">Loading video...</span>
            </div>
          </div>
        </AspectRatio>
      )}
    </div>
  );
};

export default VideoPlayerWithFallback;
