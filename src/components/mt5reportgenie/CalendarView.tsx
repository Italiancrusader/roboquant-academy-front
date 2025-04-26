
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  ResponsiveContainer,
  Treemap,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';

interface CalendarViewProps {
  trades: MT5Trade[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
  // Group trades by month
  const monthlyData = trades.reduce((acc, trade) => {
    if (!trade.profit) return acc;
    
    const date = new Date(trade.timeFlag || trade.openTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthKey,
        profit: 0,
        trades: 0,
      };
    }
    
    acc[monthKey].profit += trade.profit;
    acc[monthKey].trades += 1;
    
    return acc;
  }, {} as Record<string, any>);

  // Convert to array format which is what Treemap expects
  const treeData = Object.values(monthlyData);

  const config = {
    calendar: {
      label: 'Monthly Returns',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Monthly Performance</h2>
      <Card className="pt-6">
        <div className="h-[400px]">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treeData}
                dataKey="profit"
                stroke="hsl(var(--border))"
                fill="hsl(var(--primary))"
                valueKey="profit"
              >
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    const [year, month] = data.name.split('-');
                    const date = new Date(Number(year), Number(month) - 1);
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-xs font-medium">
                          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className={`text-sm font-bold ${data.profit > 0 ? 'text-success' : 'text-destructive'}`}>
                          ${data.profit.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {data.trades} trades
                        </div>
                      </div>
                    );
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};

export default CalendarView;
