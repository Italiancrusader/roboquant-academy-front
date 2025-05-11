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
import { ChartContainer } from '@/components/ui/chart';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { Calendar, Clock } from 'lucide-react';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface TradeDistributionProps {
  trades: StrategyTrade[];
}

const TradeDistribution: React.FC<TradeDistributionProps> = ({ trades }) => {
  // Filter to trades with valid dates and profit values
  const validTrades = React.useMemo(() => {
    return trades.filter(trade => 
      trade.openTime instanceof Date && 
      !isNaN(trade.openTime.getTime()) &&
      trade.profit !== undefined && 
      trade.direction === 'out'
    );
  }, [trades]);

  // Group trades by hour
  const hourlyData = React.useMemo(() => {
    if (validTrades.length === 0) return [];

    const hourlyMap = new Map();
    
    // Initialize all 24 hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyMap.set(hour, {
        hour: hour,
        profit: 0,
        trades: 0,
        wins: 0,
        losses: 0,
      });
    }

    validTrades.forEach(trade => {
      const date = trade.openTime;
      const hour = date.getHours();

      const hourData = hourlyMap.get(hour);
      hourData.profit += trade.profit || 0;
      hourData.trades++;

      if (trade.profit !== undefined) {
        if (trade.profit > 0) {
          hourData.wins++;
        } else if (trade.profit < 0) {
          hourData.losses++;
        }
      }
    });

    // Convert to array and sort by hour
    const hourlyArray = Array.from(hourlyMap.values());
    hourlyArray.sort((a, b) => a.hour - b.hour);

    return hourlyArray;
  }, [validTrades]);

  // Calculate win rate for each hour
  const hourlyWinRateData = React.useMemo(() => {
    return hourlyData.map(hourData => ({
      ...hourData,
      winRate: hourData.trades > 0 ? (hourData.wins / hourData.trades) * 100 : 0,
      hourFormatted: `${hourData.hour}:00`,
    }));
  }, [hourlyData]);

  // Group trades by day of the week
  const weekdayData = React.useMemo(() => {
    if (validTrades.length === 0) return [];

    const weekdayMap = new Map();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize all days of the week
    for (let day = 0; day < 7; day++) {
      weekdayMap.set(day, {
        day: days[day],
        dayIndex: day,
        profit: 0,
        trades: 0,
        wins: 0,
        losses: 0,
      });
    }

    validTrades.forEach(trade => {
      const date = trade.openTime;
      const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)

      const dayData = weekdayMap.get(day);
      dayData.profit += trade.profit || 0;
      dayData.trades++;

      if (trade.profit !== undefined) {
        if (trade.profit > 0) {
          dayData.wins++;
        } else if (trade.profit < 0) {
          dayData.losses++;
        }
      }
    });

    // Convert to array and sort by day
    const weekdayArray = Array.from(weekdayMap.values());
    weekdayArray.sort((a, b) => a.dayIndex - b.dayIndex);

    return weekdayArray;
  }, [validTrades]);

  // Calculate win rate for each day of the week
  const weekdayWinRateData = React.useMemo(() => {
    return weekdayData.map(dayData => ({
      ...dayData,
      winRate: dayData.trades > 0 ? (dayData.wins / dayData.trades) * 100 : 0,
    }));
  }, [weekdayData]);

  if (validTrades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No trade distribution data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Trade Distribution Analysis</h2>
      </div>

      {/* Hourly Distribution */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Hourly Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <div className="h-[400px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyWinRateData}
                  margin={{ top: 20, right: 30, left: 50, bottom: 60 }}
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="hourFormatted"
                    stroke="hsl(var(--muted-foreground))"
                    height={70}
                    tick={{ fontSize: 11 }}
                    tickMargin={20}
                    label={{
                      value: 'Hour of Day (24h)',
                      position: 'insideBottom',
                      offset: -15,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                    interval={1}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    width={65}
                    tickFormatter={(value: ValueType) => {
                      if (typeof value === 'number') {
                        return `${value.toFixed(0)}%`;
                      }
                      return String(value);
                    }}
                    label={{
                      value: 'Win Rate (%)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: 'hsl(var(--muted-foreground))' },
                      dy: 20
                    }}
                    domain={[0, Math.max(100, Math.ceil(Math.max(...hourlyWinRateData.map(d => d.winRate)) / 10) * 10)]}
                    padding={{ top: 20, bottom: 0 }}
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
                                  Hour
                                </span>
                                <span className="font-bold text-foreground">
                                  {data.hourFormatted}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Win Rate
                                </span>
                                <span className="font-bold text-green-500">
                                  {data.winRate.toFixed(2)}%
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
                    verticalAlign="bottom" 
                    height={50}
                    wrapperStyle={{ paddingTop: 20, bottom: 0 }}
                  />
                  <Bar
                    dataKey="winRate"
                    name="Hourly Win Rate"
                    isAnimationActive={false}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {hourlyWinRateData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.winRate > 50 ? '#9b87f5' : '#ea384c'} // Purple for >50%, Red for <50%
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekday Distribution */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Weekday Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <div className="h-[400px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekdayWinRateData}
                  margin={{ top: 20, right: 30, left: 50, bottom: 60 }}
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    height={70}
                    tick={{ fontSize: 12 }}
                    tickMargin={20}
                    label={{
                      value: 'Day of Week',
                      position: 'insideBottom',
                      offset: -15,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                    interval={0}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    width={65}
                    tickFormatter={(value: ValueType) => {
                      if (typeof value === 'number') {
                        return `${value.toFixed(0)}%`;
                      }
                      return String(value);
                    }}
                    label={{
                      value: 'Win Rate (%)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: 'hsl(var(--muted-foreground))' },
                      dy: 20
                    }}
                    domain={[0, Math.max(100, Math.ceil(Math.max(...weekdayWinRateData.map(d => d.winRate)) / 10) * 10)]}
                    padding={{ top: 20, bottom: 0 }}
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
                                  Day of Week
                                </span>
                                <span className="font-bold text-foreground">
                                  {data.day}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Win Rate
                                </span>
                                <span className="font-bold text-green-500">
                                  {data.winRate.toFixed(2)}%
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
                    verticalAlign="bottom" 
                    height={50}
                    wrapperStyle={{ paddingTop: 20, bottom: 0 }}
                  />
                  <Bar
                    dataKey="winRate"
                    name="Weekday Win Rate"
                    isAnimationActive={false}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  >
                    {weekdayWinRateData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.winRate > 50 ? '#9b87f5' : '#ea384c'} // Purple for >50%, Red for <50%
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeDistribution;
