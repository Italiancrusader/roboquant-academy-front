
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';

interface SymbolMetricsProps {
  trades: StrategyTrade[];
}

const SymbolMetrics: React.FC<SymbolMetricsProps> = ({ trades }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Symbol Performance</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Symbol performance analysis will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default SymbolMetrics;
