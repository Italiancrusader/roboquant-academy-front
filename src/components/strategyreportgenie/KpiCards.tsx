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
  CircleDollarSign,
  CircleOff,
  Activity,
  Target,
  Clock
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
  // Helper function to determine status color
  const getStatusColor = (value: number, thresholds: { good: number, neutral: number }) => {
    if (value >= thresholds.good) return 'text-emerald-500 dark:text-emerald-400';
    if (value >= thresholds.neutral) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  // Get profit status color
  const profitColor = metrics.totalNetProfit >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
  
  // Get profit factor status color
  const pfColor = getStatusColor(metrics.profitFactor, { good: 2, neutral: 1.5 });
  
  // Get drawdown status color (inverse scale - lower is better)
  const ddColor = metrics.maxDrawdown === 0 ? 'text-emerald-500 dark:text-emerald-400' : 
                 metrics.relativeDrawdown <= 15 ? 'text-emerald-500 dark:text-emerald-400' :
                 metrics.relativeDrawdown <= 25 ? 'text-amber-500 dark:text-amber-400' :
                 'text-red-500 dark:text-red-400';
  
  // Get win rate status color
  const wrColor = getStatusColor(metrics.winRate, { good: 65, neutral: 50 });
  
  // Get Sharpe ratio status color
  const srColor = getStatusColor(metrics.sharpeRatio, { good: 1, neutral: 0.5 });
  
  // Get recovery factor status color
  const rfColor = getStatusColor(metrics.recoveryFactor, { good: 3, neutral: 1 });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Net Profit Card */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex flex-col h-full border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full bg-background/80 ${profitColor}`}>
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Net Profit</h3>
            </div>
            <div className={`hidden group-hover:flex items-center gap-1 ${profitColor} text-xs font-medium`}>
              {metrics.totalNetProfit >= 0 ? 'Profitable' : 'Losing'}
            </div>
          </div>
          <div className="mt-auto">
            <h2 className={`text-2xl font-bold ${profitColor}`}>
              ${Math.abs(metrics.totalNetProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {metrics.totalNetProfit >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span>{metrics.totalNetProfit >= 0 ? 'Gain' : 'Loss'} from all trades</span>
            </div>
          </div>
        </div>
      </div>

      {/* Max Drawdown Card */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex flex-col h-full border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full bg-background/80 ${ddColor}`}>
                <TrendingDown className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Max Drawdown</h3>
            </div>
            <div className={`hidden group-hover:flex items-center gap-1 text-xs font-medium ${ddColor}`}>
              {metrics.relativeDrawdown <= 15 ? 'Low Risk' : metrics.relativeDrawdown <= 25 ? 'Medium Risk' : 'High Risk'}
            </div>
          </div>
          <div className="mt-auto">
            <h2 className={`text-2xl font-bold ${ddColor}`}>
              ${metrics.maxDrawdown.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.relativeDrawdown.toFixed(2)}% relative
              </div>
              <div className="w-24 bg-background/80 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    metrics.relativeDrawdown <= 15 ? 'bg-emerald-500' : 
                    metrics.relativeDrawdown <= 25 ? 'bg-amber-500' : 
                    'bg-red-500'
                  }`} 
                  style={{ width: `${Math.min(metrics.relativeDrawdown, 50) * 2}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Factor Card */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex flex-col h-full border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full bg-background/80 ${pfColor}`}>
                <Scale className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Profit Factor</h3>
            </div>
            <div className={`hidden group-hover:flex items-center gap-1 text-xs font-medium ${pfColor}`}>
              {metrics.profitFactor >= 2 ? 'Excellent' : metrics.profitFactor >= 1.5 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
          <div className="mt-auto">
            <h2 className={`text-2xl font-bold ${pfColor}`}>
              {metrics.profitFactor.toFixed(2)}
            </h2>
            <div className="text-xs text-muted-foreground mt-1">
              <div className="mt-1 flex items-center justify-between">
                <span>Gross Profit / Gross Loss</span>
                <span className={pfColor}>
                  {metrics.profitFactor >= 2 ? '★★★' : metrics.profitFactor >= 1.5 ? '★★☆' : '★☆☆'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Win Rate Card */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex flex-col h-full border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full bg-background/80 ${wrColor}`}>
                <Award className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Win Rate</h3>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="px-2 py-0.5 bg-background/80 rounded-full text-muted-foreground">
                {metrics.tradesTotal} trades
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <h2 className={`text-2xl font-bold ${wrColor}`}>
              {metrics.winRate.toFixed(1)}%
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-background/80 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    metrics.winRate >= 65 ? 'bg-emerald-500' : 
                    metrics.winRate >= 50 ? 'bg-amber-500' : 
                    'bg-red-500'
                  }`} 
                  style={{ width: `${metrics.winRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sharpe Ratio Card */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex flex-col h-full border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full bg-background/80 ${srColor}`}>
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Sharpe Ratio</h3>
            </div>
            <div className={`hidden group-hover:flex items-center gap-1 text-xs font-medium ${srColor}`}>
              {metrics.sharpeRatio >= 1 ? 'Strong' : metrics.sharpeRatio >= 0.5 ? 'Moderate' : 'Weak'}
            </div>
          </div>
          <div className="mt-auto">
            <h2 className={`text-2xl font-bold ${srColor}`}>
              {metrics.sharpeRatio.toFixed(2)}
            </h2>
            <div className="text-xs text-muted-foreground mt-1">
              Risk-adjusted return (annualized)
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Factor Card */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex flex-col h-full border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full bg-background/80 ${rfColor}`}>
                <LineChart className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Recovery Factor</h3>
            </div>
            <div className={`hidden group-hover:flex items-center gap-1 text-xs font-medium ${rfColor}`}>
              {metrics.recoveryFactor >= 3 ? 'Excellent' : metrics.recoveryFactor >= 1 ? 'Good' : 'Poor'}
            </div>
          </div>
          <div className="mt-auto">
            <h2 className={`text-2xl font-bold ${rfColor}`}>
              {metrics.recoveryFactor.toFixed(2)}
            </h2>
            <div className="text-xs text-muted-foreground mt-1">
              Net Profit / Max Drawdown
            </div>
          </div>
        </div>
      </div>

      {/* Expected Payoff Card */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex flex-col h-full border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-background/80 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Expected Payoff</h3>
            </div>
          </div>
          <div className="mt-auto">
            <h2 className="text-2xl font-bold text-primary">
              ${metrics.expectedPayoff.toFixed(2)}
            </h2>
            <div className="text-xs text-muted-foreground mt-1">
              Average profit per trade
            </div>
          </div>
        </div>
      </div>

      {/* Avg Trade Duration Card */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex flex-col h-full border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-background/80 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Avg Duration</h3>
            </div>
          </div>
          <div className="mt-auto">
            <h2 className="text-2xl font-bold text-primary">
              {metrics.tradeDuration !== "N/A" ? metrics.tradeDuration : "N/A"}
            </h2>
            <div className="text-xs text-muted-foreground mt-1">
              Average time in market
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiCards;
