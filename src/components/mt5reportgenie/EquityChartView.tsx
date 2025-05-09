
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
  CartesianGrid,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';
import { Toggle } from '@/components/ui/toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import ChartWrapper from '@/components/ui/chart-wrapper';
import MetricCard from '@/components/ui/metrics-card';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface EquityChartViewProps {
  trades: MT5Trade[];
}

const EquityChartView: React.FC<EquityChartViewProps> = ({ trades }) => {
  const [useLogScale, setUseLogScale] = useState(false);
  const isMobile = useIsMobile();
  
  // Filter out initial balance entries
  const filteredTrades = trades.filter(trade => !(trade.type === 'balance' || trade.type === ''));
  
  const equityData = React.useMemo(() => {
    return filteredTrades
      .filter(trade => trade.balance)
      .map(trade => ({
        date: trade.openTime,
        dateStr: trade.openTime.toISOString(), // Add string representation of date for ReferenceDot
        equity: trade.balance,
        profit: trade.profit || 0,
      }));
  }, [filteredTrades]);

  // Calculate min and max equity values
  const minEquity = React.useMemo(() => {
    if (equityData.length === 0) return 0;
    return Math.floor(Math.min(...equityData.map(d => d.equity)) * 0.95);
  }, [equityData]);
  
  const maxEquity = React.useMemo(() => {
    if (equityData.length === 0) return 0;
    return Math.ceil(Math.max(...equityData.map(d => d.equity)) * 1.05);
  }, [equityData]);
  
  // Calculate padding to ensure all points are visible
  const equityPadding = React.useMemo(() => {
    return (maxEquity - minEquity) * 0.2;
  }, [minEquity, maxEquity]);
  
  // For log scale, we need positive values only
  const safeMinEquity = Math.max(1, minEquity - equityPadding);
  
  // Use different y-axis min/max based on scale type
  const yAxisMin = useLogScale ? safeMinEquity : Math.max(0, minEquity - equityPadding);
  const yAxisMax = maxEquity + equityPadding;
  
  // Calculate nice round numbers for Y-axis ticks
  const yAxisTicks = React.useMemo(() => {
    if (equityData.length === 0) return [0];
    
    const range = yAxisMax - yAxisMin;
    const tickCount = 5;
    const roughStep = range / (tickCount - 1);
    
    let magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    let normalizedStep = roughStep / magnitude;
    
    if (normalizedStep < 1.5) normalizedStep = 1;
    else if (normalizedStep < 3) normalizedStep = 2;
    else if (normalizedStep < 7) normalizedStep = 5;
    else normalizedStep = 10;
    
    const step = normalizedStep * magnitude;
    const startValue = Math.floor(yAxisMin / step) * step;
    
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const value = startValue + i * step;
      if (value <= yAxisMax) {
        ticks.push(value);
      }
    }
    
    if (ticks[ticks.length - 1] < yAxisMax) {
      ticks.push(ticks[ticks.length - 1] + step);
    }
    
    return ticks;
  }, [yAxisMin, yAxisMax, equityData.length]);

  // Find initial and final equity values for display
  const initialEquity = equityData.length > 0 ? equityData[0].equity : 0;
  const finalEquity = equityData.length > 0 ? equityData[equityData.length - 1].equity : 0;
  const equityChange = initialEquity > 0 ? ((finalEquity - initialEquity) / initialEquity) * 100 : 0;

  // Format date for display in the chart
  const formatDate = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear().toString().substring(2)}`;
  };

  // Calculate appropriate interval for x-axis ticks based on data length
  const calculateTickInterval = () => {
    if (equityData.length <= 10) return 0;
    if (equityData.length <= 30) return Math.floor(equityData.length / 10);
    return isMobile ? 'preserveEnd' : 'preserveStartEnd';
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (equityData.length === 0) {
    return (
      <ChartWrapper title="Equity Curve" emptyState={<p>No equity data available</p>}>
        {/* Fix: Add a null children prop to satisfy the required children property */}
        {null}
      </ChartWrapper>
    );
  }

  // Get first and last point for markers
  const firstPoint = equityData[0];
  const lastPoint = equityData[equityData.length - 1];

  const config = {
    equity: {
      label: 'Equity',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard 
          title="Initial Balance" 
          value={formatCurrency(initialEquity)}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Current Balance" 
          value={formatCurrency(finalEquity)}
          variant="filled"
          size="sm"
          trend={finalEquity > initialEquity ? 'up' : finalEquity < initialEquity ? 'down' : 'neutral'}
        />
        <MetricCard 
          title="Net P/L" 
          value={formatCurrency(finalEquity - initialEquity)}
          trend={finalEquity > initialEquity ? 'up' : finalEquity < initialEquity ? 'down' : 'neutral'}
          icon={finalEquity > initialEquity ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Return" 
          value={`${equityChange.toFixed(2)}%`}
          trend={equityChange > 0 ? 'up' : equityChange < 0 ? 'down' : 'neutral'}
          icon={<TrendingUp size={16} />}
          variant="filled"
          size="sm"
        />
      </div>
      
      <ChartWrapper 
        title="Equity Curve" 
        description="Account equity progression over time"
        actions={
          <Toggle
            aria-label="Toggle logarithmic scale"
            pressed={useLogScale}
            onPressedChange={setUseLogScale}
            size="sm"
          >
            Log Scale
          </Toggle>
        }
        height="h-[400px]"
      >
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={equityData} 
              margin={isMobile ? 
                { top: 20, right: 10, left: 0, bottom: 60 } : 
                { top: 20, right: 25, left: 25, bottom: 60 }}
            >
              <defs>
                <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return formatDate(d);
                }}
                height={50}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickMargin={15}
                stroke="hsl(var(--muted-foreground))"
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'Date', 
                  position: 'insideBottom', 
                  offset: -10,
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12
                }}
                interval={calculateTickInterval()}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                width={isMobile ? 50 : 70}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `$${(value / 1000000).toFixed(1)}M`;
                  }
                  if (value >= 1000) {
                    return `$${(value / 1000).toFixed(0)}k`;
                  }
                  return `$${value}`;
                }}
                ticks={yAxisTicks}
                domain={[yAxisMin, yAxisMax]}
                scale={useLogScale ? 'log' : 'auto'}
                padding={{ top: 20, bottom: 20 }}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickMargin={8}
                stroke="hsl(var(--muted-foreground))"
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'Equity ($)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  offset: isMobile ? 0 : 10,
                  style: { textAnchor: 'middle', fontSize: 12 },
                  fill: 'hsl(var(--muted-foreground))'
                }}
                allowDataOverflow={useLogScale}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md">
                      <div className="grid grid-cols-1 gap-1.5">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Date
                          </span>
                          <span className="font-medium text-foreground">
                            {data.date instanceof Date && !isNaN(data.date.getTime())
                              ? data.date.toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : ''}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Equity
                          </span>
                          <span className="font-medium text-foreground">
                            ${data.equity.toLocaleString()}
                          </span>
                        </div>
                        {data.profit !== 0 && (
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Trade P/L
                            </span>
                            <span className={`font-medium ${data.profit > 0 ? 'text-success' : 'text-destructive'}`}>
                              {data.profit > 0 ? '+' : ''}{data.profit.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
                wrapperStyle={{ zIndex: 1000 }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#equity)"
                isAnimationActive={true}
                animationDuration={1000}
              />
              
              {/* Reference dots for first and last points */}
              <ReferenceDot
                x={firstPoint.dateStr}
                y={firstPoint.equity}
                r={5}
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
              <ReferenceDot
                x={lastPoint.dateStr}
                y={lastPoint.equity}
                r={5}
                fill="hsl(var(--success))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartWrapper>
    </div>
  );
};

export default EquityChartView;
