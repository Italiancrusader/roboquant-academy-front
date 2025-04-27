
import React from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-8 shadow-lg text-center space-y-5 max-w-sm">
        <div className="flex justify-center">
          <LoaderCircle className="w-16 h-16 animate-spin text-primary" />
        </div>
        <div>
          <p className="text-xl font-semibold text-foreground">Analyzing Your Data</p>
          <p className="text-sm text-muted-foreground mt-2">
            Crunching the numbers and preparing your report...
          </p>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
