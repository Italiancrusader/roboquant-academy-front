
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full text-center space-y-4">
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
        <div>
          <h3 className="text-lg font-medium">Processing</h3>
          <p className="text-muted-foreground mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
