
import React from 'react';
import { MT5Trade } from '@/types/mt5reportgenie';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MetricCard from '@/components/ui/metrics-card';
import {
  TrendingUp,
  ArrowUpDown,
  BarChart3,
  CircleDollarSign,
  ShieldAlert,
  PieChart,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import ChartWrapper from '@/components/ui/chart-wrapper';

interface PerformanceStatsViewProps {
  trades: MT5Trade[];
}

const PerformanceStatsView: React.FC<PerformanceStatsViewProps> = ({ trades }) => {
  // Filter completed trades
  const completedTrades = trades.filter(trade => 
    trade.profit !== undefined && trade.direction === 'out'
  );
  
  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (completedTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        netProfit: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
      };
    }
    
    const winTrades = completedTrades.filter(t => t.profit && t.profit > 0);
    const lossTrades = completedTrades.filter(t => t.profit && t.profit < 0);
    
    const winRate = winTrades.length / completedTrades.length * 100;
    
    const totalWins = winTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLosses = Math.abs(lossTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
    
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
    
    const avgWin = winTrades.length > 0 
      ? winTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / winTrades.length
      : 0;
    
    const avgLoss = lossTrades.length > 0
      ? lossTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / lossTrades.length
      : 0;
    
    const largestWin = winTrades.length > 0
      ? Math.max(...winTrades.map(t => t.profit || 0))
      : 0;
    
    const largestLoss = lossTrades.length > 0
      ? Math.min(...lossTrades.map(t => t.profit || 0))
      : 0;
    
    const netProfit = completedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    
    // Calculate maximum drawdown
    let maxBalance = 0;
    let currentDrawdown = 0;
    let maxDrawdown = 0;
    
    // Find trades with balance info
    const balanceTrades = trades.filter(t => t.balance !== undefined);
    
    if (balanceTrades.length > 0) {
      maxBalance = balanceTrades[0].balance || 0;
      
      balanceTrades.forEach(trade => {
        if (trade.balance !== undefined) {
          if (trade.balance > maxBalance) {
            maxBalance = trade.balance;
            currentDrawdown = 0;
          } else {
            currentDrawdown = maxBalance - trade.balance;
            if (currentDrawdown > maxDrawdown) {
              maxDrawdown = currentDrawdown;
            }
          }
        }
      });
    }
    
    // Calculate Sharpe ratio (simplified)
    const returns = [];
    let prevBalance = null;
    
    balanceTrades.forEach(trade => {
      if (trade.balance !== undefined) {
        if (prevBalance !== null) {
          returns.push((trade.balance - prevBalance) / prevBalance);
        }
        prevBalance = trade.balance;
      }
    });
    
    const avgReturn = returns.length > 0 
      ? returns.reduce((sum, r) => sum + r, 0) / returns.length 
      : 0;
    
    const stdDevReturn = returns.length > 0
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
      : 1;
    
    const sharpeRatio = stdDevReturn > 0 ? (avgReturn / stdDevReturn) * Math.sqrt(252) : 0;
    
    return {
      totalTrades: completedTrades.length,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      netProfit,
      sharpeRatio,
      maxDrawdown,
    };
  }, [completedTrades, trades]);

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Calculate Trade quality score (0-100)
  const calculateTradeQuality = () => {
    if (metrics.totalTrades < 5) return 0;
    
    // Components that make up the score
    const winRateScore = Math.min(metrics.winRate / 100 * 30, 30); // 30% of score
    const pfScore = Math.min(metrics.profitFactor / 3 * 30, 30); // 30% of score
    const riskScore = metrics.maxDrawdown > 0 
      ? Math.min(Math.abs(metrics.netProfit / metrics.maxDrawdown) * 10, 20) 
      : 0; // 20% of score
    const sharpeScore = Math.min(metrics.sharpeRatio / 2 * 20, 20); // 20% of score
    
    return Math.round(winRateScore + pfScore + riskScore + sharpeScore);
  };
  
  const tradeQuality = calculateTradeQuality();
  
  // Prepare radar chart data
  const radarData = [
    { subject: 'Win Rate', score: Math.min(metrics.winRate / 100 * 100, 100) },
    { subject: 'Profit Factor', score: Math.min(metrics.profitFactor / 3 * 100, 100) },
    { subject: 'Recovery', score: metrics.maxDrawdown > 0 ? Math.min(Math.abs(metrics.netProfit / metrics.maxDrawdown) * 50, 100) : 0 },
    { subject: 'Sharpe', score: Math.min(metrics.sharpeRatio / 2 * 100, 100) },
    { subject: 'Trades', score: Math.min(metrics.totalTrades / 100 * 100, 100) },
  ];

  return (
    <div className="space-y-4">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <MetricCard 
          title="Total Trades"
          value={metrics.totalTrades}
          icon={<BarChart3 size={16} />}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          icon={<TrendingUp size={16} />}
          trend={metrics.winRate > 50 ? 'up' : metrics.winRate < 40 ? 'down' : 'neutral'}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Profit Factor"
          value={metrics.profitFactor.toFixed(2)}
          icon={<ArrowUpDown size={16} />}
          trend={metrics.profitFactor > 1 ? 'up' : 'down'}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Trade Quality"
          value={`${tradeQuality}/100`}
          icon={<PieChart size={16} />}
          trend={tradeQuality > 70 ? 'up' : tradeQuality < 40 ? 'down' : 'neutral'}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Sharpe Ratio"
          value={metrics.sharpeRatio.toFixed(2)}
          icon={<CircleDollarSign size={16} />}
          trend={metrics.sharpeRatio > 1 ? 'up' : metrics.sharpeRatio < 0 ? 'down' : 'neutral'}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Max Drawdown"
          value={formatCurrency(metrics.maxDrawdown)}
          icon={<ShieldAlert size={16} />}
          trend={'neutral'}
          variant="filled"
          size="sm"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trade Statistics Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={2} className="text-center font-medium">Trade Statistics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Total Net Profit</TableCell>
                <TableCell className={metrics.netProfit >= 0 ? 'text-success' : 'text-destructive'}>
                  {formatCurrency(metrics.netProfit)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Average Win</TableCell>
                <TableCell className="text-success">{formatCurrency(metrics.avgWin)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Average Loss</TableCell>
                <TableCell className="text-destructive">{formatCurrency(metrics.avgLoss)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Largest Win</TableCell>
                <TableCell className="text-success">{formatCurrency(metrics.largestWin)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Largest Loss</TableCell>
                <TableCell className="text-destructive">{formatCurrency(metrics.largestLoss)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Risk-Reward Ratio</TableCell>
                <TableCell>
                  {metrics.avgLoss !== 0 ? Math.abs(metrics.avgWin / metrics.avgLoss).toFixed(2) : 'N/A'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expectancy</TableCell>
                <TableCell>
                  {formatCurrency((metrics.winRate / 100) * metrics.avgWin + (1 - metrics.winRate / 100) * metrics.avgLoss)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
        
        {/* Performance Radar Chart */}
        <ChartWrapper
          title="Performance Metrics"
          description="Trading quality indicators (higher is better)"
          height="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <Radar
                name="Performance"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
};

export default PerformanceStatsView;
