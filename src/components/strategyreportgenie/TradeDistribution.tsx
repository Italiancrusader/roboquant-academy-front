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
import { Calendar } from 'lucide-react';
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

    validTrades.forEach(trade => {
      const date = trade.openTime;
      const hour = date.getHours();

      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, {
          hour: hour,
          profit: 0,
          trades: 0,
          wins: 0,
          losses: 0,
        });
      }

      const hourData = hourlyMap.get(hour);
      hourData.profit += trade.profit || 0;
      hourData.trades++;

      if (trade.profit !== undefined) {
        if (trade.profit > 0) {
          hourData.wins++;
        } else {
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
    }));
  }, [hourlyData]);

  // Group trades by day of the week
  const weekdayData = React.useMemo(() => {
    if (validTrades.length === 0) return [];

    const weekdayMap = new Map();

    validTrades.forEach(trade => {
      const date = trade.openTime;
      const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      if (!weekdayMap.has(day)) {
        weekdayMap.set(day, {
          day: dayName,
          profit: 0,
          trades: 0,
          wins: 0,
          losses: 0,
        });
      }

      const dayData = weekdayMap.get(day);
      dayData.profit += trade.profit || 0;
      dayData.trades++;

      if (trade.profit !== undefined) {
        if (trade.profit > 0) {
          dayData.wins++;
        } else {
          dayData.losses++;
        }
      }
    });

    // Convert to array and sort by day
    const weekdayArray = Array.from(weekdayMap.values());
    weekdayArray.sort((a, b) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.indexOf(a.day) - days.indexOf(b.day);
    });

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

  // Calculate appropriate margin based on data length
  const calculateMargin = (dataLength: number) => {
    const baseMargin = { top: 20, right: 30, left: 30, bottom: 60 };
    if (dataLength > 15) {
      return { ...baseMargin, bottom: 80 }; // More space for x-axis labels
    }
    return baseMargin;
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Trade Distribution</h2>
      </div>

      <Card className="overflow-visible mb-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Hourly Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="h-[450px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyWinRateData}
                  margin={calculateMargin(hourlyWinRateData.length)}
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="hour"
                    stroke="hsl(var(--muted-foreground))"
                    height={60}
                    tick={{ fontSize: 12 }}
                    tickMargin={15}
                    label={{
                      value: 'Hour',
                      position: 'insideBottom',
                      offset: -15,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                    interval={hourlyWinRateData.length > 12 ? 'preserveStartEnd' : 0}
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
                      style: { fill: 'hsl(var(--muted-foreground))' }
                    }}
                    domain={[0, 'dataMax']}
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
                                  {data.hour}
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
                  <Legend />
                  <Bar
                    dataKey="winRate"
                    name="Hourly Win Rate"
                    isAnimationActive={false}
                    fill="hsl(var(--primary))"
                    fillOpacity={0}
                    stroke="none"
                    barSize={hourlyWinRateData.length > 12 ? 15 : 25} // Adjust bar size based on data length
                  >
                    {hourlyWinRateData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.winRate >= 50 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-visible mb-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Weekday Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="h-[450px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekdayWinRateData}
                  margin={calculateMargin(weekdayWinRateData.length)}
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    height={60}
                    tick={{ fontSize: 12 }}
                    tickMargin={15}
                    label={{
                      value: 'Day of Week',
                      position: 'insideBottom',
                      offset: -15,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
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
                      style: { fill: 'hsl(var(--muted-foreground))' }
                    }}
                    domain={[0, 'dataMax']}
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
                  <Legend />
                  <Bar
                    dataKey="winRate"
                    name="Weekday Win Rate"
                    isAnimationActive={false}
                    fill="hsl(var(--primary))"
                    fillOpacity={0}
                    stroke="none"
                    barSize={25}
                  >
                    {weekdayWinRateData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.winRate >= 50 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
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
