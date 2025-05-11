import * as React from 'react';
const { useState, useEffect, useMemo } = React;
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
import DashboardHeader from './DashboardHeader';
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
import { calculateMetrics } from '@/utils/metricsCalculator';

interface ReportDashboardProps {
  files: FileType[];
  onClearFiles: () => void;
  onGeneratePDF: () => void;
  onMonteCarloSimulation: () => void;
  onOptimizeStrategy: () => void;
}

const ReportDashboard = React.forwardRef<HTMLDivElement, ReportDashboardProps>(({ 
  files, 
  onClearFiles, 
  onGeneratePDF, 
  onMonteCarloSimulation, 
  onOptimizeStrategy 
}, ref) => {
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
  
  // Reset calculated trades when active file changes
  useEffect(() => {
    setCalculatedTrades([]);
  }, [activeFileId]);
  
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
  
  // Calculate metrics based on trades using the extracted utility
  const metrics = useMemo(() => {
    return calculateMetrics(trades);
  }, [trades]);
  
  // Generate HTML report for export
  const handleHtmlExport = () => {
    if (!activeFile || !trades.length) {
      toast({
        title: "No data to export",
        description: "Please upload trading data before trying to export a report.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const reportTitle = activeFile.name;
      const reportHtml = generateHtmlReport(activeFile.parsedData, reportTitle);
      const fileName = `${activeFile.name.replace(/\.[^/.]+$/, "")}_report.html`;
      downloadHtmlReport(reportHtml, fileName);
      
      toast({
        title: "Report exported",
        description: "HTML report has been generated and downloaded successfully."
      });
    } catch (error) {
      console.error("Error generating HTML report:", error);
      toast({
        title: "Export error",
        description: "There was an error generating the HTML report.",
        variant: "destructive"
      });
    }
  };
  
  // Generate PDF report
  const handleGeneratePDF = async () => {
    if (!activeFile) return;
    
    try {
      await exportToPdf("strategy-report-container", `${activeFile.name.replace(/\.[^/.]+$/, "")}_report.pdf`, activeFile.name);
      
      toast({
        title: "PDF export started",
        description: "Your PDF is being generated and will download shortly."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF generation failed",
        description: "There was an error generating the PDF report.",
        variant: "destructive"
      });
    }
  };
  
  // Open Monte Carlo simulation
  const handleMonteCarloSimulation = () => {
    setIsMonteCarloOpen(true);
    if (onMonteCarloSimulation) onMonteCarloSimulation();
  };
  
  if (!files.length) return null;
  
  return (
    <div id="strategy-report-container" className="flex flex-col space-y-4 pb-20" ref={ref}>
      {/* File selection and controls - extracted to DashboardHeader component */}
      <DashboardHeader 
        files={files}
        activeFileId={activeFileId}
        initialCapital={initialCapital}
        onFileChange={setActiveFileId}
        onCapitalChange={setInitialCapital}
        onRecalculate={recalculateTrades}
        onClearFiles={onClearFiles}
        onGeneratePDF={handleGeneratePDF}
        onHtmlExport={handleHtmlExport}
        onOptimizeStrategy={onOptimizeStrategy}
      />
    
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
              
              <MonthlyReturns trades={trades} />
            </div>
          </TabsContent>
          
          {/* Risk Analysis Tab */}
          <TabsContent value="risk" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <DrawdownAnalysis trades={trades} />
              <RiskMetrics trades={trades} />
            </div>
          </TabsContent>
          
          {/* Distribution Tab */}
          <TabsContent value="distribution" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <TradeDistribution trades={trades} />
            </div>
          </TabsContent>
          
          {/* Instruments Tab */}
          <TabsContent value="instruments" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <SymbolMetrics trades={trades} />
            </div>
          </TabsContent>
          
          {/* Timing Tab */}
          <TabsContent value="timing" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <PerformanceHeatmap trades={trades} />
            </div>
          </TabsContent>
          
          {/* Correlation Tab */}
          <TabsContent value="correlation" className="mt-0 p-3">
            <div className="flex flex-col gap-6">
              <CorrelationAnalysis trades={trades} />
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
      
      {/* Monte Carlo Simulation Modal - conditionally rendered when open */}
      {isMonteCarloOpen && (
        <MonteCarloSimulation 
          trades={trades} 
          isOpen={isMonteCarloOpen} 
          onClose={() => setIsMonteCarloOpen(false)} 
          initialCapital={parseFloat(initialCapital.replace(/,/g, ''))}
        />
      )}
    </div>
  );
});

export default ReportDashboard; 