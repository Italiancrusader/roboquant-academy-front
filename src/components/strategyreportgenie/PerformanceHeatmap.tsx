
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Calendar as CalendarIcon } from 'lucide-react';

interface PerformanceHeatmapProps {
  trades: StrategyTrade[];
}

interface MonthlyData {
  year: number;
  month: number;
  profit: number;
  trades: number;
  winningTrades: number;
  winRate: number;
}

const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({ trades }) => {
  // Get completed trades
  const completedTrades = trades.filter(t => 
    t.profit !== undefined && 
    t.direction === 'out' && 
    t.type !== 'balance' && 
    t.type !== '');
  
  // Generate monthly performance data
  const monthlyData = React.useMemo(() => {
    if (!completedTrades.length) return [];
    
    const monthlyMap = new Map<string, MonthlyData>();
    
    // Process all trades
    completedTrades.forEach(trade => {
      const date = trade.openTime;
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      const profit = trade.profit || 0;
      
      const key = `${year}-${month}`;
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          year,
          month,
          profit: 0,
          trades: 0,
          winningTrades: 0,
          winRate: 0
        });
      }
      
      const data = monthlyMap.get(key)!;
      data.profit += profit;
      data.trades++;
      
      if (profit > 0) {
        data.winningTrades++;
      }
    });
    
    // Calculate win rate
    monthlyMap.forEach(data => {
      data.winRate = data.trades > 0 ? (data.winningTrades / data.trades) * 100 : 0;
    });
    
    return Array.from(monthlyMap.values());
  }, [completedTrades]);
  
  // Generate calendar heatmap data
  const calendarData = React.useMemo(() => {
    if (!monthlyData.length) return [];
    
    // Get unique years in descending order
    const years = [...new Set(monthlyData.map(d => d.year))].sort((a, b) => b - a);
    
    return years.map(year => {
      // Get months for this year
      const yearData = monthlyData.filter(d => d.year === year);
      
      // Create an array with 12 months (fill in missing months with null)
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1;
        const monthData = yearData.find(d => d.month === monthIndex);
        
        if (!monthData) {
          return {
            year,
            month: monthIndex,
            profit: null,
            trades: 0,
            winRate: 0
          };
        }
        
        return monthData;
      });
      
      return {
        year,
        months
      };
    });
  }, [monthlyData]);
  
  // Helper function to get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return monthNames[month - 1];
  };
  
  // Helper function to get cell background color based on profit
  const getHeatmapColor = (profit: number | null) => {
    if (profit === null) return 'bg-muted/20'; // No data
    if (profit > 0) {
      const intensity = Math.min(profit / 500, 1); // Scale based on profit amount
      return `bg-green-${Math.round(intensity * 300 + 100)}/50`; // bg-green-100 to bg-green-400
    }
    if (profit < 0) {
      const intensity = Math.min(Math.abs(profit) / 500, 1); // Scale based on loss amount
      return `bg-red-${Math.round(intensity * 300 + 100)}/50`; // bg-red-100 to bg-red-400
    }
    return 'bg-muted/30'; // Zero profit
  };
  
  if (!completedTrades.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No trade data available for calendar analysis</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Performance Calendar</h2>
      
      {/* Monthly Performance Heatmap */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" /> Monthly Performance Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {calendarData.map(yearData => (
              <div key={yearData.year} className="mb-8">
                <h3 className="text-lg font-medium mb-2">{yearData.year}</h3>
                <div className="w-full min-w-[650px]">
                  <div className="grid grid-cols-12 gap-1 mb-1">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                        {getMonthName(i + 1)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-12 gap-1">
                    {yearData.months.map((month, i) => (
                      <div 
                        key={i}
                        className={`p-2 rounded-md ${getHeatmapColor(month.profit)}`}
                      >
                        {month.profit !== null ? (
                          <div className="text-center">
                            <div className={`text-sm font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${month.profit.toFixed(0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {month.trades} {month.trades === 1 ? 'trade' : 'trades'}
                            </div>
                            {month.trades > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {month.winRate.toFixed(0)}% win
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-xs text-muted-foreground">
                            No trades
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-300/50 rounded"></div>
              <span className="text-xs">High Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100/50 rounded"></div>
              <span className="text-xs">Low Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100/50 rounded"></div>
              <span className="text-xs">Low Loss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300/50 rounded"></div>
              <span className="text-xs">High Loss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/30 rounded"></div>
              <span className="text-xs">Break Even</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/20 rounded"></div>
              <span className="text-xs">No Trades</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Monthly Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Monthly Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Profit/Loss</TableHead>
                <TableHead>Avg. Trade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData
                .sort((a, b) => {
                  if (a.year !== b.year) return b.year - a.year;
                  return b.month - a.month;
                })
                .map((month, index) => (
                  <TableRow key={index}>
                    <TableCell>{getMonthName(month.month)} {month.year}</TableCell>
                    <TableCell>{month.trades}</TableCell>
                    <TableCell>{month.winRate.toFixed(1)}%</TableCell>
                    <TableCell className={month.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                      ${month.profit.toFixed(2)}
                    </TableCell>
                    <TableCell className={month.profit / month.trades >= 0 ? 'text-green-500' : 'text-red-500'}>
                      ${(month.profit / month.trades).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceHeatmap;
