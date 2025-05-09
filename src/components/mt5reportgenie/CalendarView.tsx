
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';

interface CalendarViewProps {
  trades: MT5Trade[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
  // Group trades by month
  const monthlyData = React.useMemo(() => {
    const monthGroups = trades.reduce((acc, trade) => {
      if (!trade.profit) return acc;
      
      const date = new Date(trade.timeFlag || trade.openTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          profit: 0,
          trades: 0,
        };
      }
      
      acc[monthKey].profit += trade.profit;
      acc[monthKey].trades += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    return Object.values(monthGroups)
      .map(data => ({
        ...data,
        // Add formatted month for display
        monthDisplay: formatMonthLabel(data.month)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [trades]);

  // Format month key (YYYY-MM) to display format (MMM YY)
  const formatMonthLabel = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  };

  // Calculate statistics
  const totalProfit = monthlyData.reduce((sum, month) => sum + month.profit, 0);
  const profitableMonths = monthlyData.filter(month => month.profit > 0).length;
  const winRate = monthlyData.length > 0 ? (profitableMonths / monthlyData.length) * 100 : 0;

  // Define chart configuration for ChartContainer
  const chartConfig: ChartConfig = {
    profit: {
      label: "Monthly P&L",
      color: "hsl(var(--success))"
    },
    loss: {
      label: "Loss",
      color: "hsl(var(--destructive))"
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <h2 className="text-xl font-semibold">Monthly Performance</h2>
        <div className="flex flex-wrap gap-3 text-sm mt-2 md:mt-0">
          <span className="text-muted-foreground">
            Win Rate: <span className="text-primary font-medium">{winRate.toFixed(1)}%</span>
          </span>
          <span className="text-muted-foreground">
            Total Profit: <span className={`font-medium ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${totalProfit.toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      <Card className="pt-4">
        <div className="h-[350px] w-full p-4">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="monthDisplay"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-xs font-medium">
                          {data.monthDisplay}
                        </div>
                        <div className={`text-sm font-bold ${data.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${data.profit.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {data.trades} trades
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="profit" 
                  name="Monthly P&L"
                  radius={[4, 4, 0, 0]}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
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

export default CalendarView;
