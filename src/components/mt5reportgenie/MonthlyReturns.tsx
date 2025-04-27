
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';
import { Card } from '@/components/ui/card';

interface MonthlyReturnsProps {
  trades: MT5Trade[];
}

const MonthlyReturns: React.FC<MonthlyReturnsProps> = ({ trades }) => {
  const monthlyData = React.useMemo(() => {
    // Group trades by month
    const monthlyGroups = trades.reduce((acc, trade) => {
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
          cumReturn: 0,
        };
      }
      
      acc[monthKey].return += trade.profit;
      acc[monthKey].trades += 1;
      if (trade.profit > 0) acc[monthKey].wins += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array, calculate win rates and sort by date
    let data = Object.values(monthlyGroups).map(month => ({
      ...month,
      winRate: ((month.wins / month.trades) * 100).toFixed(1),
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    // Calculate cumulative returns
    let cumulativeReturn = 0;
    data = data.map(month => {
      cumulativeReturn += month.return;
      return {
        ...month,
        cumReturn: cumulativeReturn
      };
    });
    
    return data;
  }, [trades]);

  // Calculate statistical summary
  const summary = React.useMemo(() => {
    if (monthlyData.length === 0) return { avg: 0, best: 0, worst: 0, positive: 0 };
    
    const returns = monthlyData.map(m => m.return);
    const posMonths = returns.filter(r => r > 0).length;
    const posRatio = monthlyData.length > 0 ? (posMonths / monthlyData.length) * 100 : 0;
    
    return {
      avg: returns.reduce((sum, r) => sum + r, 0) / returns.length,
      best: Math.max(...returns),
      worst: Math.min(...returns),
      positive: posRatio
    };
  }, [monthlyData]);

  const config = {
    returns: {
      label: 'Monthly Returns',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
    cumulative: {
      label: 'Cumulative Return',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    }
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <h2 className="text-xl font-semibold">Monthly Performance Analysis</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 md:mt-0">
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">Average Monthly</p>
            <p className={`text-lg font-bold ${summary.avg >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(summary.avg)}
            </p>
          </Card>
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">Best Month</p>
            <p className="text-lg font-bold text-green-500">
              {formatCurrency(summary.best)}
            </p>
          </Card>
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">Worst Month</p>
            <p className="text-lg font-bold text-red-500">
              {formatCurrency(summary.worst)}
            </p>
          </Card>
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">Positive Months</p>
            <p className="text-lg font-bold">
              {summary.positive.toFixed(1)}%
            </p>
          </Card>
        </div>
      </div>
      
      <div className="h-[500px] w-full">
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 60, bottom: 70 }}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  const date = new Date(Number(year), Number(month) - 1);
                  return date.toLocaleString('default', { month: 'short', year: '2-digit' });
                }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  const [year, month] = data.month.split('-');
                  const date = new Date(Number(year), Number(month) - 1);
                  
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-xl">
                      <div className="text-sm font-medium mb-1">
                        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className={`text-base font-bold ${data.return > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(data.return)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Win Rate: {data.winRate}% ({data.wins}/{data.trades} trades)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cumulative: {formatCurrency(data.cumReturn)}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend content={() => (
                <div className="flex justify-center items-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm opacity-80"></div>
                    <span className="text-xs text-muted-foreground">Profit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm opacity-80"></div>
                    <span className="text-xs text-muted-foreground">Loss</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-primary bg-transparent rounded-sm"></div>
                    <span className="text-xs text-muted-foreground">Cumulative</span>
                  </div>
                </div>
              )} />
              <Bar
                dataKey="return"
                yAxisId="left"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={30}
                minPointSize={3}
              >
                {monthlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.return > 0 ? 'hsl(142.1, 76.2%, 36.3%)' : 'hsl(346.8, 77.2%, 49.8%)'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default MonthlyReturns;
