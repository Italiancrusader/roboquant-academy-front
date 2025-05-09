
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';

interface CorrelationAnalysisProps {
  trades: StrategyTrade[];
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({ trades }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Correlation Analysis</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Correlation analysis will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;
