
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
  Pie,
  PieChart,
  Legend,
} from 'recharts';
import ChartWrapper from '@/components/ui/chart-wrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface SymbolsAnalysisViewProps {
  trades: MT5Trade[];
}

const SymbolsAnalysisView: React.FC<SymbolsAnalysisViewProps> = ({ trades }) => {
  // Filter completed trades
  const completedTrades = trades.filter(trade => 
    trade.profit !== undefined && trade.direction === 'out'
  );
  
  // Group trades by symbol
  const symbolData = React.useMemo(() => {
    if (completedTrades.length === 0) return [];
    
    const symbolGroups: Record<string, {
      symbol: string;
      trades: number;
      wins: number;
      losses: number;
      profit: number;
      volume: number;
      averageProfit: number;
      winRate: number;
    }> = {};
    
    completedTrades.forEach(trade => {
      const symbol = trade.symbol || 'Unknown';
      const profit = trade.profit || 0;
      const volume = trade.volumeLots || 0;
      
      if (!symbolGroups[symbol]) {
        symbolGroups[symbol] = {
          symbol,
          trades: 0,
          wins: 0,
          losses: 0,
          profit: 0,
          volume: 0,
          averageProfit: 0,
          winRate: 0,
        };
      }
      
      symbolGroups[symbol].trades += 1;
      symbolGroups[symbol].profit += profit;
      symbolGroups[symbol].volume += volume;
      
      if (profit > 0) {
        symbolGroups[symbol].wins += 1;
      } else if (profit < 0) {
        symbolGroups[symbol].losses += 1;
      }
    });
    
    // Calculate averages and win rates
    return Object.values(symbolGroups).map(group => ({
      ...group,
      averageProfit: group.profit / group.trades,
      winRate: (group.wins / group.trades) * 100,
    })).sort((a, b) => b.profit - a.profit);
  }, [completedTrades]);
  
  // Prepare data for volume distribution pie chart
  const volumeDistribution = React.useMemo(() => {
    const totalVolume = symbolData.reduce((sum, s) => sum + s.volume, 0);
    
    return symbolData
      .map(s => ({
        symbol: s.symbol,
        volume: s.volume,
        percentage: totalVolume > 0 ? (s.volume / totalVolume) * 100 : 0,
      }))
      .filter(s => s.percentage >= 1) // Filter out small symbols (< 1%)
      .sort((a, b) => b.volume - a.volume);
  }, [symbolData]);
  
  // Define colors for symbols
  const symbolColors = [
    '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
    '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395',
  ];
  
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profit by Symbol Chart */}
        <ChartWrapper
          title="Profit by Symbol"
          description="Total profit for each trading instrument"
          height="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={symbolData.slice(0, 10)} // Top 10 symbols
              margin={{ top: 10, right: 20, left: 20, bottom: 50 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={value => formatCurrency(value)}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                type="category"
                dataKey="symbol"
                tick={{ fontSize: 12 }}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  
                  return (
                    <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md">
                      <p className="text-sm font-medium">{data.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        Win Rate: {data.winRate.toFixed(1)}%
                      </p>
                      <p className={`text-sm font-medium ${data.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(data.profit)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.trades} trades ({data.volume.toFixed(2)} lots)
                      </p>
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey="profit" 
                name="Profit" 
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              >
                {symbolData.slice(0, 10).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
        
        {/* Volume Distribution Pie Chart */}
        <ChartWrapper
          title="Trading Volume Distribution"
          description="Percentage of total volume by symbol"
          height="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={volumeDistribution}
                dataKey="volume"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={45}
                paddingAngle={1}
                label={({ symbol, percentage }) => `${symbol} ${percentage.toFixed(1)}%`}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 0.5 }}
              >
                {volumeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={symbolColors[index % symbolColors.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  
                  return (
                    <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md">
                      <p className="text-sm font-medium">{data.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        Volume: {data.volume.toFixed(2)} lots
                      </p>
                      <p className="text-sm font-medium">
                        {data.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  );
                }}
              />
              <Legend formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
      
      {/* Symbol Performance Table */}
      <Card className="overflow-hidden">
        <div className="max-h-[350px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Avg. P/L</TableHead>
                <TableHead className="text-right">Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {symbolData.map((symbol, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{symbol.symbol}</TableCell>
                  <TableCell>{symbol.trades}</TableCell>
                  <TableCell>
                    <span 
                      className={symbol.winRate >= 50 ? 'text-success' : 'text-destructive'}
                    >
                      {symbol.winRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell 
                    className={`text-right ${symbol.profit >= 0 ? 'text-success' : 'text-destructive'}`}
                  >
                    {formatCurrency(symbol.profit)}
                  </TableCell>
                  <TableCell 
                    className={`text-right ${symbol.averageProfit >= 0 ? 'text-success' : 'text-destructive'}`}
                  >
                    {formatCurrency(symbol.averageProfit)}
                  </TableCell>
                  <TableCell className="text-right">{symbol.volume.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default SymbolsAnalysisView;
