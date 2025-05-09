
import React from 'react';
import { MT5Trade } from '@/types/mt5reportgenie';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import ChartWrapper from '@/components/ui/chart-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimeAnalysisViewProps {
  trades: MT5Trade[];
}

const TimeAnalysisView: React.FC<TimeAnalysisViewProps> = ({ trades }) => {
  const [timeView, setTimeView] = React.useState<'monthly' | 'weekly' | 'hourly'>('monthly');
  
  // Filter completed trades
  const completedTrades = trades.filter(trade => 
    trade.profit !== undefined && trade.direction === 'out'
  );
  
  // Monthly performance data
  const monthlyData = React.useMemo(() => {
    const monthGroups: Record<string, {
      month: string;
      monthNum: number;
      year: number;
      displayName: string;
      trades: number;
      wins: number;
      profit: number;
      winRate: number;
    }> = {};
    
    completedTrades.forEach(trade => {
      const date = new Date(trade.timeFlag || trade.openTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth();
      const profit = trade.profit || 0;
      
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {
          month: monthKey,
          monthNum,
          year,
          displayName: `${monthName} ${year}`,
          trades: 0,
          wins: 0,
          profit: 0,
          winRate: 0,
        };
      }
      
      monthGroups[monthKey].trades += 1;
      monthGroups[monthKey].profit += profit;
      
      if (profit > 0) {
        monthGroups[monthKey].wins += 1;
      }
    });
    
    // Calculate win rates and sort by date
    return Object.values(monthGroups)
      .map(group => ({
        ...group,
        winRate: (group.wins / group.trades) * 100,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
      });
  }, [completedTrades]);
  
  // Weekly performance data (by day of week)
  const weeklyData = React.useMemo(() => {
    const dayGroups: Record<number, {
      day: number;
      dayName: string;
      trades: number;
      wins: number;
      profit: number;
      winRate: number;
    }> = {};
    
    // Initialize all days of the week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayNames.forEach((name, index) => {
      dayGroups[index] = {
        day: index,
        dayName: name,
        trades: 0,
        wins: 0,
        profit: 0,
        winRate: 0,
      };
    });
    
    completedTrades.forEach(trade => {
      const date = new Date(trade.timeFlag || trade.openTime);
      const day = date.getDay(); // 0 = Sunday, 6 = Saturday
      const profit = trade.profit || 0;
      
      dayGroups[day].trades += 1;
      dayGroups[day].profit += profit;
      
      if (profit > 0) {
        dayGroups[day].wins += 1;
      }
    });
    
    // Calculate win rates
    return Object.values(dayGroups)
      .map(group => ({
        ...group,
        winRate: group.trades > 0 ? (group.wins / group.trades) * 100 : 0,
      }));
  }, [completedTrades]);
  
  // Hourly performance data
  const hourlyData = React.useMemo(() => {
    const hourGroups: Record<number, {
      hour: number;
      displayHour: string;
      trades: number;
      wins: number;
      profit: number;
      winRate: number;
    }> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourGroups[i] = {
        hour: i,
        displayHour: `${i}:00`,
        trades: 0,
        wins: 0,
        profit: 0,
        winRate: 0,
      };
    }
    
    completedTrades.forEach(trade => {
      const date = new Date(trade.timeFlag || trade.openTime);
      const hour = date.getHours();
      const profit = trade.profit || 0;
      
      hourGroups[hour].trades += 1;
      hourGroups[hour].profit += profit;
      
      if (profit > 0) {
        hourGroups[hour].wins += 1;
      }
    });
    
    // Calculate win rates
    return Object.values(hourGroups)
      .map(group => ({
        ...group,
        winRate: group.trades > 0 ? (group.wins / group.trades) * 100 : 0,
      }));
  }, [completedTrades]);
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Determine which dataset to display based on view selection
  const activeData = React.useMemo(() => {
    switch (timeView) {
      case 'monthly': return monthlyData;
      case 'weekly': return weeklyData;
      case 'hourly': return hourlyData;
      default: return monthlyData;
    }
  }, [timeView, monthlyData, weeklyData, hourlyData]);
  
  // Determine X axis data key based on view selection
  const getXAxisDataKey = () => {
    switch (timeView) {
      case 'monthly': return 'displayName';
      case 'weekly': return 'dayName';
      case 'hourly': return 'displayHour';
      default: return 'displayName';
    }
  };
  
  // Chart title based on view selection
  const getChartTitle = () => {
    switch (timeView) {
      case 'monthly': return 'Monthly Performance';
      case 'weekly': return 'Day of Week Performance';
      case 'hourly': return 'Hourly Performance';
      default: return 'Time Analysis';
    }
  };

  return (
    <div className="space-y-4">
      {/* View selector buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={timeView === 'monthly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeView('monthly')}
        >
          Monthly
        </Button>
        <Button
          variant={timeView === 'weekly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeView('weekly')}
        >
          Day of Week
        </Button>
        <Button
          variant={timeView === 'hourly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeView('hourly')}
        >
          Hour of Day
        </Button>
      </div>
      
      {/* Time analysis charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profit Chart */}
        <ChartWrapper
          title={`${getChartTitle()} - Profit`}
          description="Total profit across different time periods"
          height="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeData}
              margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey={getXAxisDataKey()}
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={value => formatCurrency(value)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  
                  return (
                    <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md">
                      <p className="text-sm font-medium">
                        {data[getXAxisDataKey()]}
                      </p>
                      <p className={`text-sm font-medium ${data.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(data.profit)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.trades} trades
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="profit" name="Profit">
                {activeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
        
        {/* Win Rate Chart */}
        <ChartWrapper
          title={`${getChartTitle()} - Win Rate`}
          description="Win percentage across different time periods"
          height="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeData.filter(d => d.trades > 0)} // Only include periods with trades
              margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey={getXAxisDataKey()}
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={value => `${value}%`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  
                  return (
                    <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md">
                      <p className="text-sm font-medium">
                        {data[getXAxisDataKey()]}
                      </p>
                      <p className="text-sm font-medium">
                        Win Rate: {data.winRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.wins} wins of {data.trades} trades
                      </p>
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey="winRate" 
                name="Win Rate"
                fill="hsl(var(--primary))"
                fillOpacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
};

export default TimeAnalysisView;
