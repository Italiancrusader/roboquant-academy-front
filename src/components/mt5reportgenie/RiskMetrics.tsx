
import React from 'react';

const RiskMetrics: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Risk & Drawdown Analysis</h2>
      <div className="h-[400px] bg-muted/30 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">
          Risk metrics charts and underwater equity curve will be displayed here
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        This section shows detailed risk metrics including Monte-Carlo simulations for drawdown estimation,
        underwater equity curve, and recovery periods analysis. In the full implementation, these would be 
        interactive Plotly charts with detailed tooltips and customization options.
      </p>
    </div>
  );
};

export default RiskMetrics;
