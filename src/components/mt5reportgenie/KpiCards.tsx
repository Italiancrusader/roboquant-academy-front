
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
  };
}

const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const kpiData = [
    {
      title: 'Net Profit',
      value: `$${metrics.totalNetProfit.toLocaleString()}`,
      icon: TrendingUp,
      iconColor: 'text-green-500',
      tooltip: 'The total profit or loss of all completed trades'
    },
    {
      title: 'Profit Factor',
      value: metrics.profitFactor.toFixed(2),
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
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: Percent,
      iconColor: 'text-yellow-500',
      tooltip: 'Percentage of trades that were profitable'
    },
    {
      title: 'Avg Trade',
      value: `$${metrics.avgTradeProfit.toFixed(2)}`,
      icon: Calculator,
      iconColor: 'text-purple-500',
      tooltip: 'Average profit/loss per trade'
    },
    {
      title: 'Max Drawdown',
      value: `${metrics.relativeDrawdown.toFixed(1)}%`,
      icon: TrendingDown,
      iconColor: 'text-red-500',
      tooltip: 'Maximum peak-to-valley drop in equity expressed as a percentage'
    },
    {
      title: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2),
      icon: Award,
      iconColor: 'text-amber-500',
      tooltip: 'Risk-adjusted return (higher is better)'
    },
    {
      title: 'Recovery Factor',
      value: metrics.recoveryFactor.toFixed(2),
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      tooltip: 'Net profit divided by maximum drawdown'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title} className="bg-card hover:bg-muted/80 transition-colors">
          <CardContent className="flex items-center p-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${kpi.iconColor} bg-muted/30`}>
              <kpi.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 cursor-help">
                      <HelpCircle className="h-3 w-3 text-muted-foreground/70" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{kpi.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xl font-bold mt-1">{kpi.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KpiCards;
