
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
  // Filter out initial balance entries
  const filteredTrades = trades.filter(trade => !(trade.type === 'balance' || trade.type === ''));
  
  const equityData = filteredTrades
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
      
      <div className="w-full overflow-hidden">
        <div className="h-[350px] w-full">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={equityData} 
                margin={{ top: 10, right: 30, left: 15, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                  height={20}
                  tick={{ fontSize: 10 }}
                  tickMargin={5}
                />
                <YAxis 
                  width={60} 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  domain={['dataMin', 'dataMax']}
                  padding={{ top: 20, bottom: 20 }}
                />
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
      </div>
    </div>
  );
};

export default EquityChart;
