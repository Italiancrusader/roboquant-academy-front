
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileType } from '@/types/mt5reportgenie';
import { 
  CircleDollarSign, 
  Trash2, 
  Download, 
  Circle,
  BarChart2,
} from 'lucide-react';

import ModernReportDashboard from './ModernReportDashboard';

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
  // Using the new modern dashboard instead of the old implementation
  return (
    <ModernReportDashboard
      files={files}
      onClearFiles={onClearFiles}
      onGeneratePDF={onGeneratePDF}
      onMonteCarloSimulation={onMonteCarloSimulation}
      onOptimizeStrategy={onOptimizeStrategy}
    />
  );
};

export default ReportDashboard;
