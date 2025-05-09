
import React from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { CalendarArrowUp, Calendar } from 'lucide-react';

interface MonthlyReturnsProps {
  trades: StrategyTrade[];
}

const MonthlyReturns: React.FC<MonthlyReturnsProps> = ({ trades }) => {
  // Filter to trades with valid dates
  const validTrades = React.useMemo(() => {
    return trades.filter(trade => 
      trade.openTime instanceof Date && 
      !isNaN(trade.openTime.getTime()) &&
      trade.profit !== undefined && 
      trade.direction === 'out'
    );
  }, [trades]);
  
  console.log("Valid trades for monthly returns:", validTrades.length);
  if (validTrades.length > 0) {
    console.log("First valid trade date:", validTrades[0].openTime);
  }
  
  // Generate monthly returns data
  const monthlyData = React.useMemo(() => {
    if (validTrades.length === 0) return [];
    
    const monthlyMap = new Map();
    
    validTrades.forEach(trade => {
      const date = trade.openTime;
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
      const monthLabel = new Date(year, month, 1)
        .toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthLabel,
          profit: 0,
          trades: 0,
          sortKey: year * 100 + month // for sorting
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.profit += trade.profit || 0;
      monthData.trades++;
    });
    
    // Convert to array and sort by date
    const monthlyArray = Array.from(monthlyMap.values());
    monthlyArray.sort((a, b) => a.sortKey - b.sortKey);
    
    console.log("Monthly data generated:", monthlyArray);
    return monthlyArray;
  }, [validTrades]);
  
  // Calculate best and worst month
  const bestMonth = React.useMemo(() => {
    if (monthlyData.length === 0) return null;
    return monthlyData.reduce((best, current) => 
      current.profit > best.profit ? current : best, monthlyData[0]);
  }, [monthlyData]);
  
  const worstMonth = React.useMemo(() => {
    if (monthlyData.length === 0) return null;
    return monthlyData.reduce((worst, current) => 
      current.profit < worst.profit ? current : worst, monthlyData[0]);
  }, [monthlyData]);
  
  if (monthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No monthly data available</p>
      </div>
    );
  }

  // Define chart configuration
  const chartConfig: ChartConfig = {
    profit: {
      label: "",  // Removed the label completely
      color: "#9b87f5" // Purple color for bars
    },
    loss: {
      label: "",  // Removed the label completely
      color: "#ea384c" // Red color for negative bars
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Monthly Performance</h2>
        <div className="text-sm text-muted-foreground">
          {bestMonth && (
            <>
              Best: <span className="text-green-500">${bestMonth.profit.toLocaleString()} ({bestMonth.month})</span>
              <span className="mx-2">•</span>
            </>
          )}
          {worstMonth && (
            <>
              Worst: <span className="text-red-500">${worstMonth.profit.toLocaleString()} ({worstMonth.month})</span>
            </>
          )}
        </div>
      </div>
      
      <div className="min-h-[400px] max-h-[600px] w-full">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 40, left: 40, bottom: 80 }} // Increased bottom margin
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                height={70}
                tick={{ fontSize: 12 }}
                tickMargin={25}
                label={{ 
                  value: 'Month', 
                  position: 'insideBottom', 
                  offset: -20, // Further adjusted to prevent any overlap
                  fill: 'hsl(var(--muted-foreground))' 
                }}
                interval={monthlyData.length > 12 ? 'preserveStartEnd' : 0}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                width={80}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                label={{ 
                  value: 'Profit/Loss ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
                domain={['auto', 'auto']}
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Month
                            </span>
                            <span className="font-bold text-foreground">
                              {data.month}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Profit/Loss
                            </span>
                            <span className={`font-bold ${data.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ${data.profit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Trades
                            </span>
                            <span className="font-mono text-foreground">
                              {data.trades}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                wrapperStyle={{ zIndex: 100 }}
              />
              <Legend 
                wrapperStyle={{ bottom: -10, paddingTop: 30 }} // Adjusted legend positioning
              />
              <Bar
                dataKey="profit"
                name="" // Removed the name completely
                radius={[4, 4, 0, 0]}
                barSize={35} // Increased bar width
              >
                {monthlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.profit >= 0 ? '#9b87f5' : '#ea384c'} // Purple for profit, Red for loss
                    fillOpacity={0.85} // Added opacity for a nicer look
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Monthly Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Average Monthly P&L</div>
              <div className="text-2xl font-semibold">
                ${(monthlyData.reduce((sum, month) => sum + month.profit, 0) / monthlyData.length).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Profitable Months</div>
              <div className="text-2xl font-semibold">
                {monthlyData.filter(m => m.profit > 0).length} / {monthlyData.length}
                <span className="text-sm text-muted-foreground ml-1">
                  ({((monthlyData.filter(m => m.profit > 0).length / monthlyData.length) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Highest Monthly Volume</div>
              <div className="text-2xl font-semibold">
                {Math.max(...monthlyData.map(m => m.trades))} trades
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReturns;
