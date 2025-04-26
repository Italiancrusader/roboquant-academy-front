
import React from 'react';

const EquityChart: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Equity & Drawdown Analysis</h2>
      <div className="h-[400px] bg-muted/30 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">
          Interactive equity curve chart will be generated here
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        This chart visualizes your equity curve over time along with drawdown periods.
        In the full implementation, this would be an interactive Plotly chart with hover tooltips,
        zoom capabilities, and toggleable metrics overlays.
      </p>
    </div>
  );
};

export default EquityChart;
