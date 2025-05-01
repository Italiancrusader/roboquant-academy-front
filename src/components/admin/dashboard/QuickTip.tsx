
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface QuickTipProps {
  title: string;
  description: string;
}

const QuickTip = ({ title, description }: QuickTipProps) => {
  return (
    <Alert className="mb-6">
      <Info className="h-4 w-4 mr-2" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  );
};

export default QuickTip;
