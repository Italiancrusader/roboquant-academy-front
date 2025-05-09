
import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toggle } from '@/components/ui/toggle';

interface EquityChartProps {
  trades: MT5Trade[];
}

const EquityChart: React.FC<EquityChartProps> = ({ trades }) => {
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [useLogScale, setUseLogScale] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Filter out initial balance entries
  const filteredTrades = trades.filter(trade => !(trade.type === 'balance' || trade.type === ''));
  
  const equityData = React.useMemo(() => {
    return filteredTrades
      .filter(trade => trade.balance)
      .map(trade => ({
        date: trade.openTime,
        equity: trade.balance,
        profit: trade.profit || 0,
      }));
  }, [filteredTrades]);

  // Calculate min and max equity values
  const minEquity = React.useMemo(() => {
    if (equityData.length === 0) return 0;
    // Use Math.floor to ensure we get a bit lower than the actual minimum
    return Math.floor(Math.min(...equityData.map(d => d.equity)) * 0.95);
  }, [equityData]);
  
  const maxEquity = React.useMemo(() => {
    if (equityData.length === 0) return 0;
    // Use Math.ceil to ensure we get a bit higher than the actual maximum
    return Math.ceil(Math.max(...equityData.map(d => d.equity)) * 1.05);
  }, [equityData]);
  
  // Calculate padding to ensure all points are visible (increased from 15% to 20%)
  const equityPadding = React.useMemo(() => {
    return (maxEquity - minEquity) * 0.2;
  }, [minEquity, maxEquity]);
  
  // For log scale, we need positive values only
  const safeMinEquity = Math.max(1, minEquity - equityPadding);
  
  // Use different y-axis min/max based on scale type
  const yAxisMin = useLogScale ? safeMinEquity : Math.max(0, minEquity - equityPadding);
  const yAxisMax = maxEquity + equityPadding;
  
  // Calculate nice round numbers for Y-axis ticks
  const calculateYAxisTicks = () => {
    if (equityData.length === 0) return [0];
    
    const range = yAxisMax - yAxisMin;
    const tickCount = 5; // We want 5 evenly spaced ticks
    const roughStep = range / (tickCount - 1);
    
    // Round step to a nice number (1, 2, 5, 10, 20, 50, etc.)
    let magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    let normalizedStep = roughStep / magnitude;
    
    // Choose a nice number close to the normalized step
    if (normalizedStep < 1.5) normalizedStep = 1;
    else if (normalizedStep < 3) normalizedStep = 2;
    else if (normalizedStep < 7) normalizedStep = 5;
    else normalizedStep = 10;
    
    const step = normalizedStep * magnitude;
    
    // Calculate start value (round down to the nearest step)
    const startValue = Math.floor(yAxisMin / step) * step;
    
    // Generate ticks
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const value = startValue + i * step;
      if (value <= yAxisMax) {
        ticks.push(value);
      }
    }
    
    // Ensure max value is included
    if (ticks[ticks.length - 1] < yAxisMax) {
      ticks.push(ticks[ticks.length - 1] + step);
    }
    
    return ticks;
  };
  
  const yAxisTicks = calculateYAxisTicks();

  // Update chart width when component mounts or window resizes
  useEffect(() => {
    const updateChartWidth = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.getBoundingClientRect().width;
        setChartWidth(width);
      }
    };
    
    // Initial width calculation
    updateChartWidth();
    
    // Add event listener for window resize
    window.addEventListener('resize', updateChartWidth);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateChartWidth);
    };
  }, []);

  const config = {
    equity: {
      label: 'Equity',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
    profit: {
      label: 'Trade P/L',
      theme: {
        light: 'hsl(var(--success))',
        dark: 'hsl(var(--success))',
      },
    },
  };

  // Find initial and final equity values for display
  const initialEquity = equityData.length > 0 ? equityData[0].equity : 0;
  const finalEquity = equityData.length > 0 ? equityData[equityData.length - 1].equity : 0;

  // Format date for display in the chart
  const formatDate = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear().toString().substring(2)}`;
  };

  // Calculate appropriate interval for x-axis ticks based on data length
  const calculateTickInterval = () => {
    if (equityData.length <= 10) return 0; // Show all ticks for small datasets
    if (equityData.length <= 30) return Math.floor(equityData.length / 10);
    return isMobile ? 'preserveEnd' : 'preserveStartEnd'; // For large datasets, adjust based on device
  };

  if (equityData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No equity data available</p>
      </div>
    );
  }

  // Get first and last point for markers
  const firstPoint = equityData[0];
  const lastPoint = equityData[equityData.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Equity Curve</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Toggle
              aria-label="Toggle logarithmic scale"
              pressed={useLogScale}
              onPressedChange={setUseLogScale}
              size="sm"
            >
              Log Scale
            </Toggle>
          </div>
          {equityData.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Initial: ${initialEquity.toLocaleString()}
              <span className="mx-2">•</span>
              Final: ${finalEquity.toLocaleString()}
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={chartContainerRef} 
        className="w-full"
      >
        <div className="h-[350px] md:h-[450px] w-full">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={equityData} 
                margin={isMobile ? 
                  { top: 20, right: 20, left: 20, bottom: 60 } : 
                  { top: 20, right: 40, left: 40, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return formatDate(d);
                  }}
                  height={60}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickMargin={15}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1.5 }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  label={{ 
                    value: 'Date', 
                    position: 'insideBottom', 
                    offset: -20,
                    fill: 'hsl(var(--muted-foreground))' 
                  }}
                  interval={calculateTickInterval()}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  width={isMobile ? 60 : 80}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `$${Math.round(value / 1000)}k`;
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
                  axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1.5 }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  label={{ 
                    value: 'Equity ($)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: isMobile ? -5 : -15,
                    style: { textAnchor: 'middle' },
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  allowDataOverflow={useLogScale}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-xl">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-foreground">
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
                            <span className="font-bold text-foreground">
                              ${data.equity.toLocaleString()}
                            </span>
                          </div>
                          {data.profit !== 0 && (
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Trade P/L
                              </span>
                              <span className={`font-bold ${data.profit > 0 ? 'text-success' : 'text-destructive'}`}>
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
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#equity)"
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                {/* Reference dots for first and last points */}
                <ReferenceDot
                  x={firstPoint.date}
                  y={firstPoint.equity}
                  r={5}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
                <ReferenceDot
                  x={lastPoint.date}
                  y={lastPoint.equity}
                  r={5}
                  fill="hsl(var(--success))"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default EquityChart;
