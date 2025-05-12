
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { useIsMobile } from '@/hooks/use-mobile';

interface DrawdownAnalysisProps {
  trades: StrategyTrade[];
  initialBalance?: number;
}

const DrawdownAnalysis: React.FC<DrawdownAnalysisProps> = ({ trades, initialBalance = 10000 }) => {
  const isMobile = useIsMobile();
  
  // Filter completed trades and sort by date
  const validTrades = React.useMemo(() => {
    return trades
      .filter(trade => trade.openTime && !isNaN(trade.openTime.getTime()))
      .sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
  }, [trades]);
  
  // Calculate equity curve and drawdowns
  const { equityCurve, drawdowns, maxDrawdownData } = React.useMemo(() => {
    if (validTrades.length === 0) return { equityCurve: [], drawdowns: [], maxDrawdownData: null };
    
    let balance = initialBalance;
    let peak = initialBalance;
    let currentDrawdown = 0;
    let maxDrawdown = 0;
    let maxDrawdownStart = null;
    let maxDrawdownEnd = null;
    let currentDrawdownStart = null;
    let drawdownsArr = [];
    
    const equity = validTrades.map((trade, index) => {
      const date = trade.openTime;
      
      // Update balance based on profit/loss
      if (trade.profit !== undefined) {
        balance += trade.profit;
      } else if (trade.balance !== undefined) {
        balance = trade.balance;
      }
      
      // Update peak and calculate drawdown
      if (balance > peak) {
        // If we hit a new peak, the current drawdown ends
        if (currentDrawdownStart && currentDrawdown > 0) {
          drawdownsArr.push({
            start: currentDrawdownStart,
            end: date,
            drawdown: currentDrawdown,
            drawdownPct: (currentDrawdown / peak) * 100
          });
        }
        
        peak = balance;
        currentDrawdown = 0;
        currentDrawdownStart = null;
      } else {
        const dd = peak - balance;
        if (dd > currentDrawdown) {
          if (!currentDrawdownStart) {
            currentDrawdownStart = date;
          }
          currentDrawdown = dd;
          
          if (currentDrawdown > maxDrawdown) {
            maxDrawdown = currentDrawdown;
            maxDrawdownStart = currentDrawdownStart;
            maxDrawdownEnd = date;
          }
        }
      }
      
      // Return data point
      return {
        date,
        equity: balance,
        drawdown: peak - balance,
        drawdownPct: ((peak - balance) / peak) * 100,
        peak
      };
    });
    
    // Add final drawdown if still ongoing
    if (currentDrawdownStart && currentDrawdown > 0) {
      drawdownsArr.push({
        start: currentDrawdownStart,
        end: validTrades[validTrades.length - 1].openTime,
        drawdown: currentDrawdown,
        drawdownPct: (currentDrawdown / peak) * 100
      });
    }
    
    // Extract max drawdown details
    const maxDrawdownData = maxDrawdown > 0 ? {
      amount: maxDrawdown,
      percent: (maxDrawdown / peak) * 100,
      start: maxDrawdownStart,
      end: maxDrawdownEnd,
      duration: maxDrawdownStart && maxDrawdownEnd ? 
        Math.ceil((maxDrawdownEnd.getTime() - maxDrawdownStart.getTime()) / (1000 * 3600 * 24)) : null
    } : null;
    
    // Sort drawdowns by size
    drawdownsArr.sort((a, b) => b.drawdown - a.drawdown);
    
    return { equityCurve: equity, drawdowns: drawdownsArr, maxDrawdownData };
  }, [validTrades, initialBalance]);
  
  // Calculate drawdown statistics
  const drawdownStats = React.useMemo(() => {
    if (drawdowns.length === 0) return { avg: 0, median: 0, max: 0 };
    
    const drawdownValues = drawdowns.map(d => d.drawdownPct);
    const avg = drawdownValues.reduce((sum, val) => sum + val, 0) / drawdownValues.length;
    
    const sorted = [...drawdownValues].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : 
      sorted[mid];
    
    const max = Math.max(...drawdownValues);
    
    return { avg, median, max };
  }, [drawdowns]);
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format drawdown duration
  const formatDuration = (days: number | null) => {
    if (days === null) return 'N/A';
    if (days < 1) return 'Less than a day';
    if (days === 1) return '1 day';
    return `${days} days`;
  };
  
  if (validTrades.length === 0) {
    return (
      <div className="flex items-center justify-center bg-muted/30 rounded-lg p-8">
        <p className="text-muted-foreground">No trade data available for drawdown analysis</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Drawdown Analysis</CardTitle>
          <CardDescription>Visualize equity curve and analyze drawdowns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-[16/9]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={equityCurve}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis yAxisId="left" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(value) => `${value}%`} 
                  domain={[0, 'dataMax + 5']}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const date = new Date(label);
                      const formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      return (
                        <div className="bg-background border rounded p-3 shadow-lg">
                          <p className="text-sm text-muted-foreground">{formattedDate}</p>
                          <p className="font-semibold">
                            <span className="text-blue-500">Equity:</span> ${payload[0]?.value?.toLocaleString() || '0'}
                          </p>
                          <p className="text-sm">
                            <span className="text-red-500">Drawdown:</span> ${payload[1]?.value?.toLocaleString() || '0'} ({typeof payload[2]?.value === 'number' ? payload[2].value.toFixed(2) : '0.00'}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  name="Equity"
                  stroke="#4096ff"
                  fill="rgba(64, 150, 255, 0.1)"
                  yAxisId="left"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  name="Drawdown"
                  stroke="#ff4d4f"
                  fill="rgba(255, 77, 79, 0.1)"
                  yAxisId="left"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="drawdownPct"
                  name="Drawdown %"
                  stroke="#ff7a45"
                  dot={false}
                  yAxisId="right"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maximum Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            {maxDrawdownData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-xl font-semibold text-red-500">
                      ${maxDrawdownData.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                    <p className="text-xl font-semibold text-red-500">
                      {maxDrawdownData.percent.toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Period</p>
                  <p className="text-sm">
                    {formatDate(maxDrawdownData.start)} to {formatDate(maxDrawdownData.end)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Duration: {formatDuration(maxDrawdownData.duration)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No significant drawdown detected</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Drawdown Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Average</p>
                <p className="text-lg font-semibold">
                  {drawdownStats.avg.toFixed(2)}%
                </p>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Median</p>
                <p className="text-lg font-semibold">
                  {drawdownStats.median.toFixed(2)}%
                </p>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Maximum</p>
                <p className="text-lg font-semibold">
                  {drawdownStats.max.toFixed(2)}%
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Top Drawdowns</p>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-muted/30 sticky top-0">
                    <tr>
                      <th className="p-2 text-left text-xs">#</th>
                      <th className="p-2 text-left text-xs">Amount</th>
                      <th className="p-2 text-left text-xs">Percentage</th>
                      <th className="p-2 text-left text-xs">Start</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawdowns.slice(0, 5).map((dd, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 text-xs">{idx + 1}</td>
                        <td className="p-2 text-xs font-semibold">${dd.drawdown.toLocaleString()}</td>
                        <td className="p-2 text-xs">{dd.drawdownPct.toFixed(2)}%</td>
                        <td className="p-2 text-xs">{formatDate(dd.start)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DrawdownAnalysis;
