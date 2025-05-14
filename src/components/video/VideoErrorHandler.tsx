
import React from 'react';
import { VideoErrorDialog } from '@/components/classroom';

interface VideoErrorHandlerProps {
  error: string | null;
  onRetry: () => void;
  videoId?: string;
}

const VideoErrorHandler: React.FC<VideoErrorHandlerProps> = ({ error, onRetry, videoId }) => {
  if (!error) return null;
  
  return (
    <div className="aspect-video bg-black">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full h-full">
          <VideoErrorDialog 
            error={error}
            onRetry={onRetry}
            videoId={videoId?.split('/').pop()?.split('?')[0]}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoErrorHandler;
