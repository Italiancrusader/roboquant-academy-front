
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileType } from '@/types/strategyreportgenie';
import { 
  CircleDollarSign, 
  BarChart2, 
  TrendingDown, 
  Clock, 
  FileText, 
  Trash2, 
  Download, 
  Circle
} from 'lucide-react';

import TabView from '@/components/ui/tab-view';
import EquityChartView from './EnhancedEquityChart';
import StrategyOverview from './StrategyOverview';
import DrawdownAnalysis from './DrawdownAnalysis';
import MonthlyReturns from './MonthlyReturns';
import CsvViewer from './CsvViewer';
import RiskMetrics from '../strategyreportgenie/RiskMetrics';
import TradeDistributionAnalysis from './TradeDistributionAnalysis';
import ExecutiveSummary from './ExecutiveSummary';

interface ReportDashboardProps {
  files: FileType[];
  onClearFiles: () => void;
  onGeneratePDF: () => void;
  onMonteCarloSimulation: () => void;
  onOptimizeStrategy: () => void;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ 
  files, 
  onClearFiles, 
  onGeneratePDF, 
  onMonteCarloSimulation, 
  onOptimizeStrategy 
}) => {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id);
  
  const activeFile = files.find(file => file.id === activeFileId);
  const trades = activeFile?.parsedData?.trades || [];
  
  // Calculate metrics for components that need them
  const calculateStartAndEndDates = () => {
    if (!trades || trades.length === 0) return { startDate: new Date(), endDate: new Date() };
    
    const validDates = trades
      .map(trade => trade.openTime)
      .filter(date => date instanceof Date && !isNaN(date.getTime()));
    
    if (validDates.length === 0) return { startDate: new Date(), endDate: new Date() };
    
    return {
      startDate: new Date(Math.min(...validDates.map(d => d.getTime()))),
      endDate: new Date(Math.max(...validDates.map(d => d.getTime())))
    };
  };
  
  const generateEquityCurveData = () => {
    if (!trades || trades.length === 0) return [];
    
    let equity = 0;
    const equityCurve = [];
    
    // Sort trades by date
    const sortedTrades = [...trades]
      .filter(trade => trade.openTime instanceof Date && !isNaN(trade.openTime.getTime()))
      .sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
    
    for (const trade of sortedTrades) {
      if (trade.profit !== undefined) {
        equity += trade.profit;
        equityCurve.push({
          date: trade.openTime,
          equity: equity,
          drawdown: 0 // Simplified for this example
        });
      }
    }
    
    return equityCurve;
  };
  
  const { startDate, endDate } = calculateStartAndEndDates();
  const equityCurve = generateEquityCurveData();
  
  // Simplified metrics calculation for components
  const getBasicMetrics = () => {
    if (!trades || trades.length === 0) {
      return {
        totalNetProfit: 0,
        grossProfit: 0,
        grossLoss: 0,
        profitFactor: 0,
        expectedPayoff: 0,
        absoluteDrawdown: 0,
        maxDrawdown: 0,
        relativeDrawdown: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        calmarRatio: 0,
        tradesTotal: 0,
        tradesShort: 0,
        tradesLong: 0,
        winRate: 0,
        avgTradeProfit: 0,
        avgWinning: 0,
        avgLosing: 0,
        largestWin: 0,
        largestLoss: 0,
        recoveryFactor: 0,
        tradeDuration: '0d 0h',
        commissionTotal: 0,
        swapTotal: 0,
        returnMean: 0,
        returnMedian: 0,
        returnSkew: 0,
        returnKurtosis: 0,
        tailRatio: 0,
        mcDrawdownExpected95: 0,
        mcProfitablePct: 0,
        mcRuinProbability: 0,
        initialBalance: 10000, // Default value
        expectancy: 0
      };
    }
    
    const completedTrades = trades.filter(t => t.profit !== undefined);
    const profitableTrades = completedTrades.filter(t => (t.profit || 0) > 0);
    const lossTrades = completedTrades.filter(t => (t.profit || 0) < 0);
    
    const totalProfit = completedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossProfit = profitableTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
    
    return {
      totalNetProfit: totalProfit,
      grossProfit: grossProfit,
      grossLoss: grossLoss,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : 0,
      expectedPayoff: completedTrades.length > 0 ? totalProfit / completedTrades.length : 0,
      absoluteDrawdown: 0, // Simplified
      maxDrawdown: 0, // Simplified
      relativeDrawdown: 0, // Simplified
      sharpeRatio: 0, // Simplified
      sortinoRatio: 0, // Simplified
      calmarRatio: 0, // Simplified
      tradesTotal: completedTrades.length,
      tradesShort: 0, // Simplified
      tradesLong: 0, // Simplified
      winRate: completedTrades.length > 0 ? (profitableTrades.length / completedTrades.length) * 100 : 0,
      avgTradeProfit: completedTrades.length > 0 ? totalProfit / completedTrades.length : 0,
      avgWinning: profitableTrades.length > 0 ? grossProfit / profitableTrades.length : 0,
      avgLosing: lossTrades.length > 0 ? -grossLoss / lossTrades.length : 0,
      largestWin: profitableTrades.length > 0 ? Math.max(...profitableTrades.map(t => t.profit || 0)) : 0,
      largestLoss: lossTrades.length > 0 ? Math.min(...lossTrades.map(t => t.profit || 0)) : 0,
      recoveryFactor: 0, // Simplified
      tradeDuration: '0d 0h', // Simplified
      commissionTotal: 0, // Simplified
      swapTotal: 0, // Simplified
      returnMean: 0, // Simplified
      returnMedian: 0, // Simplified
      returnSkew: 0, // Simplified
      returnKurtosis: 0, // Simplified
      tailRatio: 0, // Simplified
      mcDrawdownExpected95: 0, // Simplified
      mcProfitablePct: 0, // Simplified
      mcRuinProbability: 0, // Simplified
      initialBalance: 10000, // Default value
      expectancy: 0 // Simplified
    };
  };
  
  const metrics = getBasicMetrics();

  // Define tabs for the dashboard
  const dashboardTabs = [
    {
      id: 'summary',
      label: 'Summary',
      icon: <BarChart2 className="h-4 w-4" />,
      content: <ExecutiveSummary metrics={metrics} initialBalance={metrics.initialBalance} />
    },
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart2 className="h-4 w-4" />,
      content: <EquityChartView equityCurve={equityCurve} />
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <CircleDollarSign className="h-4 w-4" />,
      content: <StrategyOverview metrics={metrics} startDate={startDate} endDate={endDate} />
    },
    {
      id: 'risk',
      label: 'Risk',
      icon: <TrendingDown className="h-4 w-4" />,
      content: <RiskMetrics trades={trades} />
    },
    {
      id: 'distribution',
      label: 'Distribution',
      icon: <BarChart2 className="h-4 w-4" />,
      content: <TradeDistributionAnalysis trades={trades} />
    },
    {
      id: 'time',
      label: 'Calendar',
      icon: <Clock className="h-4 w-4" />,
      content: <MonthlyReturns trades={trades} />
    },
    {
      id: 'data',
      label: 'Raw Data',
      icon: <FileText className="h-4 w-4" />,
      content: <CsvViewer 
        csvUrl={activeFile?.parsedData?.csvUrl || null} 
        fileName={activeFile?.name || 'report'} 
        parsedData={activeFile?.parsedData}
      />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Trading Performance Analysis</h2>
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <Badge 
                key={file.id}
                variant={file.id === activeFileId ? "default" : "outline"} 
                className="cursor-pointer py-1.5"
                onClick={() => setActiveFileId(file.id)}
              >
                <Circle className={`h-2 w-2 mr-1 ${file.id === activeFileId ? "text-primary-foreground" : "text-muted-foreground"}`} />
                {file.name}
              </Badge>
            ))}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClearFiles}
          className="flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear Files
        </Button>
      </div>
      
      {/* Main content with tabs */}
      <div className="space-y-6">
        <TabView tabs={dashboardTabs} />
      </div>
      
      <div className="flex flex-wrap gap-3 justify-end pt-4 mt-8 border-t">
        <Button variant="outline" onClick={onGeneratePDF} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={onMonteCarloSimulation} className="flex items-center">
          <BarChart2 className="h-4 w-4 mr-2" />
          Monte Carlo
        </Button>
        <Button onClick={onOptimizeStrategy} className="flex items-center">
          <CircleDollarSign className="h-4 w-4 mr-2" />
          Optimize
        </Button>
      </div>
    </div>
  );
};

export default ReportDashboard;
