
import React, { useState } from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoErrorDialog from '@/components/classroom/VideoErrorDialog';

interface VideoDialogProps {
  videoId: string;
}

const VideoDialog: React.FC<VideoDialogProps> = ({ videoId }) => {
  const [error, setError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);
  
  // Check if it's a YouTube video ID (assuming it's not a full URL)
  const isYouTubeVideo = !videoId.includes("vimeo.com");
  
  const handleRetry = () => {
    setError(null);
    setRetryCounter(prev => prev + 1);
  };
  
  const handleError = () => {
    setError("Failed to load video. Please try again.");
  };
  
  // If there's an error, show the error dialog
  if (error) {
    return (
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <div className="relative aspect-video w-full">
          <VideoErrorDialog 
            error={error}
            videoId={videoId}
            onRetry={handleRetry}
          />
        </div>
      </DialogContent>
    );
  }
  
  return (
    <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
      <div className="relative aspect-video w-full">
        {isYouTubeVideo ? (
          <iframe
            key={`youtube-${retryCounter}`}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
            onError={handleError}
          />
        ) : (
          <iframe
            key={`vimeo-${retryCounter}`}
            src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&autoplay=1&dnt=0&controls=1&transparent=0&app_id=58479&player_id=player${videoId}&pip=0&portrait=0&badge=0&background=true&t=${Date.now()}`}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo video player"
            onError={handleError}
          />
        )}
      </div>
    </DialogContent>
  );
};

export default VideoDialog;
