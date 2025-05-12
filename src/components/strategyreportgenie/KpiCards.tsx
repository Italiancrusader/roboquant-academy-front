import React from 'react';
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Scale,
  BarChart4,
  Award,
  Percent,
  Calendar,
  Timer,
  BarChart2,
  LineChart,
  CircleDollarSign
} from 'lucide-react';

interface KpiCardsProps {
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
}

const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div className="bg-primary rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-primary-foreground">Net Profit</p>
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <h3 className={`text-2xl font-semibold mt-2 text-primary-foreground`}>
          ${metrics.totalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <div className="text-xs text-primary-foreground/80 mt-1">
          Total result for all trades
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Max Drawdown</p>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </div>
        <h3 className="text-2xl font-semibold mt-2 text-destructive">
          ${metrics.maxDrawdown.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <div className="text-xs text-muted-foreground mt-1">
          {metrics.relativeDrawdown.toFixed(2)}% relative drawdown
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Profit Factor</p>
          <Scale className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mt-2 text-card-foreground">
          {metrics.profitFactor.toFixed(2)}
        </h3>
        <div className="text-xs text-muted-foreground mt-1">
          Gross Profit / Gross Loss
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Win Rate</p>
          <Award className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mt-2 text-card-foreground">
          {metrics.winRate.toFixed(2)}%
        </h3>
        <div className="text-xs text-muted-foreground mt-1">
          {metrics.tradesTotal} trades total
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Avg Profit</p>
          <CircleDollarSign className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mt-2 text-card-foreground">
          ${metrics.avgTradeProfit.toFixed(2)}
        </h3>
        <div className="text-xs text-muted-foreground mt-1">
          Average profit per trade
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Recovery Factor</p>
          <LineChart className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mt-2 text-card-foreground">
          {metrics.recoveryFactor.toFixed(2)}
        </h3>
        <div className="text-xs text-muted-foreground mt-1">
          Net Profit / Max Drawdown
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
          <BarChart2 className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mt-2 text-card-foreground">
          {metrics.sharpeRatio.toFixed(2)}
        </h3>
        <div className="text-xs text-muted-foreground mt-1">
          Risk-adjusted return
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Expected Payoff</p>
          <Percent className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mt-2 text-card-foreground">
          ${metrics.expectedPayoff.toFixed(2)}
        </h3>
        <div className="text-xs text-muted-foreground mt-1">
          Average trade result
        </div>
      </div>
    </div>
  );
};

export default KpiCards;
