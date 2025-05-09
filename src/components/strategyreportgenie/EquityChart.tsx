
import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
    const chartPoints = tradesWithBalance.map((trade, index) => {
      const date = trade.openTime;
      const equity = trade.balance || 0;
      
      // Calculate peak and drawdown
      let peak = 0;
      tradesWithBalance.slice(0, index + 1).forEach(t => {
        if ((t.balance || 0) > peak) {
          peak = t.balance || 0;
        }
      });
      
      const drawdown = peak > 0 ? peak - equity : 0;
      const drawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0;
      
      return {
        date,
        equity,
        drawdown,
        drawdownPct
      };
    });
    
    return chartPoints;
  }, [trades]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No equity data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Equity Growth</h2>
      <div className="h-[350px]">
        <ChartContainer config={{
          equity: { color: "hsl(var(--primary))" },
          drawdown: { color: "hsl(var(--destructive))" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(date) => date instanceof Date ? date.toLocaleDateString() : ''}
              />
              <YAxis 
                yAxisId="left" 
                stroke="hsl(var(--muted-foreground))" 
                label={{ 
                  value: 'Balance', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
                tickFormatter={value => `$${value}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                label={{ 
                  value: 'Drawdown %', 
                  angle: -90, 
                  position: 'insideRight',
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
                tickFormatter={value => `${value}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-foreground">
                              {data.date instanceof Date
                                ? data.date.toLocaleDateString()
                                : ''}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Equity
                            </span>
                            <span className="font-bold text-foreground">
                              ${data.equity.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Drawdown
                            </span>
                            <span className="font-bold text-foreground">
                              ${data.drawdown.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Drawdown %
                            </span>
                            <span className="font-bold text-foreground">
                              {data.drawdownPct.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                }}
              />
              <Legend iconType="line" />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="equity"
                name="Equity"
                stroke="hsl(var(--primary))"
                activeDot={{ r: 8 }}
                dot={false}
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="drawdownPct"
                fill="hsl(var(--destructive)/0.2)"
                name="Drawdown %"
                stroke="hsl(var(--destructive))"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default EquityChart;
