import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, BarChart2, LineChart, AlertTriangle } from "lucide-react";

interface RiskMetricsProps {
  trades: StrategyTrade[];
}

const RiskMetrics: React.FC<RiskMetricsProps> = ({ trades }) => {
  // Filter out initial balance entries (type is 'balance' or empty)
  const filteredTrades = React.useMemo(() => {
    return trades.filter(trade => !(trade.type === 'balance' || trade.type === ''));
  }, [trades]);

  // Filter trades with profit data and that are "out" trades (completed)
  const completedTrades = filteredTrades.filter(t => t.profit !== undefined && t.direction === 'out');
  
  // Create metrics for the risk analysis
  const riskMetrics = React.useMemo(() => {
    if (!completedTrades.length) return null;
    
    // Calculate profit and loss statistics
    const profitableTrades = completedTrades.filter(t => t.profit !== undefined && t.profit > 0);
    const lossTrades = completedTrades.filter(t => t.profit !== undefined && t.profit < 0);
    
    const winRate = completedTrades.length ? 
      (profitableTrades.length / completedTrades.length) * 100 : 0;
      
    const avgWin = profitableTrades.length ? 
      profitableTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / profitableTrades.length : 0;
      
    const avgLoss = lossTrades.length ? 
      Math.abs(lossTrades.reduce((sum, t) => sum + (t.profit || 0), 0)) / lossTrades.length : 0;
    
    const riskRewardRatio = avgLoss ? avgWin / avgLoss : 0;
    
    // Calculate consecutive wins and losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentConsecutiveWins = 0;
    let currentConsecutiveLosses = 0;
    
    completedTrades.forEach(trade => {
      if (trade.profit !== undefined) {
        if (trade.profit > 0) {
          currentConsecutiveWins++;
          currentConsecutiveLosses = 0;
        } else {
          currentConsecutiveLosses++;
          currentConsecutiveWins = 0;
        }
        
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins);
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
      }
    });
    
    // Group trades by profit size to create histogram data
    const profitBuckets = [
      { range: "< -500", count: 0 },
      { range: "-500 to -200", count: 0 },
      { range: "-200 to -100", count: 0 },
      { range: "-100 to -50", count: 0 },
      { range: "-50 to 0", count: 0 },
      { range: "0 to 50", count: 0 },
      { range: "50 to 100", count: 0 },
      { range: "100 to 200", count: 0 },
      { range: "200 to 500", count: 0 },
      { range: "> 500", count: 0 },
    ];
    
    completedTrades.forEach(trade => {
      const profit = trade.profit || 0;
      
      if (profit < -500) profitBuckets[0].count++;
      else if (profit < -200) profitBuckets[1].count++;
      else if (profit < -100) profitBuckets[2].count++;
      else if (profit < -50) profitBuckets[3].count++;
      else if (profit < 0) profitBuckets[4].count++;
      else if (profit < 50) profitBuckets[5].count++;
      else if (profit < 100) profitBuckets[6].count++;
      else if (profit < 200) profitBuckets[7].count++;
      else if (profit < 500) profitBuckets[8].count++;
      else profitBuckets[9].count++;
    });
    
    return {
      winRate,
      avgWin,
      avgLoss,
      riskRewardRatio,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      profitBuckets,
      totalTrades: completedTrades.length,
      profitableTrades: profitableTrades.length,
      lossTrades: lossTrades.length
    };
  }, [completedTrades]);

  if (!riskMetrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No trade data available for risk analysis</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Risk & Performance Metrics</h2>
      
      <div className="grid grid-cols-1 gap-8 mb-10">
        {/* Risk Reward Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" /> Risk/Reward Analysis
            </CardTitle>
            <CardDescription>
              Key metrics for risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Interpretation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Risk/Reward Ratio</TableCell>
                  <TableCell className="font-medium">
                    {riskMetrics.riskRewardRatio.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {riskMetrics.riskRewardRatio >= 1.5 ? 
                      'Excellent' : riskMetrics.riskRewardRatio >= 1 ? 'Good' : 'Needs improvement'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Avg Win</TableCell>
                  <TableCell className="font-medium text-green-500">
                    ${riskMetrics.avgWin.toFixed(2)}
                  </TableCell>
                  <TableCell>{riskMetrics.profitableTrades} winning trades</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Avg Loss</TableCell>
                  <TableCell className="font-medium text-red-500">
                    ${riskMetrics.avgLoss.toFixed(2)}
                  </TableCell>
                  <TableCell>{riskMetrics.lossTrades} losing trades</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Win Rate</TableCell>
                  <TableCell className="font-medium">
                    {riskMetrics.winRate.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {riskMetrics.winRate >= 60 ? 
                      'Excellent' : riskMetrics.winRate >= 50 ? 'Good' : 'Below average'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Max Consecutive Wins</TableCell>
                  <TableCell className="font-medium">
                    {riskMetrics.maxConsecutiveWins}
                  </TableCell>
                  <TableCell>Longest winning streak</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Max Consecutive Losses</TableCell>
                  <TableCell className="font-medium">
                    {riskMetrics.maxConsecutiveLosses}
                  </TableCell>
                  <TableCell>Longest losing streak</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Profit Distribution Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart2 className="h-5 w-5" /> Profit Distribution
            </CardTitle>
            <CardDescription>
              Distribution of trade results
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-10">
            <div className="h-[380px] relative">
              {/* Custom legend at the top */}
              <div className="absolute top-2 right-5 z-10 bg-background/80 py-1 px-3 rounded-md border border-border/40 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary"></div>
                  <span className="text-xs text-muted-foreground">Trades</span>
                </div>
              </div>
              
              <ChartContainer config={{ profit: { color: "hsl(var(--primary))" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={riskMetrics.profitBuckets}
                    margin={{ top: 20, right: 10, left: 10, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="range" 
                      tick={{ fontSize: 11 }} 
                      height={70}
                      angle={-40}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip 
                      wrapperStyle={{ zIndex: 1000 }}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="count" name="Trades" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment Card - completely separate with big margin */}
      <div className="mt-12 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Risk Assessment
            </CardTitle>
            <CardDescription>
              Trading system risk evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Risk Reward Ratio: </strong> 
                Your strategy {riskMetrics.riskRewardRatio >= 1.5 ? 
                  'has an excellent risk-reward profile' : 
                  riskMetrics.riskRewardRatio >= 1 ? 
                    'has a good risk-reward balance' : 
                    'needs improvement in its risk-reward profile'}. The ratio of {riskMetrics.riskRewardRatio.toFixed(2)} means 
                {riskMetrics.riskRewardRatio >= 1 ? 
                  ' your average winner is larger than your average loser, which is positive.' : 
                  ' your average loser is larger than your average winner, which is concerning.'}
              </p>
              <p>
                <strong>Win Rate Analysis: </strong>
                With a {riskMetrics.winRate.toFixed(1)}% win rate across {riskMetrics.totalTrades} trades,
                your strategy {riskMetrics.winRate >= 60 ? 
                  'shows excellent performance' : 
                  riskMetrics.winRate >= 50 ? 
                    'is performing above average' : 
                    'is underperforming and needs optimization'}.
              </p>
              <p>
                <strong>Consecutive Losses: </strong>
                The longest losing streak of {riskMetrics.maxConsecutiveLosses} trades 
                {riskMetrics.maxConsecutiveLosses >= 6 ? 
                  ' indicates a significant drawdown risk. Consider adding stronger risk management rules.' : 
                  ' is within acceptable limits for most risk management frameworks.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskMetrics;
