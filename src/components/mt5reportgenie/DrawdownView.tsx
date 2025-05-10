import React from 'react';
import { MT5Trade } from '@/types/mt5reportgenie';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import ChartWrapper from '@/components/ui/chart-wrapper';
import MetricCard from '@/components/ui/metrics-card';
import { TrendingDown, Timer, RefreshCw, AlertCircle } from 'lucide-react';

interface DrawdownViewProps {
  trades: MT5Trade[];
}

const DrawdownView: React.FC<DrawdownViewProps> = ({ trades }) => {
  // Process the equity curve and calculate drawdowns
  const drawdownData = React.useMemo(() => {
    if (trades.length === 0) return { 
      equityCurve: [], 
      maxDrawdownPeriod: { start: 0, end: 0, drawdown: 0, recovery: 0 } 
    };
    
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
    let peakTime = trades.find(t => t.balance !== undefined)?.timeFlag || new Date();
    let maxDrawdownTime = peakTime;
    let recoveryTime = null;
    
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
          peakTime = trade.timeFlag!;
          
          // If we reach a new high after max drawdown, mark as recovery
          if (maxDrawdown > 0 && !recoveryTime) {
            recoveryTime = trade.timeFlag;
          }
        } else if (drawdownAmount > maxDrawdown) {
          maxDrawdown = drawdownAmount;
          maxDrawdownStart = currentDrawdownStart;
          maxDrawdownEnd = index;
          maxDrawdownTime = trade.timeFlag!;
        }
        
        return {
          date: new Date(trade.timeFlag!).getTime(),
          equity: balance,
          drawdownPct: drawdownPct,
          drawdownAmount: drawdownAmount,
        };
      });
    
    // Calculate recovery duration in days (if applicable)
    const recoveryDuration = recoveryTime && maxDrawdownTime
      ? Math.ceil((recoveryTime.getTime() - maxDrawdownTime.getTime()) / (1000 * 3600 * 24))
      : null;
    
    return { 
      equityCurve,
      maxDrawdownPeriod: {
        start: maxDrawdownStart,
        end: maxDrawdownEnd,
        drawdown: maxDrawdown,
        recovery: recoveryDuration,
      }
    };
  }, [trades]);

  // Calculate drawdown statistics
  const drawdownStats = React.useMemo(() => {
    const { equityCurve } = drawdownData;
    if (equityCurve.length === 0) return { max: 0, avg: 0, current: 0, duration: 0, maxDrawdownPct: 0 };
    
    const drawdowns = equityCurve.map(point => point.drawdownPct);
    const maxDrawdown = Math.max(...drawdowns);
    const avgDrawdown = drawdowns.reduce((sum, dd) => sum + dd, 0) / drawdowns.length;
    const currentDrawdown = drawdowns[drawdowns.length - 1];
    
    // Find peak equity for max drawdown percentage calculation
    let peakEquity = equityCurve[0].equity;
    for (const point of equityCurve) {
      if (point.equity > peakEquity) {
        peakEquity = point.equity;
      }
    }
    
    const maxDrawdownAmount = drawdownData.maxDrawdownPeriod.drawdown;
    const maxDrawdownPct = peakEquity > 0 ? (maxDrawdownAmount / peakEquity) * 100 : 0;
    
    // Calculate max drawdown duration (oversimplified - just counting points in series)
    const { maxDrawdownPeriod } = drawdownData;
    const duration = maxDrawdownPeriod.end - maxDrawdownPeriod.start;
    
    return { 
      max: maxDrawdown, 
      avg: avgDrawdown, 
      current: currentDrawdown, 
      duration,
      maxDrawdownPct,
    };
  }, [drawdownData]);
  
  // Calculate recovery factor
  const recoveryFactor = React.useMemo(() => {
    if (drawdownData.equityCurve.length === 0) return 0;
    
    const initialEquity = drawdownData.equityCurve[0].equity;
    const finalEquity = drawdownData.equityCurve[drawdownData.equityCurve.length - 1].equity;
    const netProfit = finalEquity - initialEquity;
    
    return drawdownData.maxDrawdownPeriod.drawdown > 0
      ? netProfit / drawdownData.maxDrawdownPeriod.drawdown
      : 0;
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

  const { equityCurve, maxDrawdownPeriod } = drawdownData;

  return (
    <div className="space-y-4">
      {/* Drawdown Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard 
          title="Max Drawdown" 
          value={formatCurrency(maxDrawdownPeriod.drawdown)}
          suffix={` (${formatPercent(drawdownStats.maxDrawdownPct)})`}
          icon={<TrendingDown size={16} />}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Current Drawdown" 
          value={formatPercent(drawdownStats.current)}
          icon={<AlertCircle size={16} />}
          variant="filled"
          size="sm"
        />
        <MetricCard 
          title="Recovery Factor" 
          value={recoveryFactor.toFixed(2)}
          icon={<RefreshCw size={16} />}
          variant="filled"
          size="sm"
          trend={recoveryFactor > 1 ? 'up' : 'down'}
        />
        <MetricCard 
          title="Recovery Time" 
          value={maxDrawdownPeriod.recovery ? `${maxDrawdownPeriod.recovery} days` : 'N/A'}
          icon={<Timer size={16} />}
          variant="filled"
          size="sm"
        />
      </div>
      
      {/* Drawdown Chart */}
      <ChartWrapper
        title="Drawdown Chart"
        description="Percentage drawdown over time"
        height="h-[400px]"
      >
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
                  <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md">
                    <div className="text-sm font-medium mb-1">
                      {new Date(data.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Equity: {formatCurrency(data.equity)}
                    </div>
                    <div className="text-xs text-destructive font-medium">
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
                // Fix: Use a function to return the content element (React component) instead of a string
                label={{
                  value: "Maximum Drawdown Period",
                  position: "center",
                  fill: "hsl(var(--muted-foreground))"
                }}
              />
            )}
            <ReferenceLine y={drawdownStats.maxDrawdownPct} stroke="hsl(var(--destructive))" strokeDasharray="3 3">
              {/* Fix: Instead of using position attribute directly on label, render label text as children */}
              <text x="100%" y={drawdownStats.maxDrawdownPct} textAnchor="end" fill="hsl(var(--destructive))" dy={-5}>
                Max {formatPercent(drawdownStats.maxDrawdownPct)}
              </text>
            </ReferenceLine>
            <Area
              type="monotone"
              dataKey="drawdownPct"
              stroke="hsl(346.8, 77.2%, 49.8%)"
              fill="rgba(255, 0, 0, 0.1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  );
};

export default DrawdownView;
