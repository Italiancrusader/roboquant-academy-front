
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';

interface PerformanceHeatmapProps {
  trades: StrategyTrade[];
}

const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({ trades }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Performance Heatmap</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Performance heatmap analysis will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default PerformanceHeatmap;
