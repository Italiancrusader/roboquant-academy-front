
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'default',
  trend = 'neutral',
  className,
  prefix,
  suffix,
  loading = false,
  size = 'md',
}) => {
  const trendClass = trend === 'up' 
    ? 'text-success' 
    : trend === 'down' 
      ? 'text-destructive' 
      : 'text-muted-foreground';

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const valueClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Card className={cn(
      variant === 'filled' && 'bg-muted/30',
      className
    )}>
      <CardContent className={cn("flex justify-between items-start", sizeClasses[size])}>
        <div>
          <p className="text-muted-foreground text-xs mb-1">{title}</p>
          {loading ? (
            <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            <p className={cn("font-semibold", valueClasses[size])}>
              {prefix}{value}{suffix}
            </p>
          )}
          
          {typeof change !== 'undefined' && (
            <p className={cn("text-xs mt-1 flex items-center", trendClass)}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        {icon && (
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
