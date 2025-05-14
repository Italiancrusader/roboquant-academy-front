
import React, { useState } from 'react';
import { VimeoPlayer } from './vimeo';
import { toast } from '@/components/ui/use-toast';
import VideoErrorHandler from './video/VideoErrorHandler';
import { useVideoProgress } from '@/hooks/useVideoProgress';

interface VideoPlayerProps {
  videoUrl: string | null;
  lessonId: string;
  courseId: string;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  lessonId,
  courseId,
  onComplete,
}) => {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const {
    currentTime,
    duration,
    isAdmin,
    setCurrentTime,
    setDuration
  } = useVideoProgress({
    lessonId,
    courseId,
    videoUrl,
    onComplete
  });
  
  if (!videoUrl) {
    return null;
  }
  
  const handleError = (message: string) => {
    console.error("Video player error:", message);
    setVideoError(message);
    
    // Only show toast for non-notfound errors
    if (!message.includes('notfound')) {
      toast({
        title: "Video Error",
        description: message,
        variant: "destructive",
      });
    }
  };
  
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  const handleDurationChange = (videoDuration: number) => {
    setDuration(videoDuration);
  };
  
  const handleComplete = () => {
    if (onComplete && !isAdmin) {
      onComplete();
    }
  };
  
  const handleRetry = () => {
    setVideoError(null);
    setRetryCount(prev => prev + 1);
  };
  
  // If there's an error, show the error dialog
  if (videoError) {
    return (
      <VideoErrorHandler 
        error={videoError}
        onRetry={handleRetry}
        videoId={videoUrl}
      />
    );
  }
  
  return (
    <VimeoPlayer 
      key={`vimeo-player-${retryCount}`}
      videoUrl={videoUrl} 
      controls={true}
      onComplete={handleComplete}
      onTimeUpdate={handleTimeUpdate}
      onDurationChange={handleDurationChange}
      onError={handleError}
    />
  );
};

export default VideoPlayer;
