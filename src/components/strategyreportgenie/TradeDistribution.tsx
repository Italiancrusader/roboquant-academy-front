
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';

interface TradeDistributionProps {
  trades: StrategyTrade[];
}

const TradeDistribution: React.FC<TradeDistributionProps> = ({ trades }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Trade Distribution</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Trade distribution analysis will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default TradeDistribution;
