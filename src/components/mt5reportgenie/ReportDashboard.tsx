
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileType } from '@/types/mt5reportgenie';
import { Circle, BarChart2, TrendingDown, Calculator, FileText, Trash2, Download } from 'lucide-react';
import KpiCards from './KpiCards';
import EquityChart from './EquityChart';
import RiskMetrics from './RiskMetrics';
import DistributionCharts from './DistributionCharts';
import CalendarView from './CalendarView';
import NarrativePanel from './NarrativePanel';
import CsvViewer from './CsvViewer';

interface ReportDashboardProps {
  files: FileType[];
  onClearFiles: () => void;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ files, onClearFiles }) => {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id);
  
  const activeFile = files.find(file => file.id === activeFileId);
  const trades = activeFile?.parsedData?.trades || [];
  
  // Calculate metrics from actual data
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
      };
    }
    
    // Filter trades with profit data
    const completedTrades = trades.filter(t => t.profit !== undefined && t.profit !== 0);
    
    // Calculate key metrics
    const profitableTrades = completedTrades.filter(t => t.profit && t.profit > 0);
    const lossTrades = completedTrades.filter(t => t.profit && t.profit < 0);
    
    const totalNetProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossProfit = profitableTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
    
    const winRate = completedTrades.length ? (profitableTrades.length / completedTrades.length) * 100 : 0;
    const profitFactor = grossLoss ? grossProfit / grossLoss : 0;
    const avgTradeProfit = completedTrades.length ? totalNetProfit / completedTrades.length : 0;
    
    // Calculate drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    let balance = trades[0]?.balance || 0;
    
    trades.forEach(trade => {
      if (trade.balance) {
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
    
    // Basic Sharpe ratio calculation (simplified)
    const returns = [];
    let prevBalance = trades[0]?.balance || 0;
    
    trades.forEach(trade => {
      if (trade.balance && prevBalance > 0) {
        returns.push((trade.balance - prevBalance) / prevBalance);
        prevBalance = trade.balance;
      }
    });
    
    const returnsMean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const returnsStdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - returnsMean, 2), 0) / returns.length
    );
    
    const sharpeRatio = returnsStdDev > 0 ? returnsMean / returnsStdDev * Math.sqrt(252) : 0; // Annualized
    
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
      tradeDuration: "N/A", // Would need times for each trade to calculate this
    };
  }, [trades]);

  const [isDebugMode, setIsDebugMode] = useState(false);

  return (
    <div className="space-y-6">
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
      
      <div className="flex items-center space-x-2 mb-4">
        <input 
          type="checkbox" 
          id="debug-mode" 
          checked={isDebugMode}
          onChange={() => setIsDebugMode(!isDebugMode)}
          className="form-checkbox h-5 w-5 text-primary"
        />
        <label htmlFor="debug-mode" className="text-sm text-muted-foreground">
          Enable Debug Mode
        </label>
      </div>

      {isDebugMode && (
        <div className="bg-secondary/20 p-6 rounded-lg border border-dashed border-primary/50 space-y-4">
          <h3 className="text-lg font-semibold text-primary">Debug Panel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Active File Info</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(activeFile, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Parsed Data</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(activeFile?.parsedData?.summary, null, 2)}
              </pre>
            </div>
          </div>
          <div>
            <Button 
              variant="outline" 
              onClick={() => console.log('Debug Active File:', activeFile)}
              className="mr-2"
            >
              Log File to Console
            </Button>
            <Button 
              variant="outline" 
              onClick={() => console.log('Parsed Data:', activeFile?.parsedData)}
            >
              Log Parsed Data to Console
            </Button>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="equity" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="equity" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" /> Equity
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center">
            <TrendingDown className="h-4 w-4 mr-2" /> Risk
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center">
            <Calculator className="h-4 w-4 mr-2" /> Distribution
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calculator className="h-4 w-4 mr-2" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="narrative" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" /> Narrative
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center">
            <Download className="h-4 w-4 mr-2" /> Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="equity">
          <Card>
            <CardContent className="p-6">
              <EquityChart trades={activeFile?.parsedData?.trades || []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="risk">
          <Card>
            <CardContent className="p-6">
              <RiskMetrics trades={activeFile?.parsedData?.trades || []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution">
          <Card>
            <CardContent className="p-6">
              <DistributionCharts trades={activeFile?.parsedData?.trades || []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <CalendarView trades={activeFile?.parsedData?.trades || []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="narrative">
          <Card>
            <CardContent className="p-6">
              <NarrativePanel />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="csv">
          <CsvViewer 
            csvUrl={activeFile?.parsedData?.csvUrl || null}
            fileName={activeFile?.name || 'report'}
            parsedData={activeFile?.parsedData}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline">
          Export PDF Report
        </Button>
        <Button variant="outline">
          Download Charts
        </Button>
        <Button>
          Compare Strategies
        </Button>
      </div>
    </div>
  );
};

export default ReportDashboard;
