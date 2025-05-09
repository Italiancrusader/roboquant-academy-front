
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChartConfig } from '@/components/ui/chart';

interface ChartWrapperProps {
  title: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  emptyState?: React.ReactNode;
  height?: string;
  footer?: React.ReactNode;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  description,
  className,
  contentClassName,
  headerClassName,
  actions,
  children,
  loading = false,
  emptyState,
  height = "h-[350px]",
  footer
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("pb-2", headerClassName)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            )}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent className={cn("p-0", contentClassName)}>
        {loading ? (
          <div className={cn("flex items-center justify-center", height)}>
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
              <span className="text-xs text-muted-foreground mt-2">Loading data...</span>
            </div>
          </div>
        ) : children ? (
          <div className={cn(height)}>{children}</div>
        ) : emptyState ? (
          <div className={cn("flex items-center justify-center", height)}>
            {emptyState}
          </div>
        ) : (
          <div className={cn("flex items-center justify-center", height)}>
            <span className="text-sm text-muted-foreground">No data available</span>
          </div>
        )}
        
        {footer && (
          <div className="p-4 border-t border-border text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartWrapper;
