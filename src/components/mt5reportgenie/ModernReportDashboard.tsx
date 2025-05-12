
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileType } from '@/types/mt5reportgenie';
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
import EquityChartView from './EquityChartView';
import PerformanceStatsView from './PerformanceStatsView';
import DrawdownView from './DrawdownView';
import TimeAnalysisView from './TimeAnalysisView';
import CsvViewer from './CsvViewer';

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

export default ModernReportDashboard;
