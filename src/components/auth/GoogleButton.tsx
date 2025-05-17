
import React from 'react';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

interface GoogleButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, isLoading }) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={onClick}
      disabled={isLoading}
    >
      <Chrome size={18} />
      {isLoading ? "Connecting..." : "Continue with Google"}
    </Button>
  );
};

export default GoogleButton;
