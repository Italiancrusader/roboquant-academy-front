
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickTipProps {
  title: string;
  description: string;
  resourceUrl?: string;
  resourceLabel?: string;
  className?: string;
}

const QuickTip = ({ 
  title, 
  description, 
  resourceUrl,
  resourceLabel = "View Resource",
  className 
}: QuickTipProps) => {
  return (
    <Alert className={cn("mb-6", className)}>
      <Info className="h-4 w-4 mr-2" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col">
        <p className="mb-2">{description}</p>
        
        {resourceUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 w-fit mt-2"
            asChild
          >
            <a href={resourceUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4" />
              {resourceLabel}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default QuickTip;
