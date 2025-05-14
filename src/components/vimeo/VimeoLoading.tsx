
import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Simple loading spinner overlay for Vimeo player
 */
const VimeoLoading: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
      <Loader className="h-10 w-10 text-primary animate-spin" />
    </div>
  );
};

export default VimeoLoading;
