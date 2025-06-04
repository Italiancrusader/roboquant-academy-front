
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReportData } from '@/types/mt5reportgenie';
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
  reportData: ReportData;
}

const ModernReportDashboard: React.FC<ModernReportDashboardProps> = ({ 
  reportData
}) => {
  const trades = reportData.trades || [];

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
          csvUrl={null}
          fileName={reportData.fileName || 'report'}
          parsedData={null}
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
            <Badge variant="default" className="py-1.5">
              <Circle className="h-2 w-2 mr-1 text-primary-foreground" />
              {reportData.fileName}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Main content with tabs */}
      <div className="space-y-6">
        <TabView tabs={dashboardTabs} />
      </div>
    </div>
  );
};

export default ModernReportDashboard;
