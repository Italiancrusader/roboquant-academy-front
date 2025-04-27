
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';

interface MonthlyReturnsProps {
  trades: MT5Trade[];
}

const MonthlyReturns: React.FC<MonthlyReturnsProps> = ({ trades }) => {
  const monthlyData = trades.reduce((acc, trade) => {
    if (!trade.profit) return acc;
    
    const date = new Date(trade.timeFlag || trade.openTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        return: 0,
        trades: 0,
        winRate: 0,
        wins: 0,
      };
    }
    
    acc[monthKey].return += trade.profit;
    acc[monthKey].trades += 1;
    if (trade.profit > 0) acc[monthKey].wins += 1;
    
    return acc;
  }, {} as Record<string, any>);

  // Convert to array and calculate win rates
  const data = Object.values(monthlyData).map(month => ({
    ...month,
    winRate: ((month.wins / month.trades) * 100).toFixed(1),
  }));

  // Calculate min and max for better domain visualization
  const returns = data.map(item => item.return);
  const minReturn = Math.min(...returns, 0); // Make sure we include zero
  const maxReturn = Math.max(...returns, 0); // Make sure we include zero
  
  // Add padding to the domain
  const padding = Math.max(Math.abs(minReturn), Math.abs(maxReturn)) * 0.1;
  const yDomain = [
    Math.floor(minReturn - padding), 
    Math.ceil(maxReturn + padding)
  ];

  const config = {
    returns: {
      label: 'Monthly Returns',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Monthly Returns</h2>
      <Card className="p-6">
        <div className="h-[350px] w-full">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    const date = new Date(Number(year), Number(month) - 1);
                    return date.toLocaleString('default', { month: 'short' });
                  }}
                />
                <YAxis 
                  domain={yDomain}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    const [year, month] = data.month.split('-');
                    const date = new Date(Number(year), Number(month) - 1);
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-xs font-medium">
                          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className={`text-sm font-bold ${data.return > 0 ? 'text-success' : 'text-destructive'}`}>
                          ${data.return.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Win Rate: {data.winRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {data.trades} trades
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="return"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  minPointSize={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.return > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyReturns;
