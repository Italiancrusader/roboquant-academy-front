
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart,
  LineChart,
  Percent,
  Timer,
  Award,
  AlertTriangle,
  HelpCircle,
  Calculator
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KpiCardsProps {
  metrics: {
    totalNetProfit: number;
    grossProfit: number;
    grossLoss: number;
    profitFactor: number;
    expectedPayoff: number;
    absoluteDrawdown: number;
    maxDrawdown: number;
    relativeDrawdown: number;
    sharpeRatio: number;
    tradesTotal: number;
    winRate: number;
    avgTradeProfit: number;
    recoveryFactor: number;
    tradeDuration: string;
    initialBalance?: number;
    finalBalance?: number;
  };
}

const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  // Format number to handle possible NaN/Infinity values
  const formatNumber = (value: number, decimals: number = 2): string => {
    if (isNaN(value) || !isFinite(value)) return '0.00';
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };
  
  // Calculate net profit based on initial and final balance if available
  const netProfit = metrics.finalBalance !== undefined && metrics.initialBalance !== undefined
    ? metrics.finalBalance - metrics.initialBalance
    : metrics.totalNetProfit;
  
  const kpiData = [
    {
      title: 'Net Profit',
      value: `$${formatNumber(netProfit)}`,
      icon: TrendingUp,
      iconColor: netProfit >= 0 ? 'text-green-500' : 'text-red-500',
      tooltip: 'The difference between final balance and initial balance'
    },
    {
      title: 'Profit Factor',
      value: formatNumber(metrics.profitFactor),
      icon: BarChart,
      iconColor: 'text-blue-primary',
      tooltip: 'Ratio of gross profit to gross loss'
    },
    {
      title: 'Total Trades',
      value: metrics.tradesTotal.toLocaleString(),
      icon: LineChart,
      iconColor: 'text-teal-primary',
      tooltip: 'Total number of trades executed'
    },
    {
      title: 'Win Rate',
      value: `${formatNumber(metrics.winRate, 1)}%`,
      icon: Percent,
      iconColor: 'text-yellow-500',
      tooltip: 'Percentage of trades that were profitable'
    },
    {
      title: 'Avg Trade',
      value: `$${formatNumber(metrics.avgTradeProfit)}`,
      icon: Calculator,
      iconColor: 'text-purple-500',
      tooltip: 'Average profit/loss per trade'
    },
    {
      title: 'Max Drawdown',
      value: `${formatNumber(metrics.relativeDrawdown, 1)}%`,
      icon: TrendingDown,
      iconColor: 'text-red-500',
      tooltip: 'Maximum peak-to-valley drop in equity expressed as a percentage'
    },
    {
      title: 'Sharpe Ratio',
      value: formatNumber(metrics.sharpeRatio),
      icon: Award,
      iconColor: 'text-amber-500',
      tooltip: 'Risk-adjusted return (higher is better)'
    },
    {
      title: 'Recovery Factor',
      value: formatNumber(metrics.recoveryFactor),
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      tooltip: 'Net profit divided by maximum drawdown'
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="bg-card hover:bg-muted/80 transition-colors">
            <CardContent className="flex items-center p-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.iconColor} bg-muted/30`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="ml-4 min-w-0">
                <div className="flex items-center">
                  <p className="text-sm text-muted-foreground truncate">{kpi.title}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1 cursor-help flex-shrink-0">
                        <HelpCircle className="h-3 w-3 text-muted-foreground/70" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">{kpi.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-lg font-bold mt-1 truncate">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default KpiCards;
