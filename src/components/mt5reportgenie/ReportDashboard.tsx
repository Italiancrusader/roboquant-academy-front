import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileType } from '@/types/mt5reportgenie';
import { 
  CircleDollarSign, 
  BarChart2, 
  TrendingDown, 
  Layers, 
  Calendar, 
  FileText, 
  Trash2, 
  Download, 
  Circle,
  ChartBar,
  Target,
  Calculator,
  Globe
} from 'lucide-react';

import KpiCards from './KpiCards';
import EquityChart from './EquityChart';
import RiskMetrics from './RiskMetrics';
import MonthlyReturns from './MonthlyReturns';
import SymbolMetrics from './SymbolMetrics';
import CsvViewer from './CsvViewer';
import TradeDistribution from './TradeDistribution';
import PerformanceHeatmap from './PerformanceHeatmap';
import DrawdownAnalysis from './DrawdownAnalysis';
import CorrelationAnalysis from './CorrelationAnalysis';

interface ReportDashboardProps {
  files: FileType[];
  onClearFiles: () => void;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ files, onClearFiles }) => {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id);
  
  const activeFile = files.find(file => file.id === activeFileId);
  const trades = activeFile?.parsedData?.trades || [];
  
  const metrics = React.useMemo(() => {
    if (!trades.length) {
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
        tradesTotal: 0,
        winRate: 0,
        avgTradeProfit: 0,
        recoveryFactor: 0,
        tradeDuration: "0h 0m",
        initialBalance: 0,
        finalBalance: 0,
      };
    }
    
    let initialBalance = 0;
    let finalBalance = 0;
    
    for (let i = 0; i < trades.length; i++) {
      if (trades[i].balance !== undefined) {
        initialBalance = trades[i].balance;
        break;
      }
    }
    
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].balance !== undefined) {
        finalBalance = trades[i].balance;
        break;
      }
    }
    
    const totalNetProfit = finalBalance - initialBalance;
    
    const filteredTrades = trades.filter(trade => !(trade.type === 'balance' || trade.type === ''));
    
    const completedTrades = filteredTrades.filter(t => t.profit !== undefined && t.direction === 'out');
    
    const profitableTrades = completedTrades.filter(t => t.profit && t.profit > 0);
    const lossTrades = completedTrades.filter(t => t.profit && t.profit < 0);
    
    const grossProfit = profitableTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
    
    const winRate = completedTrades.length ? (profitableTrades.length / completedTrades.length) * 100 : 0;
    const profitFactor = grossLoss ? grossProfit / grossLoss : 0;
    const avgTradeProfit = completedTrades.length ? completedTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / completedTrades.length : 0;
    
    let peak = initialBalance;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    let balance = initialBalance;
    
    trades.forEach(trade => {
      if (trade.balance !== undefined) {
        balance = trade.balance;
        if (balance > peak) {
          peak = balance;
          currentDrawdown = 0;
        } else {
          currentDrawdown = peak - balance;
          if (currentDrawdown > maxDrawdown) {
            maxDrawdown = currentDrawdown;
          }
        }
      }
    });
    
    const relativeDrawdown = peak ? (maxDrawdown / peak) * 100 : 0;
    const recoveryFactor = maxDrawdown > 0 ? totalNetProfit / maxDrawdown : 0;
    
    const returns = [];
    let prevBalance = null;
    
    trades.forEach(trade => {
      if (trade.balance && prevBalance !== null && trade.type !== 'balance' && trade.type !== '') {
        returns.push((trade.balance - prevBalance) / prevBalance);
        prevBalance = trade.balance;
      } else if (trade.balance) {
        prevBalance = trade.balance;
      }
    });
    
    const returnsMean = returns.reduce((sum, r) => sum + r, 0) / (returns.length || 1);
    const returnsStdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - returnsMean, 2), 0) / (returns.length || 1)
    );
    
    const sharpeRatio = returnsStdDev > 0 ? returnsMean / returnsStdDev * Math.sqrt(252) : 0;
    
    return {
      totalNetProfit,
      grossProfit,
      grossLoss,
      profitFactor,
      expectedPayoff: avgTradeProfit,
      absoluteDrawdown: maxDrawdown,
      maxDrawdown,
      relativeDrawdown,
      sharpeRatio,
      tradesTotal: completedTrades.length,
      winRate,
      avgTradeProfit,
      recoveryFactor,
      tradeDuration: "N/A",
      initialBalance,
      finalBalance,
    };
  }, [trades]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="space-y-2 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Strategy Analysis</h2>
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <Badge 
                key={file.id}
                variant={file.id === activeFileId ? "default" : "outline"} 
                className="cursor-pointer py-1.5 px-3"
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
          Clear All
        </Button>
      </div>
      
      <KpiCards metrics={metrics} />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 max-w-full overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <ChartBar className="h-4 w-4 mr-2" /> Performance
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center">
            <TrendingDown className="h-4 w-4 mr-2" /> Risk
          </TabsTrigger>
          <TabsTrigger value="instruments" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" /> Instruments
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center">
            <Layers className="h-4 w-4 mr-2" /> Distribution
          </TabsTrigger>
          <TabsTrigger value="correlation" className="flex items-center">
            <Target className="h-4 w-4 mr-2" /> Correlation
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" /> Raw Data
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-4">
          <TabsContent value="overview" className="my-2">
            <Card className="p-6 overflow-hidden">
              <EquityChart trades={trades} />
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="my-2">
            <Card className="p-6">
              <MonthlyReturns trades={trades} />
            </Card>
          </TabsContent>
          
          <TabsContent value="risk" className="my-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-6">
                <RiskMetrics trades={trades} />
              </Card>
              <Card className="p-6">
                <DrawdownAnalysis trades={trades} />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="instruments" className="my-2">
            <Card className="p-6">
              <SymbolMetrics trades={trades} />
            </Card>
          </TabsContent>
          
          <TabsContent value="distribution" className="my-2">
            <Card className="p-6">
              <TradeDistribution trades={trades} />
            </Card>
          </TabsContent>
          
          <TabsContent value="correlation" className="my-2">
            <Card className="p-6">
              <CorrelationAnalysis trades={trades} />
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="my-2">
            <Card className="p-6">
              <PerformanceHeatmap trades={trades} />
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="my-2">
            <CsvViewer 
              csvUrl={activeFile?.parsedData?.csvUrl || null}
              fileName={activeFile?.name || 'report'}
              parsedData={activeFile?.parsedData}
            />
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="flex justify-end space-x-3 pt-4 mt-6">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export PDF Report
        </Button>
        <Button variant="outline">
          <Calculator className="h-4 w-4 mr-2" />
          Monte Carlo Simulation
        </Button>
        <Button>
          <CircleDollarSign className="h-4 w-4 mr-2" />
          Optimize Strategy
        </Button>
      </div>
    </div>
  );
};

export default ReportDashboard;
