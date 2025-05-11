import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileType } from '@/types/mt5reportgenie';
import { toast } from '@/components/ui/use-toast';
import { 
  CircleDollarSign, 
  BarChart2, 
  TrendingDown, 
  Clock, 
  Globe,
  FileText, 
  Trash2, 
  Download, 
  Circle,
  FileDigit
} from 'lucide-react';

import TabView from '@/components/ui/tab-view';
import EquityChartView from './EquityChartView';
import PerformanceStatsView from './PerformanceStatsView';
import SymbolsAnalysisView from './SymbolsAnalysisView';
import DrawdownView from './DrawdownView';
import TimeAnalysisView from './TimeAnalysisView';
import CsvViewer from './CsvViewer';
import { generateHtmlReport, downloadHtmlReport } from '@/utils/htmlReportGenerator';

interface ModernReportDashboardProps {
  files: FileType[];
  onClearFiles: () => void;
  onGeneratePDF: () => void;
  onMonteCarloSimulation: () => void;
  onOptimizeStrategy: () => void;
}

const ModernReportDashboard: React.FC<ModernReportDashboardProps> = ({ 
  files, 
  onClearFiles, 
  onGeneratePDF, 
  onMonteCarloSimulation, 
  onOptimizeStrategy 
}) => {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id);
  
  const activeFile = files.find(file => file.id === activeFileId);
  const trades = activeFile?.parsedData?.trades || [];

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

  // Define tabs for the dashboard
  const dashboardTabs = [
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
      content: <PerformanceStatsView trades={trades} />
    },
    {
      id: 'symbols',
      label: 'Instruments',
      icon: <Globe className="h-4 w-4" />,
      content: <SymbolsAnalysisView trades={trades} />
    },
    {
      id: 'time',
      label: 'Time',
      icon: <Clock className="h-4 w-4" />,
      content: <TimeAnalysisView trades={trades} />
    },
    {
      id: 'risk',
      label: 'Risk',
      icon: <TrendingDown className="h-4 w-4" />,
      content: <DrawdownView trades={trades} />
    },
    {
      id: 'data',
      label: 'Raw Data',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <CsvViewer 
          csvUrl={activeFile?.parsedData?.csvUrl || null}
          fileName={activeFile?.name || 'report'}
          parsedData={activeFile?.parsedData}
        />
      )
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
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-end pt-4 mt-8 border-t">
        <Button variant="outline" onClick={handleHtmlExport} className="flex items-center">
          <FileDigit className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>
    </div>
  );
};

export default ModernReportDashboard;
