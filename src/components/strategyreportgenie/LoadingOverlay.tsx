
import React from 'react';
import { ChartBar, Sigma, Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg text-center space-y-5 max-w-md w-full mx-4">
        <div className="flex justify-center items-center gap-4">
          <div className="relative">
            <ChartBar className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sigma className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary" />
        </div>
        <div>
          <p className="text-lg sm:text-xl font-semibold text-foreground">Analyzing Trading Data</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 break-words whitespace-normal overflow-hidden">
            {message || "Calculating performance metrics and generating insights..."}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <div className="text-xs text-muted-foreground">Processing trade history and equity curves</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
