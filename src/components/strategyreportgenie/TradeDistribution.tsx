
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Layers, ArrowUpDown, Clock } from 'lucide-react';

interface TradeDistributionProps {
  trades: StrategyTrade[];
}

// Add an interface for the hour distribution data
interface HourDistributionData {
  hour: number;
  count: number;
  profit: number;
  winRate: number;
  winningTrades: number;
  totalTrades: number;
  hourFormatted: string; // Add the hourFormatted property to the interface
}

const TradeDistribution: React.FC<TradeDistributionProps> = ({ trades }) => {
  // Get completed trades
  const completedTrades = trades.filter(t => 
    t.profit !== undefined && 
    t.direction === 'out' && 
    t.type !== 'balance' && 
    t.type !== '');
  
  // Generate trade type distribution (long vs short)
  const tradeTypeDistribution = React.useMemo(() => {
    if (!completedTrades.length) return [];
    
    const typeMap = new Map();
    
    completedTrades.forEach(trade => {
      // Determine trade direction (buy/sell or long/short)
      let tradeType = 'Unknown';
      if (trade.side) {
        tradeType = trade.side.charAt(0).toUpperCase() + trade.side.slice(1);
      } else if (trade.type) {
        if (trade.type.toLowerCase().includes('buy')) tradeType = 'Buy';
        else if (trade.type.toLowerCase().includes('sell')) tradeType = 'Sell';
      }
      
      if (!typeMap.has(tradeType)) {
        typeMap.set(tradeType, {
          name: tradeType,
          count: 0,
          profit: 0,
          winningTrades: 0
        });
      }
      
      const stats = typeMap.get(tradeType);
      stats.count++;
      stats.profit += trade.profit || 0;
      
      if ((trade.profit || 0) > 0) {
        stats.winningTrades++;
      }
    });
    
    // Calculate win rate
    typeMap.forEach(stats => {
      stats.winRate = stats.count > 0 ? (stats.winningTrades / stats.count) * 100 : 0;
    });
    
    return Array.from(typeMap.values());
  }, [completedTrades]);
  
  // Generate trade time distribution (by hour of day)
  const tradeTimeDistribution = React.useMemo(() => {
    if (!completedTrades.length) return [];
    
    // Initialize hours array
    const hourDistribution: HourDistributionData[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      profit: 0,
      winRate: 0,
      winningTrades: 0,
      totalTrades: 0,
      hourFormatted: `${i}:00` // Initialize the hourFormatted property
    }));
    
    completedTrades.forEach(trade => {
      const hour = trade.openTime.getHours();
      
      hourDistribution[hour].totalTrades++;
      hourDistribution[hour].profit += trade.profit || 0;
      
      if ((trade.profit || 0) > 0) {
        hourDistribution[hour].winningTrades++;
      }
    });
    
    // Calculate win rate for each hour
    hourDistribution.forEach(hour => {
      hour.winRate = hour.totalTrades > 0 ? (hour.winningTrades / hour.totalTrades) * 100 : 0;
      hour.hour = hour.hour; // Keep the numeric value
      hour.hourFormatted = `${hour.hour}:00`; // Add a string representation
    });
    
    // Keep only hours with trades
    return hourDistribution.filter(hour => hour.totalTrades > 0);
  }, [completedTrades]);
  
  // Generate profit distribution histogram
  const profitDistribution = React.useMemo(() => {
    if (!completedTrades.length) return [];
    
    // Define profit buckets
    const buckets = [
      { range: "< -500", min: -Infinity, max: -500, count: 0 },
      { range: "-500 to -200", min: -500, max: -200, count: 0 },
      { range: "-200 to -100", min: -200, max: -100, count: 0 },
      { range: "-100 to -50", min: -100, max: -50, count: 0 },
      { range: "-50 to 0", min: -50, max: 0, count: 0 },
      { range: "0 to 50", min: 0, max: 50, count: 0 },
      { range: "50 to 100", min: 50, max: 100, count: 0 },
      { range: "100 to 200", min: 100, max: 200, count: 0 },
      { range: "200 to 500", min: 200, max: 500, count: 0 },
      { range: "> 500", min: 500, max: Infinity, count: 0 },
    ];
    
    // Count trades in each bucket
    completedTrades.forEach(trade => {
      const profit = trade.profit || 0;
      
      const bucket = buckets.find(b => profit > b.min && profit <= b.max);
      if (bucket) {
        bucket.count++;
      }
    });
    
    return buckets;
  }, [completedTrades]);
  
  // COLORS for the charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!completedTrades.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No trade data available for distribution analysis</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Trade Distribution</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trade Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" /> Trade Direction
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="count"
                    data={tradeTypeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {tradeTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]} 
                    labelFormatter={() => 'Trade Count'} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Profit Distribution Histogram */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5" /> Profit Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{ profit: { color: "hsl(var(--primary))" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} trades`, 'Count']} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Trade Count" 
                    fill="hsl(var(--primary))" 
                  >
                    {profitDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.min >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Time Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" /> Trading Hour Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer config={{ profit: { color: "hsl(var(--primary))" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={tradeTimeDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hourFormatted" 
                  name="Hour"
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  label={{ 
                    value: 'Number of Trades', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }} 
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
                  dataKey="totalTrades" 
                  name="Total Trades" 
                  fill="hsl(var(--primary))" 
                />
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
    </div>
  );
};

export default TradeDistribution;
