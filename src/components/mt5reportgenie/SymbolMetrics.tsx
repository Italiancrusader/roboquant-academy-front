
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Legend,
  Tooltip,
  PieChart,
  Pie,
  Sector,
  LabelList,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SymbolMetricsProps {
  trades: MT5Trade[];
}

const SymbolMetrics: React.FC<SymbolMetricsProps> = ({ trades }) => {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>();
  
  // Process and group trades by symbol
  const symbolData = React.useMemo(() => {
    const data = trades.reduce((acc, trade) => {
      if (!trade.symbol || trade.direction !== 'out') return acc;
      
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = {
          symbol: trade.symbol,
          totalProfit: 0,
          trades: 0,
          wins: 0,
          losses: 0,
          volume: 0,
          averageProfit: 0,
          winRate: 0,
          profitFactor: 0,
          grossProfit: 0,
          grossLoss: 0,
        };
      }
      
      const profit = trade.profit || 0;
      
      acc[trade.symbol].totalProfit += profit;
      acc[trade.symbol].trades += 1;
      
      if (profit > 0) {
        acc[trade.symbol].wins += 1;
        acc[trade.symbol].grossProfit += profit;
      } else {
        acc[trade.symbol].losses += 1;
        acc[trade.symbol].grossLoss += Math.abs(profit);
      }
      
      acc[trade.symbol].volume += trade.volumeLots || 0;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate derived metrics and convert to array
    return Object.values(data).map(symbol => ({
      ...symbol,
      winRate: ((symbol.wins / symbol.trades) * 100),
      profitFactor: symbol.grossLoss > 0 ? symbol.grossProfit / symbol.grossLoss : symbol.grossProfit > 0 ? Infinity : 0,
      averageProfit: symbol.trades > 0 ? symbol.totalProfit / symbol.trades : 0,
    }));
  }, [trades]);
  
  // Sort data by total profit (descending)
  const sortedSymbolData = [...symbolData].sort((a, b) => b.totalProfit - a.totalProfit);
  
  // Get top 10 symbols for charts
  const topSymbols = sortedSymbolData.slice(0, 10);

  // Calculate volume distribution data
  const volumeData = React.useMemo(() => {
    const totalVolume = symbolData.reduce((sum, item) => sum + item.volume, 0);
    
    return sortedSymbolData
      .filter(item => (item.volume / totalVolume) > 0.01) // Filter out symbols with less than 1% of total volume
      .map(item => ({
        symbol: item.symbol,
        volume: item.volume,
        percentage: (item.volume / totalVolume) * 100
      }));
  }, [sortedSymbolData]);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Configuration for the charts
  const config = {
    symbols: {
      label: 'Symbol Performance',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
  };

  // Make the pie chart interactive when hovering
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Render active shape for pie chart with additional details
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    
    return (
      <g>
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="hsl(var(--foreground))">
          {payload.symbol}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="hsl(var(--muted-foreground))">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <h2 className="text-xl font-semibold mb-4">Trading Instruments Analysis</h2>
        
        <div className="flex flex-wrap gap-2">
          {topSymbols.slice(0, 5).map((item, i) => (
            <Badge key={i} variant={item.totalProfit > 0 ? "default" : "destructive"}>
              {item.symbol}: {formatCurrency(item.totalProfit)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symbol Performance Chart */}
        <Card className="p-5">
          <h3 className="text-base font-medium mb-4">Profit/Loss by Symbol</h3>
          <div className="h-[350px]">
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSymbols}
                  margin={{ top: 20, right: 30, left: 65, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis
                    dataKey="symbol"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-xl">
                          <div className="text-sm font-medium mb-1">
                            {data.symbol}
                          </div>
                          <div className={`text-base font-bold ${data.totalProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(data.totalProfit)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Win Rate: {data.winRate.toFixed(1)}% ({data.wins}/{data.trades})
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Profit Factor: {data.profitFactor === Infinity ? '∞' : data.profitFactor.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Volume: {data.volume.toFixed(2)} lots
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="totalProfit"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  >
                    {topSymbols.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.totalProfit > 0 ? 'hsl(142.1, 76.2%, 36.3%)' : 'hsl(346.8, 77.2%, 49.8%)'}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
        
        {/* Trading Volume Distribution */}
        <Card className="p-5">
          <h3 className="text-base font-medium mb-4">Volume Distribution</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={volumeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  dataKey="volume"
                  onMouseEnter={onPieEnter}
                  paddingAngle={1}
                >
                  {volumeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${index * 25 % 360}, 70%, 60%)`} 
                      strokeWidth={1}
                      stroke="hsl(var(--background))"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-xl">
                        <div className="text-sm font-medium">
                          {data.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {data.volume.toFixed(2)} lots ({data.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Symbol Performance Table */}
      <Card className="p-5">
        <h3 className="text-base font-medium mb-4">Detailed Symbol Performance</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Symbol</TableHead>
                <TableHead className="text-right">Profit/Loss</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Avg P/L</TableHead>
                <TableHead className="text-right">Trades</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">PF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSymbolData.map((symbol, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{symbol.symbol}</TableCell>
                  <TableCell className={`text-right ${symbol.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(symbol.totalProfit)}
                  </TableCell>
                  <TableCell className="text-right">{symbol.winRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(symbol.averageProfit)}</TableCell>
                  <TableCell className="text-right">{symbol.trades}</TableCell>
                  <TableCell className="text-right">{symbol.volume.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{symbol.profitFactor === Infinity ? '∞' : symbol.profitFactor.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default SymbolMetrics;
