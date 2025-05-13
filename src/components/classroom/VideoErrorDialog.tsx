
import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface VideoErrorDialogProps {
  error: string;
  videoId?: string;
  onRetry: () => void;
}

const VideoErrorDialog: React.FC<VideoErrorDialogProps> = ({
  error,
  videoId,
  onRetry
}) => {
  const { user } = useAuth();
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  const getErrorTitle = () => {
    if (error.includes('notfound')) {
      return 'Video Not Found';
    }
    if (error.includes('private')) {
      return 'Private Video';
    }
    return 'Video Error';
  };
  
  const getErrorDetails = () => {
    if (error.includes('notfound')) {
      return 'This video could not be found or has been removed.';
    }
    if (error.includes('private')) {
      return 'This video is private and requires permission to view.';
    }
    return error;
  };
  
  return (
    <div className="flex flex-col items-center justify-center bg-black/90 p-8 rounded-lg text-white text-center h-full">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">{getErrorTitle()}</h2>
      <p className="text-gray-300 mb-6 max-w-sm">{getErrorDetails()}</p>
      
      <Button 
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
        onClick={onRetry}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
      
      {isAdmin && videoId && (
        <div className="mt-6 p-3 border border-amber-800/30 bg-amber-950/20 rounded-md max-w-sm text-left">
          <p className="text-amber-400 text-sm font-medium mb-1">Admin Info:</p>
          <p className="text-xs text-amber-200/70">
            The Vimeo player reported a "notfound" event for video ID: {videoId}.<br/>
            This typically means one of these issues:
          </p>
          <ul className="text-xs text-amber-200/70 list-disc list-inside mt-1 space-y-1">
            <li>The video has been deleted from Vimeo</li>
            <li>The video ID is incorrect</li>
            <li>The video is private and requires authentication</li>
            <li>Domain restrictions are preventing video playback</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoErrorDialog;
