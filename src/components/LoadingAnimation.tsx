
import React from 'react';
import { Settings } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="text-center flex flex-col items-center justify-center space-y-4">
        <Settings 
          className="w-24 h-24 text-blue-primary animate-spin-slow" 
          strokeWidth={1.5} 
        />
        <p className="text-xl text-foreground/80 font-light tracking-wide">
          Loading RoboQuant Academy...
        </p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
