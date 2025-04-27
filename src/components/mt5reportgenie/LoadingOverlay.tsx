
import React from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">Processing your files...</p>
        <p className="text-sm text-muted-foreground">This might take a few moments</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
