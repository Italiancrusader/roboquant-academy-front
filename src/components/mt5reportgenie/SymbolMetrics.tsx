
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';

interface SymbolMetricsProps {
  trades: MT5Trade[];
}

const SymbolMetrics: React.FC<SymbolMetricsProps> = ({ trades }) => {
  // Group trades by symbol
  const symbolData = trades.reduce((acc, trade) => {
    if (!trade.symbol || !trade.profit) return acc;
    
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = {
        symbol: trade.symbol,
        totalProfit: 0,
        trades: 0,
        wins: 0,
        volume: 0,
      };
    }
    
    acc[trade.symbol].totalProfit += trade.profit;
    acc[trade.symbol].trades += 1;
    if (trade.profit > 0) acc[trade.symbol].wins += 1;
    acc[trade.symbol].volume += trade.volumeLots || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // Convert to array and calculate metrics
  const data = Object.values(symbolData)
    .map(symbol => ({
      ...symbol,
      winRate: ((symbol.wins / symbol.trades) * 100).toFixed(1),
      avgProfit: (symbol.totalProfit / symbol.trades).toFixed(2),
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);

  const config = {
    symbols: {
      label: 'Symbol Performance',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Symbol Analysis</h2>
      <div className="grid grid-cols-1 gap-4">
        <Card className="pt-4">
          <div className="h-[350px] w-full">
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="symbol"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="text-xs font-medium">
                            {data.symbol}
                          </div>
                          <div className={`text-sm font-bold ${data.totalProfit > 0 ? 'text-success' : 'text-destructive'}`}>
                            ${data.totalProfit.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Win Rate: {data.winRate}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {data.trades} trades ({data.volume.toFixed(2)} lots)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Avg: ${data.avgProfit}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="totalProfit"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.totalProfit > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                        fillOpacity={0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SymbolMetrics;
