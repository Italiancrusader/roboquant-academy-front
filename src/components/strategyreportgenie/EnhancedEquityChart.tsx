import React, { useId } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface EnhancedEquityChartProps {
  equityCurve: Array<{ date: Date | number | string; equity: number; drawdown: number }>;
  currency?: string;
}

const EnhancedEquityChart: React.FC<EnhancedEquityChartProps> = ({
  equityCurve,
  currency = '$'
}) => {
  const chartId = useId();
  
  // Process data for charting
  const chartData = equityCurve.map((point, index) => ({
    date: point.date instanceof Date ? point.date.getTime() : new Date(point.date).getTime(),
    equity: point.equity,
    id: `${chartId}-dp-${index}`
  }));
  
  // Calculate key metrics
  const initialEquity = chartData[0]?.equity || 0;
  const currentEquity = chartData[chartData.length - 1]?.equity || 0;
  const absoluteReturn = currentEquity - initialEquity;
  const percentageReturn = ((currentEquity - initialEquity) / initialEquity) * 100;
  const maxEquity = Math.max(...chartData.map(d => d.equity));
  const minEquity = Math.min(...chartData.map(d => d.equity));
  const equityPadding = (maxEquity - minEquity) * 0.1;
  
  // Calculate average daily return and volatility
  const dailyReturns = chartData.slice(1).map((point, i) => {
    const prevEquity = chartData[i].equity;
    return ((point.equity - prevEquity) / prevEquity) * 100;
  });
  
  const avgDailyReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const volatility = Math.sqrt(
    dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / dailyReturns.length
  );
  
  // Find min and max dates for custom tick generation
  const minDate = Math.min(...chartData.map(d => d.date));
  const maxDate = Math.max(...chartData.map(d => d.date));
  
  // Generate exactly 5 evenly spaced ticks
  const generateTicks = () => {
    const ticks = [];
    const timeRange = maxDate - minDate;
    const step = timeRange / 4;
    
    for (let i = 0; i < 5; i++) {
      ticks.push(minDate + step * i);
    }
    
    return ticks;
  };
  
  const formatDate = (dateInput: Date | number | string) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
  };
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${currency}${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${currency}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${currency}${(value / 1000).toFixed(1)}K`;
    return `${currency}${value.toFixed(0)}`;
  };
  
  const formatCurrencyDetailed = (value: number) => {
    return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const CustomAxisTick = (props: any) => {
    const { x, y, payload, index } = props;
    return (
      <g transform={`translate(${x},${y})`} key={`${chartId}-tick-${index}`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={11}
        >
          {formatDate(payload.value)}
        </text>
      </g>
    );
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const currentValue = payload[0]?.value || 0;
      const initialValue = chartData[0]?.equity || 0;
      const returnSinceStart = ((currentValue - initialValue) / initialValue) * 100;
      
      return (
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 p-3 border rounded-lg shadow-xl">
          <p className="mb-2 font-semibold text-sm">
            {date.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-primary">
              Equity: {formatCurrencyDetailed(currentValue)}
            </p>
            <p className="text-xs text-muted-foreground">
              Return: {returnSinceStart.toFixed(2)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="shadow-md w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Equity Growth</CardTitle>
            <CardDescription>Strategy performance over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={percentageReturn >= 0 ? "default" : "destructive"} className="h-6">
              {percentageReturn >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {percentageReturn.toFixed(2)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Initial Balance</p>
            <p className="text-lg font-semibold">{formatCurrencyDetailed(initialEquity)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-lg font-semibold">{formatCurrencyDetailed(currentEquity)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Absolute Return</p>
            <p className="text-lg font-semibold">{formatCurrencyDetailed(absoluteReturn)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Daily Volatility</p>
            <p className="text-lg font-semibold">{volatility.toFixed(2)}%</p>
          </div>
        </div>
        
        {chartData.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No data available</div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 60, bottom: 30 }}
              >
                <defs>
                  <linearGradient id={`equityGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  domain={[Math.max(0, minEquity - equityPadding), maxEquity + equityPadding]}
                  tickFormatter={formatCurrency}
                  width={50}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={initialEquity} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="equity"
                  name="Equity"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill={`url(#equityGradient-${chartId})`}
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedEquityChart; 