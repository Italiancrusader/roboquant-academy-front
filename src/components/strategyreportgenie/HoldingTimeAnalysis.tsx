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
import { ChartContainer } from '@/components/ui/chart';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface HoldingTimeAnalysisProps {
  trades: StrategyTrade[];
}

const HoldingTimeAnalysis: React.FC<HoldingTimeAnalysisProps> = ({ trades }) => {
  // Filter to trades with valid dates and profit values
  const validTrades = React.useMemo(() => {
    return trades.filter(trade => 
      trade.openTime instanceof Date && 
      !isNaN(trade.openTime.getTime()) &&
      trade.timeFlag instanceof Date && 
      !isNaN(trade.timeFlag.getTime()) &&
      trade.profit !== undefined && 
      trade.direction === 'out'
    );
  }, [trades]);

  // Calculate trade duration in hours and categorize them
  const durationData = React.useMemo(() => {
    if (validTrades.length === 0) return [];

    // Define duration categories (in hours)
    const categories = [
      { name: '< 1h', min: 0, max: 1 },
      { name: '1-6h', min: 1, max: 6 },
      { name: '6-12h', min: 6, max: 12 },
      { name: '12-24h', min: 12, max: 24 },
      { name: '1-3d', min: 24, max: 72 },
      { name: '3-7d', min: 72, max: 168 },
      { name: '> 7d', min: 168, max: Infinity }
    ];

    // Initialize duration categories
    const durationMap = new Map();
    categories.forEach(category => {
      durationMap.set(category.name, {
        category: category.name,
        min: category.min,
        max: category.max,
        profit: 0,
        trades: 0,
        wins: 0,
        losses: 0,
      });
    });

    // Process trades and categorize by duration
    validTrades.forEach(trade => {
      const openTime = trade.openTime.getTime();
      const closeTime = trade.timeFlag.getTime();
      const durationMs = closeTime - openTime;
      const durationHours = durationMs / (1000 * 60 * 60);

      // Find matching category
      let categoryName = '';
      for (const category of categories) {
        if (durationHours >= category.min && durationHours < category.max) {
          categoryName = category.name;
          break;
        }
      }

      if (categoryName) {
        const categoryData = durationMap.get(categoryName);
        categoryData.profit += trade.profit || 0;
        categoryData.trades++;

        if (trade.profit !== undefined) {
          if (trade.profit > 0) {
            categoryData.wins++;
          } else if (trade.profit < 0) {
            categoryData.losses++;
          }
        }
      }
    });

    // Convert to array and sort by duration (using the min value)
    const durationArray = Array.from(durationMap.values());
    durationArray.sort((a, b) => a.min - b.min);

    return durationArray;
  }, [validTrades]);

  // Calculate stats for each duration category
  const durationAnalysisData = React.useMemo(() => {
    return durationData.map(data => ({
      ...data,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      avgProfit: data.trades > 0 ? data.profit / data.trades : 0,
    }));
  }, [durationData]);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (validTrades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No holding time data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-20">
      {/* Win Rate by Duration */}
      <div className="w-full border border-border rounded-lg p-4 bg-background/50">
        <h3 className="text-lg font-medium mb-4">Win Rate by Duration</h3>
        <div className="h-[280px]">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={durationAnalysisData}
                margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  height={60}
                  tick={{ fontSize: 11 }}
                  tickMargin={15}
                  label={{
                    value: 'Holding Duration',
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
                    style: { fill: 'hsl(var(--muted-foreground))' },
                    dy: 20
                  }}
                  domain={[0, 100]}
                  padding={{ top: 20, bottom: 0 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                        <p className="font-medium">{data.category}</p>
                        <p className="text-muted-foreground">Win Rate: {data.winRate.toFixed(1)}%</p>
                        <p className="text-muted-foreground">Trades: {data.trades}</p>
                        <p className="text-muted-foreground">Win/Loss: {data.wins}/{data.losses}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                  {durationAnalysisData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.winRate >= 50 ? 'hsl(143, 85%, 40%)' : 'hsl(346, 84%, 61%)'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ paddingBottom: 10 }}
                  payload={[
                    { value: 'Win Rate ≥ 50%', type: 'rect', color: 'hsl(143, 85%, 40%)' },
                    { value: 'Win Rate < 50%', type: 'rect', color: 'hsl(346, 84%, 61%)' }
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
      
      {/* Average Profit by Duration */}
      <div className="w-full border border-border rounded-lg p-4 bg-background/50 mt-16">
        <h3 className="text-lg font-medium mb-4">Average Profit by Duration</h3>
        <div className="h-[280px]">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={durationAnalysisData}
                margin={{ top: 20, right: 30, left: 65, bottom: 50 }}
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  height={60}
                  tick={{ fontSize: 11 }}
                  tickMargin={15}
                  label={{
                    value: 'Holding Duration',
                    position: 'insideBottom',
                    offset: -15,
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  width={80}
                  tickFormatter={(value: ValueType) => {
                    if (typeof value === 'number') {
                      return formatCurrency(value);
                    }
                    return String(value);
                  }}
                  label={{
                    value: 'Average Profit',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--muted-foreground))' },
                    dy: 40
                  }}
                  padding={{ top: 20, bottom: 0 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                        <p className="font-medium">{data.category}</p>
                        <p className="text-muted-foreground">Avg Profit: {formatCurrency(data.avgProfit)}</p>
                        <p className="text-muted-foreground">Total Profit: {formatCurrency(data.profit)}</p>
                        <p className="text-muted-foreground">Trades: {data.trades}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="avgProfit" radius={[4, 4, 0, 0]}>
                  {durationAnalysisData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.avgProfit >= 0 ? 'hsl(215, 85%, 60%)' : 'hsl(346, 84%, 61%)'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ paddingBottom: 10 }}
                  payload={[
                    { value: 'Profit', type: 'rect', color: 'hsl(215, 85%, 60%)' },
                    { value: 'Loss', type: 'rect', color: 'hsl(346, 84%, 61%)' }
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default HoldingTimeAnalysis; 