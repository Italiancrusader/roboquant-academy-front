
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MT5Trade } from '@/types/mt5reportgenie';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { format } from 'date-fns';

interface EquityChartViewProps {
  trades: MT5Trade[];
}

const EquityChartView: React.FC<EquityChartViewProps> = ({ trades }) => {
  // Generate equity curve data from trades
  const equityCurveData = React.useMemo(() => {
    if (!trades.length) return [];
    
    const equityPoints = trades
      .filter(trade => trade.balance !== undefined)
      .sort((a, b) => {
        const dateA = a.timeFlag || a.openTime;
        const dateB = b.timeFlag || b.openTime;
        return dateA.getTime() - dateB.getTime();
      })
      .map(trade => {
        const date = trade.timeFlag || trade.openTime;
        return {
          date,
          equity: trade.balance || 0
        };
      });

    // Calculate drawdown for each point
    let peak = equityPoints.length > 0 ? equityPoints[0].equity : 0;
    
    return equityPoints.map(point => {
      if (point.equity > peak) peak = point.equity;
      const drawdown = peak - point.equity;
      const drawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0;
      
      return {
        date: point.date,
        equity: point.equity,
        drawdown: drawdown,
        drawdownPct: drawdownPct
      };
    });
  }, [trades]);
  
  // Format date for tooltip
  const formatDate = (date: Date): string => {
    if (!date) return '';
    try {
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Invalid date';
    }
  };
  
  // Format currency for tooltip
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-md text-sm">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-primary">Equity: {formatCurrency(payload[0].value)}</p>
          {payload[1] && <p className="text-red-500">Drawdown: {formatCurrency(payload[1].value)}</p>}
        </div>
      );
    }
    return null;
  };
  
  // Calculate initial and latest equity values
  const initialEquity = equityCurveData.length > 0 ? equityCurveData[0].equity : 0;
  const currentEquity = equityCurveData.length > 0 ? equityCurveData[equityCurveData.length - 1].equity : 0;
  const absoluteGrowth = currentEquity - initialEquity;
  const percentageGrowth = initialEquity > 0 ? (absoluteGrowth / initialEquity) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
        <CardDescription>
          Account growth from {formatCurrency(initialEquity)} to {formatCurrency(currentEquity)} 
          ({absoluteGrowth >= 0 ? '+' : ''}{formatCurrency(absoluteGrowth)} / {percentageGrowth.toFixed(2)}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {equityCurveData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={equityCurveData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatDate(new Date(date))}
                  minTickGap={50}
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="equity"
                  name="Equity"
                  stroke="#0ea5e9"
                  fill="url(#colorEquity)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  name="Drawdown"
                  stroke="#ef4444"
                  fill="url(#colorDrawdown)"
                  strokeWidth={1}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-muted-foreground">No equity data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquityChartView;
