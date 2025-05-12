import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
  Scale,
  Percent
} from 'lucide-react';

interface StrategyOverviewProps {
  metrics: {
    totalNetProfit: number;
    profitFactor: number;
    maxDrawdown: number;
    relativeDrawdown: number;
    sharpeRatio: number;
    tradesTotal: number;
    winRate: number;
    avgTradeProfit: number;
    recoveryFactor: number;
    tradeDuration: string;
    expectedPayoff: number;
    [key: string]: any;
  };
  startDate: Date;
  endDate: Date;
}

const StrategyOverview: React.FC<StrategyOverviewProps> = ({ metrics, startDate, endDate }) => {
  // Calculate additional metrics
  const tradingDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const tradesPerDay = metrics.tradesTotal / tradingDays;
  const annualizedReturn = (Math.pow(1 + metrics.totalNetProfit / 10000, 365 / tradingDays) - 1) * 100;
  const profitabilityRatio = metrics.winRate * metrics.profitFactor;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Strategy Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Summary</CardTitle>
          <CardDescription>Key performance metrics and trading characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Net Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalNetProfit)}</p>
                <Badge variant={metrics.totalNetProfit >= 0 ? "default" : "destructive"} className="h-6">
                  {metrics.totalNetProfit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Annualized Return</span>
              </div>
              <p className="text-2xl font-bold">{annualizedReturn.toFixed(2)}%</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Profit Factor</span>
              </div>
              <p className="text-2xl font-bold">{metrics.profitFactor.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Max Drawdown</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{metrics.relativeDrawdown.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Statistics</CardTitle>
          <CardDescription>Detailed analysis of trading performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold">{metrics.winRate.toFixed(2)}%</p>
                <Badge variant={metrics.winRate >= 50 ? "default" : "secondary"}>
                  {metrics.tradesTotal} trades
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Trade Profit</p>
              <p className="text-xl font-semibold">{formatCurrency(metrics.avgTradeProfit)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Recovery Factor</p>
              <p className="text-xl font-semibold">{metrics.recoveryFactor.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Sharpe Ratio</p>
              <p className="text-xl font-semibold">{metrics.sharpeRatio.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Trading Period</p>
              <p className="text-xl font-semibold">{tradingDays} days</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Trades per Day</p>
              <p className="text-xl font-semibold">{tradesPerDay.toFixed(1)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Trade Duration</p>
              <p className="text-xl font-semibold">{metrics.tradeDuration}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Profitability Score</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold">{profitabilityRatio.toFixed(2)}</p>
                <Badge variant={profitabilityRatio >= 50 ? "default" : "secondary"} className="h-6">
                  {profitabilityRatio >= 50 ? "Good" : "Fair"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyOverview; 