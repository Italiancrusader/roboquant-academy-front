import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ChartContainer } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, AlertCircle, Calendar } from 'lucide-react';

interface DrawdownAnalysisProps {
  trades: StrategyTrade[];
}

interface DrawdownPeriod {
  start: Date;
  peak: number;
  peakDate: Date;
  bottom: number;
  bottomDate: Date;
  recovery: number | null;
  recoveryDate: Date | null;
  drawdownAmount: number;
  drawdownPercent: number;
  duration: number; // days
  recoveryDuration: number | null; // days
}

const DrawdownAnalysis: React.FC<DrawdownAnalysisProps> = ({ trades }) => {
  // Generate equity curve and drawdown data
  const { equityCurve, drawdownPeriods } = React.useMemo(() => {
    if (!trades.length) return { equityCurve: [], drawdownPeriods: [] };
    
    // Filter trades with balance info
    const tradesWithBalance = trades
      .filter(trade => trade.balance !== undefined)
      .sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
    
    if (tradesWithBalance.length === 0) return { equityCurve: [], drawdownPeriods: [] };
    
    const equity: { date: Date; equity: number; drawdownPct: number; drawdown: number }[] = [];
    const periods: DrawdownPeriod[] = [];
    
    let peak = tradesWithBalance[0].balance || 0;
    let peakDate = tradesWithBalance[0].openTime;
    let inDrawdown = false;
    let currentDrawdown: Partial<DrawdownPeriod> | null = null;
    
    tradesWithBalance.forEach(trade => {
      const balance = trade.balance || 0;
      const date = trade.openTime;
      
      // Calculate current drawdown
      const drawdown = peak - balance;
      const drawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0;
      
      // Add point to equity curve
      equity.push({ 
        date,
        equity: balance,
        drawdownPct,
        drawdown
      });
      
      // Update drawdown tracking
      if (balance > peak) {
        // New peak reached
        peak = balance;
        peakDate = date;
        
        // If we were in a drawdown, it's now recovered
        if (inDrawdown && currentDrawdown) {
          currentDrawdown.recovery = balance;
          currentDrawdown.recoveryDate = date;
          currentDrawdown.recoveryDuration = Math.ceil(
            (date.getTime() - currentDrawdown.bottomDate!.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // Add to completed periods
          periods.push(currentDrawdown as DrawdownPeriod);
          
          // Reset tracking
          inDrawdown = false;
          currentDrawdown = null;
        }
      } else if (balance < peak) {
        // In drawdown
        
        if (!inDrawdown) {
          // Start of new drawdown
          inDrawdown = true;
          currentDrawdown = {
            start: peakDate,
            peak,
            peakDate,
            bottom: balance,
            bottomDate: date,
            recovery: null,
            recoveryDate: null,
            drawdownAmount: peak - balance,
            drawdownPercent: (peak - balance) / peak * 100,
            duration: Math.ceil((date.getTime() - peakDate.getTime()) / (1000 * 60 * 60 * 24)),
            recoveryDuration: null
          };
        } else if (currentDrawdown && balance < currentDrawdown.bottom!) {
          // Deeper drawdown
          currentDrawdown.bottom = balance;
          currentDrawdown.bottomDate = date;
          currentDrawdown.drawdownAmount = currentDrawdown.peak! - balance;
          currentDrawdown.drawdownPercent = (currentDrawdown.peak! - balance) / currentDrawdown.peak! * 100;
          currentDrawdown.duration = Math.ceil(
            (date.getTime() - currentDrawdown.start!.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      }
    });
    
    // Add the current drawdown if still in one
    if (inDrawdown && currentDrawdown) {
      periods.push(currentDrawdown as DrawdownPeriod);
    }
    
    // Sort by drawdown amount
    const sortedPeriods = periods
      .filter(p => p.drawdownPercent > 0.5) // Filter out tiny drawdowns
      .sort((a, b) => b.drawdownAmount - a.drawdownAmount);
    
    return { equityCurve: equity, drawdownPeriods: sortedPeriods };
  }, [trades]);
  
  if (!equityCurve.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No data available for drawdown analysis</p>
      </div>
    );
  }

  // Find max drawdown
  const maxDrawdown = drawdownPeriods.length ? drawdownPeriods[0] : null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Drawdown Analysis</h2>
      
      {/* Drawdown Visualization */}
      <Card className="mb-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="h-5 w-5" /> Drawdown Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] pb-10">
          <ChartContainer config={{ 
            drawdown: { color: "hsl(var(--destructive))" }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={equityCurve}
                margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => date instanceof Date ? date.toLocaleDateString() : ''}
                  tick={{ fontSize: 11 }}
                  height={50}
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  label={{ 
                    value: 'Drawdown %', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Drawdown']}
                  labelFormatter={(label) => label instanceof Date ? label.toLocaleDateString() : ''}
                  wrapperStyle={{ zIndex: 1000 }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  verticalAlign="bottom"
                  height={30}
                />
                <Area 
                  type="monotone" 
                  dataKey="drawdownPct" 
                  name="Drawdown %" 
                  stroke="hsl(var(--destructive))" 
                  fill="hsl(var(--destructive)/0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Max Drawdown Details */}
      {maxDrawdown && (
        <Card className="mb-10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Maximum Drawdown Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-muted-foreground">Max Drawdown</h3>
                <div className="mt-2 text-2xl font-bold text-destructive">
                  ${maxDrawdown.drawdownAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {maxDrawdown.drawdownPercent.toFixed(2)}% of peak equity
                </p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                <div className="mt-2 text-2xl font-bold">
                  {maxDrawdown.duration} days
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {maxDrawdown.start.toLocaleDateString()} to {maxDrawdown.bottomDate.toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-muted-foreground">Recovery</h3>
                <div className="mt-2 text-2xl font-bold">
                  {maxDrawdown.recoveryDuration ? `${maxDrawdown.recoveryDuration} days` : 'Not yet recovered'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {maxDrawdown.recoveryDate ? `Recovered on ${maxDrawdown.recoveryDate.toLocaleDateString()}` : 'Still in drawdown'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <h3 className="text-sm font-medium mb-2">Risk Assessment</h3>
              <p className="text-sm">
                {maxDrawdown.drawdownPercent > 30 ? (
                  <span className="text-destructive">Severe drawdown exceeding 30% of equity indicates substantial risk. Consider revising risk management parameters and position sizing.</span>
                ) : maxDrawdown.drawdownPercent > 20 ? (
                  <span className="text-amber-500">Significant drawdown between 20-30% suggests elevated risk levels. Review trading strategy and consider implementing tighter risk controls.</span>
                ) : maxDrawdown.drawdownPercent > 10 ? (
                  <span className="text-amber-400">Moderate drawdown between 10-20% is within normal range for most strategies, but warrants monitoring.</span>
                ) : (
                  <span className="text-green-500">Low drawdown under 10% indicates excellent risk management and capital preservation.</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Drawdown Periods Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Drawdown History
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Date</TableHead>
                <TableHead>Bottom Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Percent</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Recovery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drawdownPeriods.slice(0, 10).map((period, index) => (
                <TableRow key={index}>
                  <TableCell>{period.start.toLocaleDateString()}</TableCell>
                  <TableCell>{period.bottomDate.toLocaleDateString()}</TableCell>
                  <TableCell className="text-destructive">${period.drawdownAmount.toFixed(2)}</TableCell>
                  <TableCell>{period.drawdownPercent.toFixed(2)}%</TableCell>
                  <TableCell>{period.duration} days</TableCell>
                  <TableCell>
                    {period.recoveryDate ? 
                      `${period.recoveryDuration} days` : 
                      <span className="text-amber-500">Not recovered</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {drawdownPeriods.length > 10 && (
            <p className="text-muted-foreground text-xs mt-2">
              Showing top 10 drawdown periods out of {drawdownPeriods.length} total.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawdownAnalysis;
