
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ChartContainer } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, TrendingUp, BarChart2 } from 'lucide-react';

interface MonthlyReturnsProps {
  trades: StrategyTrade[];
}

const MonthlyReturns: React.FC<MonthlyReturnsProps> = ({ trades }) => {
  const monthlyData = React.useMemo(() => {
    // If no trades, return empty array
    if (!trades.length) return [];
    
    // Get trades with balance information
    const tradesWithBalance = trades.filter(trade => trade.balance !== undefined);
    
    if (tradesWithBalance.length === 0) return [];
    
    // Create a map for monthly data
    const monthlyMap = new Map<string, { 
      month: string, 
      profit: number, 
      trades: number,
      winningTrades: number
    }>();
    
    // Initialize total balance
    let lastBalance = tradesWithBalance[0].balance || 0;
    let currentMonth = '';
    let monthlyProfit = 0;
    let monthlyTrades = 0;
    let monthlyWinningTrades = 0;
    
    // Process trades
    tradesWithBalance.forEach((trade, index) => {
      const date = trade.openTime;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = new Date(date.getFullYear(), date.getMonth(), 1)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // If this is a new month or the last trade
      if (currentMonth && (currentMonth !== month || index === tradesWithBalance.length - 1)) {
        // Save the previous month's data
        monthlyMap.set(currentMonth, {
          month: currentMonth,
          profit: monthlyProfit,
          trades: monthlyTrades,
          winningTrades: monthlyWinningTrades
        });
        
        // Reset counters for the new month
        monthlyProfit = 0;
        monthlyTrades = 0;
        monthlyWinningTrades = 0;
      }
      
      // Set current month
      currentMonth = month;
      
      // Calculate profit for this trade
      if (trade.balance !== undefined) {
        const tradeProfit = trade.balance - lastBalance;
        monthlyProfit += tradeProfit;
        lastBalance = trade.balance;
      }
      
      // Count trades
      if (trade.profit !== undefined && trade.direction === 'out') {
        monthlyTrades++;
        if (trade.profit > 0) {
          monthlyWinningTrades++;
        }
      }
      
      // Make sure to capture the last month if this is the last trade
      if (index === tradesWithBalance.length - 1) {
        monthlyMap.set(month, {
          month: monthLabel,
          profit: monthlyProfit,
          trades: monthlyTrades,
          winningTrades: monthlyWinningTrades
        });
      }
    });
    
    // Convert to array and sort by month
    return Array.from(monthlyMap.values())
      .map(data => ({
        ...data,
        winRate: data.trades > 0 ? (data.winningTrades / data.trades) * 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [trades]);

  // Calculate performance metrics
  const performanceMetrics = React.useMemo(() => {
    if (!monthlyData.length) return null;
    
    const positiveMonths = monthlyData.filter(m => m.profit > 0).length;
    const negativeMonths = monthlyData.filter(m => m.profit < 0).length;
    const bestMonth = [...monthlyData].sort((a, b) => b.profit - a.profit)[0];
    const worstMonth = [...monthlyData].sort((a, b) => a.profit - b.profit)[0];
    const averageMonthlyProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0) / monthlyData.length;
    const profitConsistency = positiveMonths / monthlyData.length;
    
    return {
      totalMonths: monthlyData.length,
      positiveMonths,
      negativeMonths,
      bestMonth,
      worstMonth,
      averageMonthlyProfit,
      profitConsistency
    };
  }, [monthlyData]);

  if (!monthlyData.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No data available for monthly returns analysis</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
      
      {/* Monthly Returns Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart2 className="h-5 w-5" /> Monthly Returns
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer config={{ profit: { color: "hsl(var(--primary))" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  label={{ 
                    value: 'Profit/Loss', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit/Loss']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="profit" name="Monthly P&L">
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? 
                      'hsl(var(--success))' : 'hsl(var(--destructive))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Performance Metrics Table */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Months</TableCell>
                    <TableCell>{performanceMetrics.totalMonths}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Profitable Months</TableCell>
                    <TableCell className="text-green-500">
                      {performanceMetrics.positiveMonths} ({((performanceMetrics.positiveMonths / performanceMetrics.totalMonths) * 100).toFixed(0)}%)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Losing Months</TableCell>
                    <TableCell className="text-red-500">
                      {performanceMetrics.negativeMonths} ({((performanceMetrics.negativeMonths / performanceMetrics.totalMonths) * 100).toFixed(0)}%)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Average Monthly Profit</TableCell>
                    <TableCell className={performanceMetrics.averageMonthlyProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
                      ${performanceMetrics.averageMonthlyProfit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Best Month</TableCell>
                    <TableCell>
                      {performanceMetrics.bestMonth.month}: ${performanceMetrics.bestMonth.profit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Worst Month</TableCell>
                    <TableCell>
                      {performanceMetrics.worstMonth.month}: ${performanceMetrics.worstMonth.profit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Profit Consistency</TableCell>
                    <TableCell>
                      {(performanceMetrics.profitConsistency * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Monthly Trades
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Trades</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell>{month.month}</TableCell>
                      <TableCell>{month.trades}</TableCell>
                      <TableCell>{month.winRate.toFixed(1)}%</TableCell>
                      <TableCell className={month.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                        ${month.profit.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MonthlyReturns;
