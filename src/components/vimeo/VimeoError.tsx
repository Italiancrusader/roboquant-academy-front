
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VimeoErrorProps {
  error: string;
  vimeoId?: string;
  vimeoHash?: string;
  onRetry: () => void;
  isAdmin?: boolean;
}

/**
 * Component to display Vimeo player errors with a retry button
 */
const VimeoError: React.FC<VimeoErrorProps> = ({ 
  error, 
  vimeoId, 
  vimeoHash, 
  onRetry, 
  isAdmin 
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 z-10">
      <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
      <p className="text-center font-medium text-lg">Unable to load video</p>
      <p className="text-sm text-gray-400 mt-1 max-w-md text-center">{error}</p>
      
      <Button 
        variant="secondary" 
        className="mt-4 flex items-center gap-2" 
        onClick={onRetry}
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
      
      {isAdmin && vimeoId && (
        <div className="mt-4 text-xs bg-amber-800/50 p-3 rounded max-w-md">
          <strong>Admin note:</strong> This may be due to privacy restrictions or an invalid video URL. 
          Video ID: {vimeoId}{vimeoHash ? `/${vimeoHash}` : ''}
        </div>
      )}
    </div>
  );
};

export default VimeoError;
