
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';

interface DrawdownAnalysisProps {
  trades: StrategyTrade[];
}

const DrawdownAnalysis: React.FC<DrawdownAnalysisProps> = ({ trades }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Drawdown Analysis</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Drawdown analysis will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default DrawdownAnalysis;
