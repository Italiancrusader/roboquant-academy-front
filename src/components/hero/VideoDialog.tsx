
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const VideoDialog: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

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
          src="https://www.youtube.com/embed/5QWLpAUv6r8?autoplay=0"
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Demo Video"
          loading="lazy"
          style={{
            border: 'none',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={() => setIsLoading(false)}
          allowFullScreen
        />
      </div>
    </DialogContent>
  );
};

export default VideoDialog;
