
import React from 'react';
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

interface EquityChartProps {
  trades: StrategyTrade[];
}

const EquityChart: React.FC<EquityChartProps> = ({ trades }) => {
  const chartData = React.useMemo(() => {
    if (!trades.length) return [];
    
    // Get trades with balance information
    const tradesWithBalance = trades.filter(trade => trade.balance !== undefined);
    
    if (tradesWithBalance.length === 0) return [];
    
    // Keep only relevant fields for chart
    const chartPoints = tradesWithBalance.map((trade) => {
      return {
        date: trade.openTime,
        equity: trade.balance || 0
      };
    });
    
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
  
  // Calculate padding to ensure all points are visible (15% padding instead of 10%)
  const equityPadding = React.useMemo(() => {
    return (maxEquity - minEquity) * 0.15;
  }, [minEquity, maxEquity]);
  
  const yAxisMin = Math.max(0, minEquity - equityPadding);
  const yAxisMax = maxEquity + equityPadding;

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No equity data available</p>
      </div>
    );
  }

  // Get first and last point for markers
  const firstPoint = chartData[0];
  const lastPoint = chartData[chartData.length - 1];

  // Format date for display in the chart
  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) return '';
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear().toString().substring(2)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Equity Growth</h2>
        {chartData.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Initial: ${firstPoint.equity.toLocaleString()}
            <span className="mx-2">•</span>
            Final: ${lastPoint.equity.toLocaleString()}
          </div>
        )}
      </div>
      <div className="h-[400px] w-full"> {/* Increased height for better visibility */}
        <ChartContainer config={{
          equity: { color: "hsl(var(--primary))" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 25,
                bottom: 40,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(date) => {
                  if (!(date instanceof Date)) return '';
                  return formatDate(date);
                }}
                height={60}
                tick={{ fontSize: 12 }}
                tickMargin={15}
                label={{ 
                  value: 'Date', 
                  position: 'insideBottom', 
                  offset: -20,
                  fill: 'hsl(var(--muted-foreground))' 
                }}
                interval="preserveStartEnd"
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                yAxisId="left" 
                stroke="hsl(var(--muted-foreground))" 
                domain={[yAxisMin, yAxisMax]}
                label={{ 
                  value: 'Balance ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -5,
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
                tickFormatter={value => `$${value.toLocaleString()}`}
                width={80}
                tickMargin={8}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-foreground">
                              {data.date instanceof Date
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
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="equity"
                name="Equity"
                stroke="hsl(var(--primary))"
                activeDot={{ r: 8 }}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              {/* Marker for first point */}
              <ReferenceDot
                x={0}  // Use the index (0) instead of the Date object
                y={firstPoint.equity}
                yAxisId="left"
                r={6}
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
              {/* Marker for last point */}
              <ReferenceDot
                x={chartData.length - 1}  // Last index
                y={lastPoint.equity}
                yAxisId="left"
                r={6}
                fill="hsl(var(--success))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default EquityChart;
