
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileType, TradeType, StrategyTrade } from '@/types/strategyreportgenie';
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
import { calculateMetrics } from '@/utils/metricsCalculator';

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
  
  // Calculate metrics using the metricsCalculator utility
  const metrics = calculateMetrics(trades);
  
  // Calculate start and end dates from trades
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
  
  // Generate equity curve data from trades
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
  
  // Convert between trade type formats
  const strategyTradeToTradeType = (strategyTrade: StrategyTrade): TradeType => {
    return {
      openTime: strategyTrade.openTime,
      order: strategyTrade.order || 0,
      symbol: strategyTrade.symbol,
      type: strategyTrade.type || '',
      volume: strategyTrade.volumeLots || 0,
      price: strategyTrade.priceOpen || 0,
      stopLoss: strategyTrade.stopLoss,
      takeProfit: strategyTrade.takeProfit,
      closeTime: strategyTrade.timeFlag || new Date(),
      state: strategyTrade.state || '',
      comment: strategyTrade.comment || '',
      profit: strategyTrade.profit || 0,
      swap: strategyTrade.swap || 0,
      commission: strategyTrade.commission || 0,
      duration: ''  // Calculate or provide a default value
    };
  };

  const tradeTypesArray = trades.map(strategyTradeToTradeType);

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
