
import { useState, useEffect, RefObject } from 'react';

interface UseVimeoPlayerOptions {
  iframeRef: RefObject<HTMLIFrameElement>;
  vimeoId: string | null;
  onComplete?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onError?: (message: string) => void;
}

interface UseVimeoPlayerResult {
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to handle Vimeo player initialization and events
 */
export const useVimeoPlayer = ({
  iframeRef,
  vimeoId,
  onComplete,
  onTimeUpdate,
  onDurationChange,
  onError
}: UseVimeoPlayerOptions): UseVimeoPlayerResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set up event listeners for the Vimeo player
  useEffect(() => {
    // Skip if no iframe or no vimeo ID
    if (!iframeRef.current || !vimeoId) {
      if (!vimeoId && onError) {
        onError("Invalid Vimeo URL or ID");
        setError("Invalid Vimeo URL or ID");
      }
      setIsLoading(false);
      return;
    }

    // Add the Vimeo Player API script dynamically
    if (!document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')) {
      const script = document.createElement('script');
      script.src = "https://player.vimeo.com/api/player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    let timeUpdateInterval: number | undefined;
    let initTimeout: NodeJS.Timeout;
    let playerInstance: any = null;
    
    // Set a timeout to ensure we don't hang on loading indefinitely
    initTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError("Video failed to load within the expected time");
        if (onError) onError("Video failed to load within the expected time");
      }
    }, 20000); // 20 second timeout - increased to give more time for loading
    
    // Load Vimeo Player API script if it's not already loaded
    if (!window.Vimeo) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);
      
      script.onerror = () => {
        clearTimeout(initTimeout);
        const errorMsg = "Failed to load Vimeo player script";
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setIsLoading(false);
      };
    } else {
      initializePlayer();
    }
    
    function initializePlayer() {
      try {
        if (!iframeRef.current) return;

        // Clean up previous player instance if it exists
        if (playerInstance) {
          try {
            playerInstance.destroy();
          } catch (err) {
            console.log("Error destroying previous player:", err);
          }
          playerInstance = null;
        }

        // @ts-ignore - Vimeo is loaded via script
        const player = new window.Vimeo.Player(iframeRef.current);
        playerInstance = player;
        
        // Listen for play event to confirm the player is working
        player.on('play', function() {
          clearTimeout(initTimeout);
          setIsLoading(false);
          setError(null);
        });
        
        // Listen for errors
        player.on('error', function(err: any) {
          clearTimeout(initTimeout);
          const errorMsg = `Video player error: ${err?.message || 'Unknown error'}`;
          console.error(errorMsg, err);
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setIsLoading(false);
        });
        
        // Explicitly handle the notFound error that's shown in the screenshot
        player.on('notfound', function() {
          clearTimeout(initTimeout);
          const errorMsg = "notfound";  // Just use "notfound" to match with VideoErrorDialog handling
          console.error(errorMsg);
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setIsLoading(false);
        });
        
        // Listen for other initialization errors
        player.ready().catch((err: any) => {
          clearTimeout(initTimeout);
          let errorMsg = "There was a problem loading this video";
          
          if (err && err.name) {
            if (err.name === "PrivacyError") {
              errorMsg = "private";  // Use simple "private" to match with VideoErrorDialog
            } else if (err.name === "NotFoundError") {
              errorMsg = "notfound";  // Use simple "notfound" to match with VideoErrorDialog
            }
          }
          
          console.error("Player ready error:", err);
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setIsLoading(false);
        });
        
        // Get video duration once it's ready
        player.getDuration().then((duration: number) => {
          clearTimeout(initTimeout);
          if (onDurationChange) {
            onDurationChange(duration);
          }
          setIsLoading(false);
        }).catch((err: any) => {
          clearTimeout(initTimeout);
          
          // If we can't get duration, still mark as loaded but log the error
          console.error("Error getting video duration:", err);
          
          // For private videos or videos that don't exist, show an error
          if (err && (err.name === "NotFoundError" || err.name === "PrivacyError")) {
            const errorMsg = err.name === "NotFoundError" ? "notfound" : "private";
            setError(errorMsg);
            if (onError) onError(errorMsg);
          }
          
          setIsLoading(false);
        });
        
        // Set up time update polling if needed
        if (onTimeUpdate) {
          timeUpdateInterval = window.setInterval(() => {
            if (playerInstance && !error) {
              playerInstance.getCurrentTime().then((time: number) => {
                onTimeUpdate(time);
              }).catch(() => {
                // Silently fail for time updates
              });
            }
          }, 1000) as unknown as number;
        }
        
        // Listen for video completion
        if (onComplete) {
          player.on('ended', onComplete);
        }
      } catch (err: any) {
        clearTimeout(initTimeout);
        console.error('Error initializing Vimeo player:', err);
        const errorMsg = 'Failed to initialize video player';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setIsLoading(false);
      }
    }
    
    // Clean up
    return () => {
      clearTimeout(initTimeout);
      
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
      }
      
      if (playerInstance) {
        try {
          playerInstance.off('ended');
          playerInstance.off('error');
          playerInstance.off('notfound');
          playerInstance.off('play');
        } catch (err) {
          console.error('Error cleaning up Vimeo player:', err);
        }
      }
    };
  }, [iframeRef, vimeoId, onComplete, onTimeUpdate, onDurationChange, onError]);

  return { isLoading, error };
};
