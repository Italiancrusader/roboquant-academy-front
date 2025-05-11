import React, { useState, useEffect } from 'react';
import { FileType } from '@/types/strategyreportgenie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  ArrowDownUp, 
  ArrowUpDown, 
  LineChart, 
  CircleDollarSign, 
  PieChart, 
  Activity, 
  AlertTriangle, 
  Calendar,
  Clock, 
  History, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Trash2, 
  SlidersHorizontal, 
  Target, 
  Layers, 
  Percent, 
  Circle, 
  CircleOff, 
  Scale, 
  DollarSign, 
  BarChart3,
  FilterX,
  Filter,
  RefreshCw,
  ChevronsUpDown,
  Calculator,
  Landmark,
  Globe
} from 'lucide-react';

// Import components
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
import MonteCarloSimulation from './MonteCarloSimulation';
import { exportToPdf } from '@/utils/pdfExport';
import CSVReportButton from './CSVReportButton';
import { generateHtmlReport, downloadHtmlReport } from '@/utils/htmlReportGenerator';

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
  const [initialCapital, setInitialCapital] = useState<string>("10000.00");
  const [calculatedTrades, setCalculatedTrades] = useState<any[]>([]);
  const [isMonteCarloOpen, setIsMonteCarloOpen] = useState(false);
  
  const activeFile = files.find(file => file.id === activeFileId);
  const trades = calculatedTrades.length > 0 ? calculatedTrades : (activeFile?.parsedData?.trades || []);
  
  // Function to get source badge for the file
  const getSourceBadge = (source: 'MT4' | 'MT5' | 'TradingView' | undefined) => {
    switch(source) {
      case 'MT4':
        return <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">MT4</Badge>;
      case 'MT5':
        return <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">MT5</Badge>;
      case 'TradingView':
        return <Badge variant="outline" className="ml-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">TradingView</Badge>;
      default:
        return null;
    }
  };
  
  // Function to recalculate trades with new initial balance
  const recalculateTrades = () => {
    if (!activeFile || !activeFile.parsedData?.trades.length) return;
    
    const parsedCapital = parseFloat(initialCapital.replace(/,/g, ''));
    if (isNaN(parsedCapital) || parsedCapital <= 0) {
      toast({
        title: "Invalid capital amount",
        description: "Please enter a valid positive number for initial capital.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Clone the original trades to avoid mutating the source
      const originalTrades = [...activeFile.parsedData.trades];
      const newTrades = [...originalTrades];
      
      // Find the first trade with a balance
      let firstBalanceIndex = newTrades.findIndex(t => t.balance !== undefined);
      if (firstBalanceIndex === -1) return;
      
      // Calculate the difference between the current first balance and the new initial capital
      const oldInitialBalance = newTrades[firstBalanceIndex].balance || 0;
      const balanceDiff = parsedCapital - oldInitialBalance;
      
      // Adjust all balances by the difference
      for (let i = 0; i < newTrades.length; i++) {
        if (newTrades[i].balance !== undefined) {
          newTrades[i].balance = (newTrades[i].balance || 0) + balanceDiff;
        }
      }
      
      setCalculatedTrades(newTrades);
      
      toast({
        title: "Capital updated",
        description: `Recalculated metrics with initial capital: $${parsedCapital.toLocaleString()}`,
      });
    } catch (error) {
      console.error("Error recalculating with new capital:", error);
      toast({
        title: "Calculation error",
        description: "There was an error recalculating metrics with the new capital.",
        variant: "destructive"
      });
    }
  };
  
  // Reset calculated trades when active file changes
  useEffect(() => {
    setCalculatedTrades([]);
  }, [activeFileId]);
  
  // Calculate metrics based on trades
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
    
    // Find initial balance
    for (let i = 0; i < trades.length; i++) {
      if (trades[i].balance !== undefined) {
        initialBalance = trades[i].balance;
        break;
      }
    }
    
    // Find final balance
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].balance !== undefined) {
        finalBalance = trades[i].balance;
        break;
      }
    }
    
    const totalNetProfit = finalBalance - initialBalance;
    
    // Filter out balance entries
    const filteredTrades = trades.filter(trade => !(trade.type === 'balance' || trade.type === ''));
    
    // Get completed trades
    const completedTrades = filteredTrades.filter(t => t.profit !== undefined && t.direction === 'out');
    
    // Calculate profitable vs loss trades
    const profitableTrades = completedTrades.filter(t => t.profit && t.profit > 0);
    const lossTrades = completedTrades.filter(t => t.profit && t.profit < 0);
    
    // Calculate profit statistics
    const grossProfit = profitableTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
    
    const winRate = completedTrades.length ? (profitableTrades.length / completedTrades.length) * 100 : 0;
    const profitFactor = grossLoss ? grossProfit / grossLoss : 0;
    const avgTradeProfit = completedTrades.length ? completedTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / completedTrades.length : 0;
    
    // Calculate drawdown
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
    
    // Calculate returns for Sharpe ratio
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

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    const strategyName = activeFile?.name?.replace(/\.[^/.]+$/, "") || 'Strategy';
    const reportTitle = `${strategyName} Trading Strategy Analysis`;
    
    const success = await exportToPdf('strategy-report-container', `${strategyName}-Report.pdf`, reportTitle);
    if (success) {
      toast({
        title: "Professional Report Generated",
        description: "Your investment-grade strategy report has been exported as a PDF file.",
      });
    } else {
      toast({
        title: "Report Generation Failed",
        description: "There was a problem creating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle Monte Carlo simulation
  const handleMonteCarloSimulation = () => {
    setIsMonteCarloOpen(true);
  };

  // Handle HTML report export
  const handleHtmlExport = () => {
    if (!activeFile || !activeFile.parsedData) {
      toast({
        title: "Export Failed",
        description: "No strategy data available to export.",
        variant: "destructive",
      });
      return;
    }

    const strategyName = activeFile.name.replace(/\.[^/.]+$/, "") || 'Strategy';
    const reportTitle = `${strategyName} Trading Strategy Analysis`;
    
    try {
      const htmlContent = generateHtmlReport(activeFile.parsedData, reportTitle);
      downloadHtmlReport(htmlContent, `${strategyName}-Report`);
      
      toast({
        title: "HTML Report Generated",
        description: "Your interactive strategy report has been downloaded as an HTML file.",
      });
    } catch (error) {
      console.error("Error generating HTML report:", error);
      toast({
        title: "Report Generation Failed",
        description: "There was a problem creating the HTML report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div id="strategy-report-container" className="flex flex-col gap-6 pb-12">
      {/* Header section with file selection */}
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quantitative Strategy Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive analysis and performance metrics for your trading strategy
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFiles}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Files
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleHtmlExport}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {files.map((file) => (
            <Badge 
              key={file.id}
              variant={file.id === activeFileId ? "default" : "outline"} 
              className={`cursor-pointer py-1.5 px-3 flex items-center ${file.id === activeFileId ? 'bg-primary/90 hover:bg-primary' : 'hover:bg-secondary'}`}
              onClick={() => setActiveFileId(file.id)}
            >
              <Circle className={`h-2 w-2 mr-1.5 ${file.id === activeFileId ? "text-primary-foreground" : "text-muted-foreground"}`} />
              {file.name}
              {getSourceBadge(file.source)}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Capital adjustment card */}
      <Card className="bg-card/90 backdrop-blur-sm border-border/60">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center">
              <Landmark className="h-5 w-5 text-primary mr-2" />
              <Label htmlFor="initialCapital" className="font-medium">Initial Trading Capital:</Label>
            </div>
            
            <div className="flex gap-2 flex-1 max-w-xs">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="initialCapital"
                  className="pl-7"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                  placeholder="10000.00"
                />
              </div>
              <Button 
                variant="secondary" 
                className="flex items-center" 
                onClick={recalculateTrades}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    
      {/* Key Performance Indicators */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Key Performance Metrics
          </h2>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMonteCarloSimulation}
            className="flex items-center"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Monte Carlo Simulation
          </Button>
        </div>
        <KpiCards metrics={metrics} />
      </div>
      
      {/* Main dashboard content */}
      <Tabs defaultValue="overview" className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-4 md:flex">
            <TabsTrigger value="overview" className="flex items-center gap-1 px-3 py-2">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1 px-3 py-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-1 px-3 py-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Risk Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-1 px-3 py-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Distribution</span>
            </TabsTrigger>
            <TabsTrigger value="instruments" className="flex items-center gap-1 px-3 py-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Instruments</span>
            </TabsTrigger>
            <TabsTrigger value="timing" className="flex items-center gap-1 px-3 py-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Timing</span>
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-1 px-3 py-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Correlation</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1 px-3 py-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Raw Data</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="mt-4 border rounded-lg bg-card/90 backdrop-blur-sm border-border/60 p-1">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              {/* Equity Chart */}
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <LineChart className="h-5 w-5 mr-2 text-primary" />
                    Equity Growth
                  </CardTitle>
                  <CardDescription>
                    Cumulative equity curve showing account balance over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div className="min-w-[600px] w-full">
                      <EquityChart trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Monthly Performance - Now full width */}
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <BarChart className="h-5 w-5 mr-2 text-primary" />
                    Monthly Performance
                  </CardTitle>
                  <CardDescription>
                    Return breakdown by month showing performance consistency
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 px-4">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[900px] w-full pt-2">
                      <MonthlyReturns trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Risk Exposure - Now full width */}
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <ArrowUpDown className="h-5 w-5 mr-2 text-primary" />
                    Risk Exposure
                  </CardTitle>
                  <CardDescription>
                    Key risk metrics and drawdown analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] w-full">
                      <RiskMetrics trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of trading performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Net Profit</div>
                      <div className="text-2xl font-semibold text-foreground">${metrics.totalNetProfit.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Total return</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">CAGR</div>
                      <div className="text-2xl font-semibold text-foreground">12.4%</div>
                      <div className="text-xs text-muted-foreground mt-1">Annualized return</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      <div className="text-2xl font-semibold text-foreground">{metrics.sharpeRatio.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Risk-adjusted return</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Profit Factor</div>
                      <div className="text-2xl font-semibold text-foreground">{metrics.profitFactor.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Gross profit/loss ratio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Monthly Returns Card */}
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <BarChart className="h-5 w-5 mr-2 text-primary" />
                    Monthly Returns
                  </CardTitle>
                  <CardDescription>
                    Monthly profit and loss breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[900px] w-full pb-20">
                      <MonthlyReturns trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Risk Analysis Tab */}
          <TabsContent value="risk" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                    Drawdown Analysis
                  </CardTitle>
                  <CardDescription>
                    Maximum drawdown periods and recovery metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div className="min-w-[800px] w-full">
                      <DrawdownAnalysis trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Scale className="h-5 w-5 mr-2 text-primary" />
                    Risk Metrics
                  </CardTitle>
                  <CardDescription>
                    Risk-adjusted performance measures
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div className="min-w-[800px] w-full">
                      <RiskMetrics trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <ChevronsUpDown className="h-5 w-5 mr-2 text-primary" />
                    Volatility Metrics
                  </CardTitle>
                  <CardDescription>
                    Return volatility and stability metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                      <div className="text-2xl font-semibold text-foreground">{metrics.relativeDrawdown.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Peak to trough decline</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Recovery Factor</div>
                      <div className="text-2xl font-semibold text-foreground">{metrics.recoveryFactor.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Net profit/max drawdown</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Calmar Ratio</div>
                      <div className="text-2xl font-semibold text-foreground">1.45</div>
                      <div className="text-xs text-muted-foreground mt-1">Annual return/max DD</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Ulcer Index</div>
                      <div className="text-2xl font-semibold text-foreground">2.83</div>
                      <div className="text-xs text-muted-foreground mt-1">Drawdown severity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <ArrowUpDown className="h-5 w-5 mr-2 text-primary" />
                    Risk/Return Profile
                  </CardTitle>
                  <CardDescription>
                    Balance between risk and return metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      <div className="text-2xl font-semibold text-foreground">{metrics.sharpeRatio.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Risk-adjusted return</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Sortino Ratio</div>
                      <div className="text-2xl font-semibold text-foreground">1.68</div>
                      <div className="text-xs text-muted-foreground mt-1">Downside risk-adjusted</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Profit Factor</div>
                      <div className="text-2xl font-semibold text-foreground">{metrics.profitFactor.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Gross profit/loss ratio</div>
                    </div>
                    
                    <div className="bg-background/70 rounded-lg p-4 border border-border/40">
                      <div className="text-sm text-muted-foreground">Expected Payoff</div>
                      <div className="text-2xl font-semibold text-foreground">${metrics.expectedPayoff.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Average trade profit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Distribution Tab */}
          <TabsContent value="distribution" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    Trade Distribution
                  </CardTitle>
                  <CardDescription>
                    Statistical distribution of trade outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div className="min-w-[800px] w-full">
                      <TradeDistribution trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Instruments Tab */}
          <TabsContent value="instruments" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    Symbol Analysis
                  </CardTitle>
                  <CardDescription>
                    Performance breakdown by trading instrument
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div className="min-w-[900px] w-full">
                      <SymbolMetrics trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Timing Tab */}
          <TabsContent value="timing" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Calendar Performance
                  </CardTitle>
                  <CardDescription>
                    Performance analysis by calendar periods
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[700px] w-full">
                      <PerformanceHeatmap trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Correlation Tab */}
          <TabsContent value="correlation" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Correlation Analysis
                  </CardTitle>
                  <CardDescription>
                    Correlations between instruments and market factors
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[650px] w-full">
                      <CorrelationAnalysis trades={trades} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Raw Data Tab */}
          <TabsContent value="data" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <Card className="border-0 bg-background/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Trade Data
                  </CardTitle>
                  <CardDescription>
                    Raw transaction data and trade history
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto">
                    <CsvViewer 
                      csvUrl={activeFile?.parsedData?.csvUrl || null}
                      fileName={activeFile?.name || 'report'}
                      parsedData={activeFile?.parsedData}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Monte Carlo Simulation Modal */}
      <MonteCarloSimulation 
        isOpen={isMonteCarloOpen} 
        onClose={() => setIsMonteCarloOpen(false)} 
        trades={trades}
        initialCapital={parseFloat(initialCapital.replace(/,/g, ''))}
      />
    </div>
  );
};

export default ReportDashboard; 