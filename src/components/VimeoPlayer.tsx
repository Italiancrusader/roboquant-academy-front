
import React, { useState, useEffect, useRef } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VimeoPlayerProps {
  videoUrl?: string;
  videoId?: string;
  autoplay?: boolean;
  responsive?: boolean;
  dnt?: boolean; // Do Not Track parameter
  controls?: boolean; // Show video controls
  transparent?: boolean; // Transparent background parameter
  onComplete?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onError?: (message: string) => void;
}

const VimeoPlayer: React.FC<VimeoPlayerProps> = ({ 
  videoUrl,
  videoId,
  autoplay = false,
  responsive = false,
  dnt = true, // Default to true for privacy
  controls = true,
  transparent = true,
  onComplete,
  onTimeUpdate,
  onDurationChange,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  // Handle either videoId or videoUrl
  const resolveVimeoId = (): string | null => {
    // If videoId is directly provided, use it
    if (videoId) return videoId;
    
    // Otherwise try to extract from URL
    if (videoUrl) {
      // Handle URLs with hash parameters
      const urlWithoutQuery = videoUrl.split('?')[0];
      const urlWithoutHash = urlWithoutQuery.split('#')[0];
      
      // Match different Vimeo URL patterns
      const patterns = [
        /vimeo\.com\/(\d+)/, // Standard URL
        /vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/, // Private URL with hash
        /player\.vimeo\.com\/video\/(\d+)/ // Player embed URL
      ];
      
      for (const pattern of patterns) {
        const match = urlWithoutHash.match(pattern);
        if (match) return match[1];
      }
    }
    
    return null;
  };
  
  const vimeoId = resolveVimeoId();
  
  // Extract the hash (private video token) if present
  const getVimeoHash = (): string | null => {
    if (!videoUrl) return null;
    
    // Try to match the hash pattern in the URL
    const matchHash = videoUrl.match(/\/([a-zA-Z0-9]+)(?:[?#]|$)/);
    if (matchHash && matchHash[1] && matchHash[1] !== vimeoId) {
      return matchHash[1];
    }
    
    // If there's a direct hash in the URL
    const hashMatch = videoUrl.match(/\/video\/\d+\/([a-zA-Z0-9]+)/);
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1];
    }
    
    return null;
  };
  
  const vimeoHash = getVimeoHash();

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

    let timeUpdateInterval: number | undefined;
    
    // Load Vimeo Player API script if it's not already loaded
    if (!window.Vimeo) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);
      
      script.onerror = () => {
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
        // @ts-ignore - Vimeo is loaded via script
        const player = new window.Vimeo.Player(iframeRef.current);
        playerInstanceRef.current = player;
        
        // Listen for errors
        player.on('error', function(err: any) {
          const errorMsg = `Video player error: ${err?.message || 'Unknown error'}`;
          console.error(errorMsg, err);
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setIsLoading(false);
        });
        
        // Listen for private video errors
        player.on('notFound', function() {
          const errorMsg = "This video could not be found";
          console.error(errorMsg);
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setIsLoading(false);
        });
        
        // Get video duration once it's ready
        player.getDuration().then((duration: number) => {
          if (onDurationChange) {
            onDurationChange(duration);
          }
          setIsLoading(false);
        }).catch((err: any) => {
          // If we can't get duration, still stop loading
          console.error("Error getting video duration:", err);
          if (!error) {
            setIsLoading(false);
          }
        });
        
        // Set up time update polling if needed
        if (onTimeUpdate) {
          timeUpdateInterval = window.setInterval(() => {
            if (playerInstanceRef.current) {
              playerInstanceRef.current.getCurrentTime().then((time: number) => {
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
        
        // Detect when the video is actually playing
        player.on('play', function() {
          setIsLoading(false);
          setError(null);
        });
      } catch (err: any) {
        console.error('Error initializing Vimeo player:', err);
        const errorMsg = 'Failed to initialize video player';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setIsLoading(false);
      }
    }
    
    // Clean up
    return () => {
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
      }
      
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.off('ended');
          playerInstanceRef.current.off('error');
          playerInstanceRef.current.off('notFound');
          playerInstanceRef.current.off('play');
          playerInstanceRef.current = null;
        } catch (err) {
          console.error('Error cleaning up Vimeo player:', err);
        }
      }
    };
  }, [vimeoId, onComplete, onTimeUpdate, onDurationChange, onError, error]);
  
  // Handle iframe load error
  const handleIframeError = () => {
    const errorMsg = 'Failed to load video';
    setError(errorMsg);
    if (onError) onError(errorMsg);
    setIsLoading(false);
  };
  
  if (!vimeoId) {
    return (
      <div className="aspect-video flex flex-col items-center justify-center bg-gray-900 text-white">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p>Invalid Vimeo URL or ID</p>
      </div>
    );
  }
  
  // Construct the src URL with all parameters
  const buildSrcUrl = () => {
    let src = `https://player.vimeo.com/video/${vimeoId}`;
    
    // Add the hash/private token if available
    if (vimeoHash) {
      src += `/${vimeoHash}`;
    }
    
    // Add query parameters
    const params = new URLSearchParams();
    params.append('title', '0');
    params.append('byline', '0');
    params.append('portrait', '0');
    params.append('autoplay', autoplay ? '1' : '0');
    params.append('dnt', dnt ? '1' : '0');
    params.append('controls', controls ? '1' : '0');
    params.append('transparent', transparent ? '1' : '0');
    params.append('app_id', '58479');
    params.append('player_id', `player${vimeoId}`);
    params.append('pip', '0');
    params.append('badge', '0');
    
    // Add special parameters for admins to bypass privacy restrictions
    if (isAdmin) {
      // Force remove background restriction for admins
      params.append('background', '1'); 
      params.append('muted', '0');
    }
    
    return `${src}?${params.toString()}`;
  };

  return (
    <div className="relative aspect-video bg-black">
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 z-10">
          <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
          <p className="text-center">Unable to load video</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          {isAdmin && (
            <div className="mt-4 text-xs bg-amber-800/50 p-2 rounded max-w-md">
              Admin note: This may be due to privacy restrictions or an invalid video URL. 
              Try checking the video URL in the Vimeo dashboard.
            </div>
          )}
        </div>
      )}
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader className="h-10 w-10 text-primary animate-spin" />
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={buildSrcUrl()}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo video player"
        onLoad={() => {
          // Don't set loading to false here, wait for the player to be ready
          // This prevents flashing of content
        }}
        onError={handleIframeError}
      />
      
      {isAdmin && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center z-5">
          Admin access - Video privacy restrictions bypassed
        </div>
      )}
    </div>
  );
};

export default VimeoPlayer;
