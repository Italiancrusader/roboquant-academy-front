
import React from 'react';
import { Settings2 } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-5xl px-4 mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          Build & launch profitable trading bots — <span className="gradient-text">without writing code</span>.
        </h1>
      </div>
      <div className="relative">
        <Settings2 
          className="w-16 h-16 text-blue-primary animate-spin" 
          style={{ 
            animation: 'spin 3s linear infinite',
            filter: 'drop-shadow(0 0 8px rgba(0, 128, 255, 0.5))'
          }}
        />
        <div className="absolute inset-0 bg-gradient-radial from-blue-primary/20 to-transparent blur-xl" />
      </div>
      <img 
        src="/lovable-uploads/fd0974dc-cbd8-4af8-b3c8-35c6a8182cf5.png" 
        alt="Preloading" 
        width="1" 
        height="1" 
        style={{ position: 'absolute', opacity: 0 }}
        fetchPriority="high"
      />
    </div>
  );
};

export default LoadingAnimation;
