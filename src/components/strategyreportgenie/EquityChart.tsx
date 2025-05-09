import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { Toggle } from '@/components/ui/toggle';
import { useIsMobile } from '@/hooks/use-mobile';

interface EquityChartProps {
  trades: StrategyTrade[];
}

const EquityChart: React.FC<EquityChartProps> = ({ trades }) => {
  const [useLogScale, setUseLogScale] = useState(false);
  const isMobile = useIsMobile();
  
  const chartData = React.useMemo(() => {
    if (!trades.length) return [];
    
    // Get trades with balance information
    const tradesWithBalance = trades.filter(trade => trade.balance !== undefined);
    
    if (tradesWithBalance.length === 0) return [];
    
    // Keep only relevant fields for chart
    const chartPoints = tradesWithBalance.map((trade) => {
      // Validate that trade.openTime is a proper Date object
      const validDate = trade.openTime instanceof Date && !isNaN(trade.openTime.getTime());
      
      if (!validDate) {
        console.error("Invalid date found in trade:", trade);
      }
      
      return {
        date: validDate ? trade.openTime : new Date(),
        equity: trade.balance || 0
      };
    });
    
    // Sort chart points by date
    chartPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return chartPoints;
  }, [trades]);

  // Calculate min and max equity values
  const minEquity = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    // Use Math.floor to ensure we get a bit lower than the actual minimum
    return Math.floor(Math.min(...chartData.map(d => d.equity)) * 0.95);
  }, [chartData]);
  
  const maxEquity = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    // Use Math.ceil to ensure we get a bit higher than the actual maximum
    return Math.ceil(Math.max(...chartData.map(d => d.equity)) * 1.05);
  }, [chartData]);
  
  // Calculate padding to ensure all points are visible (increased from 15% to 20%)
  const equityPadding = React.useMemo(() => {
    return (maxEquity - minEquity) * 0.2;
  }, [minEquity, maxEquity]);
  
  // For log scale, we need positive values only
  const safeMinEquity = Math.max(1, minEquity - equityPadding);
  
  // Use different y-axis min/max based on scale type
  const yAxisMin = useLogScale ? safeMinEquity : Math.max(0, minEquity - equityPadding);
  const yAxisMax = maxEquity + equityPadding;

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No equity data available</p>
      </div>
    );
  }

  // Get first and last point for markers
  const firstPoint = chartData[0];
  const lastPoint = chartData[chartData.length - 1];

  // Format date for display in the chart
  const formatDate = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear().toString().substring(2)}`;
  };
  
  // Calculate appropriate interval for x-axis ticks based on data length
  const calculateTickInterval = () => {
    if (chartData.length <= 10) return 0; // Show all ticks for small datasets
    if (chartData.length <= 30) return Math.floor(chartData.length / 10);
    return isMobile ? 'preserveEnd' : 'preserveStartEnd'; // For large datasets, adjust based on device
  };

  // Function to get a unique identifier for a date that can be used as the x value
  const getDateKey = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toISOString();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Equity Growth</h2>
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
          {chartData.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Initial: ${firstPoint.equity.toLocaleString()}
              <span className="mx-2">•</span>
              Final: ${lastPoint.equity.toLocaleString()}
            </div>
          )}
        </div>
      </div>
      <div className="h-[350px] md:h-[450px] w-full"> 
        <ChartContainer config={{
          equity: { color: "hsl(var(--primary))" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={isMobile ? 
                { top: 20, right: 20, left: 20, bottom: 60 } : 
                { top: 20, right: 40, left: 40, bottom: 60 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(date) => {
                  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
                  return formatDate(date);
                }}
                height={60}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickMargin={15}
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
                yAxisId="left" 
                stroke="hsl(var(--muted-foreground))" 
                domain={[yAxisMin, yAxisMax]}
                scale={useLogScale ? 'log' : 'auto'}
                label={{ 
                  value: 'Balance ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: isMobile ? -5 : -15,
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
                tickFormatter={value => `$${value.toLocaleString()}`}
                width={isMobile ? 60 : 80}
                tickMargin={8}
                allowDataOverflow={useLogScale}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
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
                        </div>
                      </div>
                    );
                  }

                  return null;
                }}
                wrapperStyle={{ zIndex: 1000 }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                content={() => (
                  <div className="flex justify-center items-center mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
                      <span className="text-xs text-muted-foreground">Equity</span>
                    </div>
                  </div>
                )}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="equity"
                name="Equity"
                stroke="hsl(var(--primary))"
                activeDot={{ r: 6 }}
                dot={false}
                strokeWidth={2}
                animationDuration={1000}
              />
              {/* Reference dots for first and last points */}
              {firstPoint.date instanceof Date && !isNaN(firstPoint.date.getTime()) && (
                <ReferenceDot
                  x={getDateKey(firstPoint.date)}
                  y={firstPoint.equity}
                  yAxisId="left"
                  r={5}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              )}
              {lastPoint.date instanceof Date && !isNaN(lastPoint.date.getTime()) && (
                <ReferenceDot
                  x={getDateKey(lastPoint.date)}
                  y={lastPoint.equity}
                  yAxisId="left"
                  r={5}
                  fill="hsl(var(--success))"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default EquityChart;
