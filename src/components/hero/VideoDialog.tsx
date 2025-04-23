
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader, Volume2, VolumeX, Pause, Play } from 'lucide-react';

const VideoDialog: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const vimeoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('player.vimeo.com')) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.event === 'ready' && vimeoRef.current) {
          const player = vimeoRef.current;
          player.contentWindow?.postMessage(
            JSON.stringify({ method: 'setVolume', value: 1 }),
            '*'
          );
          setIsPlaying(true);
          setIsMuted(false);
        }
      } catch (error) {
        console.error('Error handling Vimeo message:', error);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const togglePlay = () => {
    if (vimeoRef.current) {
      const message = isPlaying ? 'pause' : 'play';
      vimeoRef.current.contentWindow?.postMessage(
        JSON.stringify({ method: message }), 
        '*'
      );
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (vimeoRef.current) {
      const volume = isMuted ? 1 : 0;
      vimeoRef.current.contentWindow?.postMessage(
        JSON.stringify({ method: 'setVolume', value: volume }),
        '*'
      );
      setIsMuted(!isMuted);
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px] p-0 bg-transparent border-0">
      <DialogTitle className="sr-only">Watch Demo Video</DialogTitle>
      <div className="video-container relative w-full aspect-video bg-black/90">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-primary" />
          </div>
        )}
        <iframe
          ref={vimeoRef}
          src="https://player.vimeo.com/video/1077981253?h=3cfe782ae5&autoplay=1&title=0&byline=0&portrait=0&background=0"
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
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default VideoDialog;
