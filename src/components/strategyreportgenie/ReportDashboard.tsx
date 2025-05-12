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
import SymbolMetrics from './SymbolMetrics';

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

  // Define tabs for the dashboard
  const dashboardTabs = [
    {
      id: 'summary',
      label: 'Summary',
      icon: <BarChart2 className="h-4 w-4" />,
      content: <ExecutiveSummary trades={trades} />
    },
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart2 className="h-4 w-4" />,
      content: <EquityChartView trades={trades} />
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <CircleDollarSign className="h-4 w-4" />,
      content: <StrategyOverview trades={trades} />
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
      content: <CsvViewer trades={trades} />
    }
  ];

  // Remove any references to SymbolMetrics/Instruments tab
  // No need to filter since we already removed it from the array above

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
