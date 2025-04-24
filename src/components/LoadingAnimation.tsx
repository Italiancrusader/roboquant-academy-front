
import React from 'react';
import { Settings } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="text-center">
        <Settings className="w-16 h-16 text-blue-primary animate-spin" />
        <p className="mt-4 text-lg text-foreground">Loading RoboQuant Academy...</p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
