import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalculatedMetrics } from '@/utils/metricsCalculator';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  Activity,
  Zap,
  Award,
  ShoppingBag,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface ExecutiveSummaryProps {
  metrics: CalculatedMetrics;
  initialBalance: number;
  currency?: string;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  metrics,
  initialBalance,
  currency = '$'
}) => {
  // Calculate return percentage
  const returnPercentage = initialBalance ? (metrics.totalNetProfit / initialBalance) * 100 : 0;

  // Format a number with commas and fixed precision
  const formatNumber = (num: number, precision: number = 2): string => {
    return num.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {/* Net Profit */}
        <Card className="shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Net Profit</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {currency}{formatNumber(metrics.totalNetProfit)}
                </h3>
                <p className={`text-sm mt-1 flex items-center font-semibold ${metrics.totalNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.totalNetProfit >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {returnPercentage.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${metrics.totalNetProfit >= 0 ? 'bg-green-800/40' : 'bg-red-800/40'}`}>
                {metrics.totalNetProfit >= 0 ? 
                  <TrendingUp className="w-5 h-5 text-green-400" /> : 
                  <TrendingDown className="w-5 h-5 text-red-400" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CAGR */}
        <Card className="shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-300">CAGR</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {formatNumber(metrics.cagr || 0)}%
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Compound Annual Growth Rate
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-800/40">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Factor */}
        <Card className="shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-300">Profit Factor</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {formatNumber(metrics.profitFactor)}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Gross Profit / Gross Loss
                </p>
              </div>
              <div className="p-3 rounded-full bg-indigo-800/40">
                <DollarSign className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Max Drawdown */}
        <Card className="shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-300">Max Drawdown</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {currency}{formatNumber(metrics.maxDrawdown)}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {formatNumber(metrics.relativeDrawdown)}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-800/40">
                <TrendingDown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sharpe Ratio */}
        <Card className="shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-300">Sharpe Ratio</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {formatNumber(metrics.sharpeRatio)}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Risk-Adjusted Return
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-800/40">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-300">Win Rate</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {formatNumber(metrics.winRate)}%
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {metrics.tradesTotal} Total Trades
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-800/40">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Trade */}
        <Card className="shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-300">Average Trade</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {currency}{formatNumber(metrics.avgTradeProfit)}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Win: {currency}{formatNumber(metrics.avgWinning)} | Loss: {currency}{formatNumber(Math.abs(metrics.avgLosing))}
                </p>
              </div>
              <div className="p-3 rounded-full bg-teal-800/40">
                <ShoppingBag className="w-5 h-5 text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expectancy */}
        <Card className="shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-300">Expectancy</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {currency}{formatNumber(metrics.expectancy || 0)}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Expected Value per Trade
                </p>
              </div>
              <div className="p-3 rounded-full bg-rose-800/40">
                <PieChart className="w-5 h-5 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Passport */}
      <Card className="shadow-md transition-all">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-2 text-white">Strategy Passport</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-300">Initial Balance</p>
              <p className="font-medium text-white">{currency}{formatNumber(metrics.initialBalance)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-300">Trading Period</p>
              <p className="font-medium text-white">{metrics.tradeDuration}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-300">Long/Short Ratio</p>
              <p className="font-medium text-white">{metrics.tradesLong}/{metrics.tradesShort}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-300">Sortino Ratio</p>
              <p className="font-medium text-white">{formatNumber(metrics.sortinoRatio)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveSummary; 