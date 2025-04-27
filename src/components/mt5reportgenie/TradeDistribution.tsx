
import React from 'react';
import { Card } from '@/components/ui/card';
import { MT5Trade } from '@/types/mt5reportgenie';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface TradeDistributionProps {
  trades: MT5Trade[];
}

const TradeDistribution: React.FC<TradeDistributionProps> = ({ trades }) => {
  // Filter completed trades with profit data
  const completedTrades = trades.filter(t => t.profit !== undefined && t.direction === 'out');
  
  // Create histograms of profit distribution
  const distributionData = React.useMemo(() => {
    if (completedTrades.length === 0) return [];
    
    // Extract all profits
    const profits = completedTrades.map(t => t.profit || 0);
    
    // Find min and max for range calculation
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);
    
    // Calculate range and create bins
    // We'll create 20 bins from min to max
    const range = maxProfit - minProfit;
    const numBins = 20;
    const binSize = range / numBins;
    
    // Initialize bins
    const bins = Array.from({ length: numBins }, (_, i) => {
      const lowerBound = minProfit + i * binSize;
      const upperBound = minProfit + (i + 1) * binSize;
      return {
        range: `${lowerBound.toFixed(0)}-${upperBound.toFixed(0)}`,
        midpoint: (lowerBound + upperBound) / 2,
        count: 0,
        totalProfit: 0,
      };
    });
    
    // Fill bins with data
    profits.forEach(profit => {
      // Find the appropriate bin
      const binIndex = Math.min(
        Math.floor((profit - minProfit) / binSize),
        numBins - 1
      );
      
      bins[binIndex].count += 1;
      bins[binIndex].totalProfit += profit;
    });
    
    return bins;
  }, [completedTrades]);
  
  // Calculate trade statistics
  const tradeStats = React.useMemo(() => {
    if (completedTrades.length === 0) 
      return { winRate: 0, avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0 };
    
    const profits = completedTrades.map(t => t.profit || 0);
    const winningTrades = completedTrades.filter(t => (t.profit || 0) > 0);
    const losingTrades = completedTrades.filter(t => (t.profit || 0) < 0);
    
    return {
      winRate: (winningTrades.length / completedTrades.length) * 100,
      avgWin: winningTrades.length > 0 
        ? winningTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / winningTrades.length
        : 0,
      avgLoss: losingTrades.length > 0
        ? losingTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / losingTrades.length
        : 0,
      bestTrade: Math.max(...profits),
      worstTrade: Math.min(...profits),
    };
  }, [completedTrades]);
  
  // Group trades by outcome (win/loss)
  const outcomeDistribution = React.useMemo(() => {
    return [
      { 
        name: "Win",
        trades: completedTrades.filter(t => (t.profit || 0) > 0).length,
        profit: completedTrades
          .filter(t => (t.profit || 0) > 0)
          .reduce((sum, t) => sum + (t.profit || 0), 0),
      },
      { 
        name: "Loss", 
        trades: completedTrades.filter(t => (t.profit || 0) < 0).length,
        profit: completedTrades
          .filter(t => (t.profit || 0) < 0)
          .reduce((sum, t) => sum + (t.profit || 0), 0),
      }
    ];
  }, [completedTrades]);
  
  // Configuration for the chart
  const config = {
    distribution: {
      label: 'Profit Distribution',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
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
        <h2 className="text-xl font-semibold mb-4">Trade Distribution Analysis</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-lg font-bold">{tradeStats.winRate.toFixed(1)}%</p>
          </Card>
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">Avg. Win</p>
            <p className="text-lg font-bold text-green-500">{formatCurrency(tradeStats.avgWin)}</p>
          </Card>
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">Avg. Loss</p>
            <p className="text-lg font-bold text-red-500">{formatCurrency(tradeStats.avgLoss)}</p>
          </Card>
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">Best/Worst</p>
            <div className="text-xs mt-1">
              <span className="text-green-500 font-bold">{formatCurrency(tradeStats.bestTrade)}</span>
              <span className="mx-1">/</span>
              <span className="text-red-500 font-bold">{formatCurrency(tradeStats.worstTrade)}</span>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Distribution Histogram */}
        <Card className="p-5">
          <h3 className="text-base font-medium mb-4">Profit Distribution Histogram</h3>
          <div className="h-[350px]">
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distributionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="range"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={1}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <ReferenceLine x="0" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-xl">
                          <div className="text-sm font-medium mb-1">
                            Profit Range: {data.range}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Number of trades: {data.count}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total profit: {formatCurrency(data.totalProfit)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Average: {formatCurrency(data.count > 0 ? data.totalProfit / data.count : 0)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.midpoint >= 0 ? 'hsl(142.1, 76.2%, 36.3%)' : 'hsl(346.8, 77.2%, 49.8%)'}
                        fillOpacity={0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
        
        {/* Win/Loss Breakdown */}
        <Card className="p-5">
          <h3 className="text-base font-medium mb-4">Win/Loss Analysis</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={outcomeDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <div className="text-sm font-medium mb-1">
                          {data.name} Trades
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Count: {data.trades}
                        </div>
                        <div className={`text-xs ${data.name === "Win" ? "text-green-500" : "text-red-500"}`}>
                          Total: {formatCurrency(data.profit)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Average: {formatCurrency(data.trades > 0 ? data.profit / data.trades : 0)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar
                  dataKey="trades"
                  name="Number of Trades"
                  fill="hsl(var(--primary))"
                  barSize={30}
                  radius={[0, 4, 4, 0]}
                >
                  {outcomeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === "Win" ? 'hsl(142.1, 76.2%, 36.3%)' : 'hsl(346.8, 77.2%, 49.8%)'}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TradeDistribution;
