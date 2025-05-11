import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, CircleDollarSign, Globe } from 'lucide-react';

interface SymbolMetricsProps {
  trades: StrategyTrade[];
}

const SymbolMetrics: React.FC<SymbolMetricsProps> = ({ trades }) => {
  // Get completed trades
  const completedTrades = trades.filter(t => 
    t.profit !== undefined && 
    t.direction === 'out' && 
    t.type !== 'balance' && 
    t.type !== '');
  
  // Generate symbol data
  const symbolData = React.useMemo(() => {
    if (!completedTrades.length) return [];
    
    const symbolMap = new Map();
    
    completedTrades.forEach(trade => {
      const symbol = trade.symbol || 'Unknown';
      const profit = trade.profit || 0;
      
      if (!symbolMap.has(symbol)) {
        symbolMap.set(symbol, {
          symbol,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          breakEvenTrades: 0,
          totalProfit: 0,
          avgProfit: 0,
          winRate: 0,
          profitFactor: 0,
          grossProfit: 0,
          grossLoss: 0
        });
      }
      
      const stats = symbolMap.get(symbol);
      stats.totalTrades++;
      stats.totalProfit += profit;
      
      if (profit > 0) {
        stats.winningTrades++;
        stats.grossProfit += profit;
      } else if (profit < 0) {
        stats.losingTrades++;
        stats.grossLoss += Math.abs(profit);
      } else {
        stats.breakEvenTrades++;
      }
    });
    
    // Calculate derived metrics
    symbolMap.forEach(stats => {
      stats.winRate = stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0;
      stats.profitFactor = stats.grossLoss > 0 ? stats.grossProfit / stats.grossLoss : stats.grossProfit > 0 ? Infinity : 0;
      stats.avgProfit = stats.totalTrades > 0 ? stats.totalProfit / stats.totalTrades : 0;
    });
    
    // Sort by total profit
    return Array.from(symbolMap.values())
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }, [completedTrades]);
  
  // Create data for pie charts
  const volumeBySymbol = React.useMemo(() => {
    if (!symbolData.length) return [];
    
    // Take top 8 symbols and group the rest as "Others"
    const topSymbols = symbolData.slice(0, 8);
    const otherSymbols = symbolData.slice(8);
    
    const result = topSymbols.map(item => ({
      name: item.symbol,
      value: item.totalTrades,
    }));
    
    if (otherSymbols.length > 0) {
      const otherTrades = otherSymbols.reduce((sum, item) => sum + item.totalTrades, 0);
      if (otherTrades > 0) {
        result.push({ name: 'Others', value: otherTrades });
      }
    }
    
    return result;
  }, [symbolData]);
  
  const profitBySymbol = React.useMemo(() => {
    if (!symbolData.length) return [];
    
    // Take top 8 symbols and group the rest as "Others"
    const topSymbols = symbolData.slice(0, 8);
    const otherSymbols = symbolData.slice(8);
    
    const result = topSymbols.map(item => ({
      name: item.symbol,
      value: item.totalProfit,
    }));
    
    if (otherSymbols.length > 0) {
      const otherProfit = otherSymbols.reduce((sum, item) => sum + item.totalProfit, 0);
      result.push({ name: 'Others', value: otherProfit });
    }
    
    return result;
  }, [symbolData]);
  
  // Get top symbols for the bar chart - limit to 10 for better visibility
  const topSymbols = React.useMemo(() => {
    return symbolData.slice(0, 10).map(item => ({
      symbol: item.symbol,
      profit: item.totalProfit,
      winRate: item.winRate
    }));
  }, [symbolData]);
  
  // COLORS for the pie charts
  const COLORS = ['#9b87f5', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#ea384c'];
  
  if (!symbolData.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No symbol data available for analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Symbol Performance</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trades by Symbol Pie Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" /> Trades by Symbol
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pb-4">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={volumeBySymbol}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={false}
                  >
                    {volumeBySymbol.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} trades`, 'Volume']} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Profit by Symbol Pie Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5" /> Profit by Symbol
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pb-4">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={profitBySymbol}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}`}
                    isAnimationActive={false}
                  >
                    {profitBySymbol.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value >= 0 ? COLORS[index % COLORS.length] : '#ea384c'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit/Loss']} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance by Symbol Bar Chart */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" /> Symbol Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[450px] pt-4 pb-12">
          <ChartContainer config={{ profit: { color: "#9b87f5" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topSymbols}
                margin={{ top: 20, right: 50, left: 40, bottom: 100 }}
                barGap={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="symbol" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 12 }}
                  tickMargin={20}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  width={60}
                  label={{ 
                    value: 'Profit/Loss ($)', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -10,
                    dx: -20,
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }} 
                  tickFormatter={(value) => `$${value}`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  width={60}
                  domain={[0, 100]} 
                  label={{ 
                    value: 'Win Rate (%)', 
                    angle: -90, 
                    position: 'insideRight',
                    dx: 20,
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }} 
                  tickFormatter={(value) => `${value}%`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const profitValue = typeof payload[0].value === 'number' ? payload[0].value : 0;
                      const winRateValue = typeof payload[1].value === 'number' ? payload[1].value : 0;
                      
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-bold">{payload[0].payload.symbol}</p>
                          <p className="text-sm">P&L: <span className={profitValue >= 0 ? 'text-green-500' : 'text-red-500'}>
                            ${profitValue.toFixed(2)}
                          </span></p>
                          <p className="text-sm">Win Rate: {winRateValue.toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  wrapperStyle={{ zIndex: 100 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={40}
                  wrapperStyle={{ paddingTop: 20, bottom: 0 }}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="profit" 
                  name="P&L" 
                  fill="#9b87f5" 
                  maxBarSize={40}
                  isAnimationActive={false}
                  radius={[4, 4, 0, 0]}
                >
                  {topSymbols.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.profit >= 0 ? '#9b87f5' : '#ea384c'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
                <Bar 
                  yAxisId="right" 
                  dataKey="winRate" 
                  name="Win Rate" 
                  fill="#82ca9d"
                  maxBarSize={40}
                  isAnimationActive={false}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Symbol Metrics Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Symbol Metrics Details</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Avg Trade</TableHead>
                <TableHead>Profit Factor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {symbolData.map((symbol, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{symbol.symbol}</TableCell>
                  <TableCell>{symbol.totalTrades}</TableCell>
                  <TableCell>{symbol.winRate.toFixed(1)}%</TableCell>
                  <TableCell className={symbol.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${symbol.totalProfit.toFixed(2)}
                  </TableCell>
                  <TableCell className={symbol.avgProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${symbol.avgProfit.toFixed(2)}
                  </TableCell>
                  <TableCell>{symbol.profitFactor === Infinity ? '∞' : symbol.profitFactor.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SymbolMetrics;
