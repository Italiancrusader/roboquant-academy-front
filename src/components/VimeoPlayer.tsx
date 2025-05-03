
import React, { useState } from 'react';
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
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  const vimeoId = getVimeoId(videoUrl);
  
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
        src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allow="fullscreen"
        allowFullScreen
        title="Vimeo video player"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default VimeoPlayer;
