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

    // Add the Vimeo Player API script dynamically if it doesn't exist
    let script: HTMLScriptElement | null = document.querySelector('script[src="https://player.vimeo.com/api/player.js"]');
    if (!script) {
      script = document.createElement('script');
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
        const errorMsg = "Video failed to load within the expected time";
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    }, 20000); // 20 second timeout
    
    // Function to initialize the player
    const initializePlayer = () => {
      try {
        if (!iframeRef.current) return;
        
        // Make sure Vimeo API is available
        if (!window.Vimeo) {
          console.warn("Vimeo API not loaded yet");
          return; // Will retry on next script load event
        }

        // Clean up previous player instance if it exists
        if (playerInstance) {
          try {
            playerInstance.destroy();
          } catch (err) {
            console.log("Error destroying previous player:", err);
          }
          playerInstance = null;
        }

        // Create new player instance
        const player = new window.Vimeo.Player(iframeRef.current);
        playerInstance = player;
        
        // Listen for play event to confirm the player is working
        player.on('play', () => {
          clearTimeout(initTimeout);
          setIsLoading(false);
          setError(null);
        });
        
        // Listen for error event
        player.on('error', (err: any) => {
          clearTimeout(initTimeout);
          const errorMsg = `Video player error: ${err?.message || 'Unknown error'}`;
          console.error(errorMsg, err);
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setIsLoading(false);
        });
        
        // Get video duration once it's ready
        player.ready().then(() => {
          clearTimeout(initTimeout);
          setIsLoading(false);
          
          player.getDuration().then((duration: number) => {
            if (onDurationChange) {
              onDurationChange(duration);
            }
          }).catch((err: any) => {
            console.error("Error getting video duration:", err);
            
            // For private videos or videos that don't exist, show an error
            if (err && (err.name === "NotFoundError" || err.name === "PrivacyError")) {
              const errorMsg = err.name === "NotFoundError" 
                ? "Video not found. It may have been deleted or made private."
                : "This video is private and cannot be accessed";
              setError(errorMsg);
              if (onError) onError(errorMsg);
            }
          });
        }).catch((err: any) => {
          clearTimeout(initTimeout);
          let errorMsg = "There was a problem loading this video";
          
          if (err && err.name) {
            if (err.name === "PrivacyError") {
              errorMsg = "This video is private and cannot be accessed";
            } else if (err.name === "NotFoundError") {
              errorMsg = "Video not found. It may have been deleted or made private.";
            }
          }
          
          console.error("Player ready error:", err);
          setError(errorMsg);
          if (onError) onError(errorMsg);
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
    };
    
    // Initialize player if Vimeo API is already loaded
    if (window.Vimeo) {
      initializePlayer();
    } else {
      // Otherwise wait for script to load
      script.addEventListener('load', initializePlayer);
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
          playerInstance.off('play');
          playerInstance.destroy();
        } catch (err) {
          console.error('Error cleaning up Vimeo player:', err);
        }
      }
      
      // Remove script load event listener
      if (script) {
        script.removeEventListener('load', initializePlayer);
      }
    };
  }, [iframeRef, vimeoId, onComplete, onTimeUpdate, onDurationChange, onError]);

  return { isLoading, error };
};
