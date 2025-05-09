
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';

interface MonthlyReturnsProps {
  trades: StrategyTrade[];
}

const MonthlyReturns: React.FC<MonthlyReturnsProps> = ({ trades }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Monthly Returns</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Monthly returns analysis will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default MonthlyReturns;
