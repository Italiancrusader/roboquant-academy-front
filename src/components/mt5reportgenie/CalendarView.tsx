
import React from 'react';

const CalendarView: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Calendar & Time-Based Analysis</h2>
      <div className="h-[400px] bg-muted/30 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">
          Monthly returns heatmap and weekday performance charts will be displayed here
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        This section breaks down your strategy's performance across different time periods,
        including monthly returns heatmaps, day-of-week analysis, hour-of-day edge detection,
        and other time-based patterns that might reveal hidden edges or weaknesses in your trading system.
      </p>
    </div>
  );
};

export default CalendarView;
