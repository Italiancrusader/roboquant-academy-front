
import React from 'react';
import { MT5Trade } from '@/types/mt5reportgenie';
import { Card } from '@/components/ui/card';

interface PerformanceHeatmapProps {
  trades: MT5Trade[];
}

const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({ trades }) => {
  // Process trades to create a heatmap data structure
  const calendarData = React.useMemo(() => {
    if (!trades.length) return { calendar: [], monthlyStats: [] };
    
    const validTrades = trades.filter(t => 
      t.profit !== undefined && 
      t.direction === 'out' && 
      (t.timeFlag || t.openTime)
    );
    
    // Group trades by day
    const dailyData: Record<string, { date: Date, profit: number, trades: number, wins: number }> = {};
    
    validTrades.forEach(trade => {
      const date = new Date(trade.timeFlag || trade.openTime);
      const dateKey = date.toISOString().split('T')[0];
      const profit = trade.profit || 0;
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date,
          profit: 0,
          trades: 0,
          wins: 0,
        };
      }
      
      dailyData[dateKey].profit += profit;
      dailyData[dateKey].trades += 1;
      if (profit > 0) dailyData[dateKey].wins += 1;
    });
    
    // Convert to array and calculate win rate
    const calendar = Object.values(dailyData).map(day => ({
      ...day,
      winRate: day.trades > 0 ? (day.wins / day.trades) * 100 : 0,
    }));
    
    // Group by month for monthly statistics
    const monthlyData: Record<string, { month: string, profit: number, trades: number, wins: number }> = {};
    
    calendar.forEach(day => {
      const month = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          profit: 0,
          trades: 0,
          wins: 0,
        };
      }
      
      monthlyData[month].profit += day.profit;
      monthlyData[month].trades += day.trades;
      monthlyData[month].wins += day.wins;
    });
    
    // Convert monthly data to array and calculate win rate
    const monthlyStats = Object.values(monthlyData).map(month => ({
      ...month,
      winRate: month.trades > 0 ? (month.wins / month.trades) * 100 : 0,
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    return { calendar, monthlyStats };
  }, [trades]);
  
  // Group calendar data by month and year for heatmap
  const heatmapData = React.useMemo(() => {
    const { calendar } = calendarData;
    if (calendar.length === 0) return [];
    
    // Create a structured view by year and month
    const byYearAndMonth: Record<string, Record<string, any[]>> = {};
    
    calendar.forEach(day => {
      const year = day.date.getFullYear();
      const month = day.date.getMonth();
      
      if (!byYearAndMonth[year]) {
        byYearAndMonth[year] = {};
      }
      
      if (!byYearAndMonth[year][month]) {
        byYearAndMonth[year][month] = [];
      }
      
      byYearAndMonth[year][month].push(day);
    });
    
    // Convert to a format suitable for rendering
    return Object.entries(byYearAndMonth).map(([year, months]) => ({
      year: Number(year),
      months: Object.entries(months).map(([month, days]) => ({
        month: Number(month),
        days,
      })),
    })).sort((a, b) => a.year - b.year);
  }, [calendarData]);
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Get color for heatmap cell based on profit
  const getCellBackground = (profit: number) => {
    if (profit > 0) {
      // Green gradient for profits
      const intensity = Math.min(Math.sqrt(profit) / 20, 1);
      return `rgba(34, 197, 94, ${intensity})`;
    } else {
      // Red gradient for losses
      const intensity = Math.min(Math.sqrt(Math.abs(profit)) / 20, 1);
      return `rgba(239, 68, 68, ${intensity})`;
    }
  };
  
  // Month names for labels
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Calendar Performance Heatmap</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Trading performance visualized by days, highlighting profitable (green) and unprofitable (red) sessions.
        </p>
      </div>
      
      {/* Calendar Heatmap */}
      {heatmapData.map((yearData) => (
        <div key={yearData.year} className="mb-8">
          <h3 className="text-lg font-medium mb-4">{yearData.year}</h3>
          
          {yearData.months.map((monthData) => (
            <div key={`${yearData.year}-${monthData.month}`} className="mb-6">
              <h4 className="text-sm font-medium mb-2">{monthNames[monthData.month]}</h4>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Display day labels Sun-Sat */}
                <div className="text-xs text-muted-foreground text-center">Sun</div>
                <div className="text-xs text-muted-foreground text-center">Mon</div>
                <div className="text-xs text-muted-foreground text-center">Tue</div>
                <div className="text-xs text-muted-foreground text-center">Wed</div>
                <div className="text-xs text-muted-foreground text-center">Thu</div>
                <div className="text-xs text-muted-foreground text-center">Fri</div>
                <div className="text-xs text-muted-foreground text-center">Sat</div>
                
                {/* Fill in empty cells for the start of the month */}
                {Array.from({ length: new Date(yearData.year, monthData.month, 1).getDay() }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="h-10 bg-muted/30 rounded-sm"></div>
                ))}
                
                {/* Render days with trading data */}
                {Array.from({ length: new Date(yearData.year, monthData.month + 1, 0).getDate() }).map((_, day) => {
                  const dayData = monthData.days.find(d => d.date.getDate() === day + 1);
                  
                  return (
                    <div
                      key={`day-${day + 1}`}
                      className="h-10 rounded-sm flex flex-col items-center justify-center relative group cursor-pointer"
                      style={{
                        backgroundColor: dayData ? getCellBackground(dayData.profit) : 'hsl(var(--muted))',
                      }}
                      title={dayData ? `${new Date(dayData.date).toLocaleDateString()}: ${formatCurrency(dayData.profit)}` : ''}
                    >
                      <span className="text-xs font-medium z-10 mix-blend-difference text-white">{day + 1}</span>
                      
                      {dayData && (
                        <div className="absolute opacity-0 group-hover:opacity-100 bg-background border border-border rounded-md p-2 shadow-lg z-20 bottom-full mb-2 min-w-[150px] text-left transition-opacity">
                          <div className="text-xs font-medium">
                            {new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                          <div className={`text-xs font-bold ${dayData.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(dayData.profit)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dayData.trades} trades ({dayData.winRate.toFixed(1)}% win)
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Fill in empty cells for the end of the month */}
                {Array.from({ 
                  length: (7 - ((new Date(yearData.year, monthData.month, 1).getDay() + 
                    new Date(yearData.year, monthData.month + 1, 0).getDate()) % 7)) % 7 
                }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="h-10 bg-muted/30 rounded-sm"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
      
      {/* Monthly Summary */}
      <Card className="p-5">
        <h3 className="text-base font-medium mb-4">Monthly Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendarData.monthlyStats.map((month, i) => {
            const [year, monthNum] = month.month.split('-');
            const monthName = new Date(Number(year), Number(monthNum) - 1).toLocaleDateString('en-US', { month: 'long' });
            
            return (
              <Card key={i} className="p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{monthName} {year}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {month.trades} trades ({month.winRate.toFixed(1)}% win)
                  </p>
                </div>
                <div className={`text-lg font-bold ${month.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(month.profit)}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default PerformanceHeatmap;
