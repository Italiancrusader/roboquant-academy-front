
import React from 'react';
import { MT5Trade } from '@/types/mt5reportgenie';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface DrawdownAnalysisProps {
  trades: MT5Trade[];
}

const DrawdownAnalysis: React.FC<DrawdownAnalysisProps> = ({ trades }) => {
  // Process the equity curve and calculate drawdowns
  const drawdownData = React.useMemo(() => {
    if (trades.length === 0) return { equityCurve: [], maxDrawdownPeriod: { start: 0, end: 0 } };
    
    let initialBalance = 0;
    for (let i = 0; i < trades.length; i++) {
      if (trades[i].balance !== undefined) {
        initialBalance = trades[i].balance;
        break;
      }
    }
    
    let peak = initialBalance;
    let maxDrawdown = 0;
    let currentDrawdownStart = 0;
    let maxDrawdownStart = 0;
    let maxDrawdownEnd = 0;
    let balance = initialBalance;
    let maxDrawdownEndTemp = 0;
    
    // Create the equity curve with drawdown percentages
    const equityCurve = trades
      .filter(trade => trade.balance !== undefined && trade.timeFlag)
      .map((trade, index) => {
        balance = trade.balance!;
        const drawdownAmount = peak - balance;
        const drawdownPct = peak > 0 ? (drawdownAmount / peak) * 100 : 0;
        
        // Update peak and track drawdown periods
        if (balance > peak) {
          peak = balance;
          currentDrawdownStart = index;
        } else if (drawdownAmount > maxDrawdown) {
          maxDrawdown = drawdownAmount;
          maxDrawdownStart = currentDrawdownStart;
          maxDrawdownEnd = index;
          maxDrawdownEndTemp = index;
        }
        
        return {
          date: new Date(trade.timeFlag!).getTime(),
          equity: balance,
          drawdownPct: drawdownPct,
          drawdownAmount: drawdownAmount,
        };
      });
    
    return { 
      equityCurve,
      maxDrawdownPeriod: {
        start: maxDrawdownStart,
        end: maxDrawdownEnd
      }
    };
  }, [trades]);

  // Calculate drawdown statistics
  const drawdownStats = React.useMemo(() => {
    const { equityCurve } = drawdownData;
    if (equityCurve.length === 0) return { max: 0, avg: 0, current: 0, duration: 0 };
    
    const drawdowns = equityCurve.map(point => point.drawdownPct);
    const maxDrawdown = Math.max(...drawdowns);
    const avgDrawdown = drawdowns.reduce((sum, dd) => sum + dd, 0) / drawdowns.length;
    const currentDrawdown = drawdowns[drawdowns.length - 1];
    
    // Calculate max drawdown duration (oversimplified - just counting points in series)
    const { maxDrawdownPeriod } = drawdownData;
    const duration = maxDrawdownPeriod.end - maxDrawdownPeriod.start;
    
    return { max: maxDrawdown, avg: avgDrawdown, current: currentDrawdown, duration };
  }, [drawdownData]);

  // Format currency and percentages
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Format date for X-axis
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Chart configuration
  const config = {
    drawdown: {
      label: 'Drawdown Analysis',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
  };
  
  const { equityCurve, maxDrawdownPeriod } = drawdownData;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Drawdown Analysis</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">Max Drawdown</p>
          <p className="text-lg font-bold text-red-500">{formatPercent(drawdownStats.max)}</p>
        </Card>
        <Card className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">Avg Drawdown</p>
          <p className="text-lg font-bold">{formatPercent(drawdownStats.avg)}</p>
        </Card>
        <Card className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">Current Drawdown</p>
          <p className="text-lg font-bold">{formatPercent(drawdownStats.current)}</p>
        </Card>
        <Card className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">Max DD Duration</p>
          <p className="text-lg font-bold">{drawdownStats.duration} trades</p>
        </Card>
      </div>
      
      <Card className="p-5">
        <h3 className="text-base font-medium mb-4">Drawdown Chart</h3>
        <div className="h-[300px]">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={equityCurve}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  minTickGap={50}
                />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => formatPercent(value)}
                  domain={[0, 'dataMax + 5']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <div className="text-sm font-medium mb-1">
                          {new Date(data.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Equity: {formatCurrency(data.equity)}
                        </div>
                        <div className="text-xs text-red-500 font-semibold">
                          Drawdown: {formatPercent(data.drawdownPct)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          DD Amount: {formatCurrency(data.drawdownAmount)}
                        </div>
                      </div>
                    );
                  }}
                />
                {maxDrawdownPeriod.start !== maxDrawdownPeriod.end && (
                  <ReferenceArea
                    x1={equityCurve[maxDrawdownPeriod.start]?.date}
                    x2={equityCurve[maxDrawdownPeriod.end]?.date}
                    fill="rgba(255, 0, 0, 0.1)"
                    label={{ value: "Maximum Drawdown Period", position: "center", fill: "hsl(var(--muted-foreground))" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="drawdownPct"
                  stroke="hsl(346.8, 77.2%, 49.8%)"
                  fill="rgba(255, 0, 0, 0.1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};

export default DrawdownAnalysis;
