
import React, { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import VimeoError from './VimeoError';
import VimeoLoading from './VimeoLoading';
import { useVimeoPlayer } from './useVimeoPlayer';
import { resolveVimeoId, getVimeoHash, buildVimeoSrcUrl } from './VimeoUrlUtils';
import { toast } from '@/components/ui/use-toast';

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
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  // Handle either videoId or videoUrl
  const vimeoId = resolveVimeoId(videoId, videoUrl);
  
  // Extract the hash (private video token) if present
  const vimeoHash = getVimeoHash(videoUrl);

  // Initialize player and handle events
  const { isLoading, error } = useVimeoPlayer({
    iframeRef,
    vimeoId,
    onComplete,
    onTimeUpdate,
    onDurationChange,
    onError
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Handle iframe load error
  const handleIframeError = () => {
    const errorMsg = 'Failed to load video';
    if (onError) onError(errorMsg);
  };
  
  if (!vimeoId) {
    return (
      <div className="aspect-video flex flex-col items-center justify-center bg-gray-900 text-white">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p>Invalid Vimeo URL or ID</p>
      </div>
    );
  }

  // Log the video ID and hash for debugging
  console.log('Vimeo Video ID:', vimeoId);
  console.log('Vimeo Hash:', vimeoHash);
  
  // Build the source URL for the iframe
  const srcUrl = buildVimeoSrcUrl({
    vimeoId,
    vimeoHash,
    autoplay,
    dnt,
    controls,
    transparent,
    retryCount,
    isAdmin
  });
  
  console.log('Built Vimeo URL:', srcUrl);

  return (
    <div className="relative aspect-video bg-black">
      {error && (
        <VimeoError 
          error={error} 
          vimeoId={vimeoId} 
          vimeoHash={vimeoHash} 
          onRetry={handleRetry} 
          isAdmin={isAdmin} 
        />
      )}
      
      {isLoading && !error && <VimeoLoading />}
      
      <iframe
        ref={iframeRef}
        src={srcUrl}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        allowFullScreen
        title="Vimeo video player"
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
