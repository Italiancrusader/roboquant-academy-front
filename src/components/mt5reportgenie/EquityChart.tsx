
import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';

interface EquityChartProps {
  trades: MT5Trade[];
}

const EquityChart: React.FC<EquityChartProps> = ({ trades }) => {
  const [chartWidth, setChartWidth] = useState<number>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Filter out initial balance entries
  const filteredTrades = trades.filter(trade => !(trade.type === 'balance' || trade.type === ''));
  
  const equityData = filteredTrades
    .filter(trade => trade.balance)
    .map(trade => ({
      date: trade.openTime,
      equity: trade.balance,
      profit: trade.profit || 0,
    }));

  // Update chart width when component mounts or window resizes
  useEffect(() => {
    const updateChartWidth = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.getBoundingClientRect().width;
        setChartWidth(width);
        console.log("Chart width is set to", width);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Equity Curve</h2>
        <div className="text-sm text-muted-foreground">
          {equityData.length > 0 && (
            <>
              Initial: ${initialEquity.toLocaleString()}
              <span className="mx-2">•</span>
              Final: ${finalEquity.toLocaleString()}
            </>
          )}
        </div>
      </div>
      
      <div 
        ref={chartContainerRef} 
        className="w-full overflow-visible"
      >
        <div className="h-[400px] w-full relative"> {/* Increased height and added relative positioning */}
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={equityData} 
                margin={{ top: 20, right: 40, left: 10, bottom: 30 }} // Adjusted margins
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
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                  height={30}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  width={40} // Reduced width to save horizontal space
                  tickFormatter={(value) => `$${value/1000}k`} // More compact format
                  domain={['auto', 'auto']} // Auto-scale to data
                  padding={{ top: 20, bottom: 20 }}
                  tick={{ fontSize: 12 }}
                  tickMargin={5}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-xl">
                        <div className="text-xs text-muted-foreground">
                          {new Date(data.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm font-bold mt-1">
                          ${data.equity.toLocaleString()}
                        </div>
                        {data.profit !== 0 && (
                          <div className={`text-xs mt-1 ${data.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {data.profit > 0 ? '+' : ''}{data.profit.toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  }}
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
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default EquityChart;
