
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
    
    return symbolData.map(item => ({
      name: item.symbol,
      value: item.totalTrades,
    }));
  }, [symbolData]);
  
  const profitBySymbol = React.useMemo(() => {
    if (!symbolData.length) return [];
    
    return symbolData.map(item => ({
      name: item.symbol,
      value: item.totalProfit,
    }));
  }, [symbolData]);
  
  // COLORS for the pie charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  if (!symbolData.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No symbol data available for analysis</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Symbol Performance</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trades by Symbol Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" /> Trades by Symbol
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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
                  >
                    {volumeBySymbol.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} trades`, 'Volume']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Profit by Symbol Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5" /> Profit by Symbol
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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
                    label={({ name }) => name}
                  >
                    {profitBySymbol.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value >= 0 ? COLORS[index % COLORS.length] : '#ff0000'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit/Loss']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance by Symbol Bar Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" /> Symbol Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer config={{ profit: { color: "hsl(var(--primary))" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={symbolData.map(item => ({
                  symbol: item.symbol,
                  profit: item.totalProfit,
                  winRate: item.winRate
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis 
                  yAxisId="left" 
                  label={{ 
                    value: 'Profit/Loss', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }} 
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 100]} 
                  label={{ 
                    value: 'Win Rate %', 
                    angle: -90, 
                    position: 'insideRight',
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }} 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="profit" 
                  name="P&L" 
                  fill="hsl(var(--primary))" 
                >
                  {symbolData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={symbolData[index].totalProfit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                    />
                  ))}
                </Bar>
                <Bar 
                  yAxisId="right" 
                  dataKey="winRate" 
                  name="Win Rate" 
                  fill="hsl(var(--accent))" 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Detailed Symbol Metrics Table */}
      <Card>
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
