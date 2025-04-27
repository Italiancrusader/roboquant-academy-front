
import React from 'react';
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
  const equityData = trades
    .filter(trade => trade.balance)
    .map(trade => ({
      date: trade.openTime,
      equity: trade.balance,
      profit: trade.profit || 0,
    }));

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Equity Curve</h2>
        <div className="text-sm text-muted-foreground">
          {equityData.length > 0 && (
            <>
              Initial: ${equityData[0].equity.toLocaleString()}
              <span className="mx-2">•</span>
              Final: ${equityData[equityData.length - 1].equity.toLocaleString()}
            </>
          )}
        </div>
      </div>
      
      <Card className="pt-4">
        <div className="h-[350px] w-full">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  height={40}
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-xs text-muted-foreground">
                          {new Date(data.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-bold">
                          ${data.equity.toLocaleString()}
                        </div>
                        {data.profit !== 0 && (
                          <div className={`text-xs ${data.profit > 0 ? 'text-success' : 'text-destructive'}`}>
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
                  fillOpacity={1}
                  fill="url(#equity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};

export default EquityChart;
