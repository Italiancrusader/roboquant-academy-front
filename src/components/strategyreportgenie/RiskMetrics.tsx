
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';

interface RiskMetricsProps {
  trades: StrategyTrade[];
}

const RiskMetrics: React.FC<RiskMetricsProps> = ({ trades }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Risk Metrics</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Risk metrics analysis will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default RiskMetrics;
