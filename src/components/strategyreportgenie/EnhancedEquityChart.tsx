import React, { useId } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedEquityChartProps {
  equityCurve: Array<{ date: Date | number | string; equity: number; drawdown: number }>;
  currency?: string;
}

const SimpleEquityChart: React.FC<EnhancedEquityChartProps> = ({
  equityCurve,
  currency = '$'
}) => {
  // Generate a unique ID for this component instance
  const chartId = useId();
  
  // Process data for charting
  const chartData = equityCurve.map((point, index) => ({
    date: point.date instanceof Date ? point.date.getTime() : new Date(point.date).getTime(),
    equity: point.equity,
    id: `${chartId}-dp-${index}`
  }));
  
  // Find min and max equity values for better domain calculation
  const minEquity = Math.min(...chartData.map(d => d.equity));
  const maxEquity = Math.max(...chartData.map(d => d.equity));
  const equityPadding = (maxEquity - minEquity) * 0.1;
  
  // Find min and max dates for custom tick generation
  const minDate = Math.min(...chartData.map(d => d.date));
  const maxDate = Math.max(...chartData.map(d => d.date));
  
  // Generate exactly 5 evenly spaced ticks for the time range
  const generateTicks = () => {
    const ticks = [];
    const timeRange = maxDate - minDate;
    const step = timeRange / 4; // 4 steps for 5 points (including min and max)
    
    for (let i = 0; i < 5; i++) {
      ticks.push(minDate + step * i);
    }
    
    return ticks;
  };
  
  // Format date for tooltip and axis - with month and year only to prevent clutter
  const formatDate = (dateInput: Date | number | string) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  };
  
  // Format currency for tooltip and axis - shorter format
  const formatCurrency = (value: number) => {
    // For large numbers, abbreviate with K, M, B
    if (value >= 1000000000) {
      return `${currency}${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${currency}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${currency}${(value / 1000).toFixed(1)}K`;
    }
    return `${currency}${value.toFixed(0)}`;
  };
  
  // Detailed currency format for tooltip
  const formatCurrencyDetailed = (value: number) => {
    return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Custom axis tick component
  const CustomAxisTick = (props: any) => {
    const { x, y, payload, index } = props;
    const tickId = `${chartId}-tick-${index}`;
    
    return (
      <g transform={`translate(${x},${y})`} key={tickId}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize={11}
        >
          {formatDate(payload.value)}
        </text>
      </g>
    );
  };
  
  // Custom tooltip component with more detailed information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="mb-1 font-semibold">
            {date.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="text-green-600">
            Equity: {formatCurrencyDetailed(payload[0]?.value || 0)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="shadow-md w-full">
      <CardHeader className="pb-3">
        <CardTitle>Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-10">No data available</div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 60, bottom: 30 }}
              >
                <defs>
                  <linearGradient id={`equityGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#65B741" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#65B741" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  scale="time"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  ticks={generateTicks()}
                  tick={<CustomAxisTick />}
                  padding={{ left: 10, right: 10 }}
                  height={50}
                />
                <YAxis
                  domain={[Math.max(0, minEquity - equityPadding), maxEquity + equityPadding]}
                  tickFormatter={formatCurrency}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Area
                  type="monotone"
                  dataKey="equity"
                  name="Equity"
                  stroke="#65B741"
                  strokeWidth={2}
                  fill={`url(#equityGradient-${chartId})`}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleEquityChart; 