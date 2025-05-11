import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, AlignLeft, TrendingUp, BellRing, Loader2 } from 'lucide-react';
import { StrategyTrade } from '@/types/strategyreportgenie';

export interface MonteCarloSimulationProps {
  trades: StrategyTrade[];
  isOpen: boolean;
  initialCapital: number;
  onClose: () => void;
}

const MonteCarloSimulation: React.FC<MonteCarloSimulationProps> = ({ 
  trades, 
  isOpen, 
  initialCapital = 10000,
  onClose 
}) => {
  const [simulations, setSimulations] = useState<Array<{ equity: number[] }>>([]);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({
    medianEndingEquity: 0,
    maxDrawdown: { percent: 0, value: 0 },
    profitFactor: 0,
    winRate: 0,
    bestCase: 0,
    worstCase: 0,
    confidenceIntervals: {
      fiftyPercent: [0, 0],
      ninetyPercent: [0, 0]
    }
  });
  
  const NUM_SIMULATIONS = 100;
  const NUM_PERIODS = 250; // Approximate trading days in a year

  // Function to run Monte Carlo simulation
  const runSimulation = () => {
    // Get all completed trades to calculate returns
    const completedTrades = trades.filter(t => 
      t.profit !== undefined && t.direction === 'out'
    );
    
    if (completedTrades.length === 0) {
      return;
    }
    
    // Calculate returns for each trade as percentage
    const returns = completedTrades.map(trade => {
      const profit = trade.profit || 0;
      // Since we don't have size, use a fixed percentage of account
      // This is a simplification but works for simulation purposes
      return profit > 0 ? 0.05 : profit < 0 ? -0.03 : 0; // Simplified win/loss rates
    });
    
    // Generate simulations
    const newSimulations = [];
    for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
      const equity = [initialCapital];
      let currentEquity = initialCapital;
      
      for (let period = 0; period < NUM_PERIODS; period++) {
        // Randomly select returns from our trade history
        const randomIndex = Math.floor(Math.random() * returns.length);
        const returnValue = returns[randomIndex];
        
        // Apply return to equity
        const tradeSize = Math.min(currentEquity * 0.1, currentEquity); // Position sizing at 10%
        const profit = tradeSize * returnValue;
        currentEquity += profit;
        
        // Ensure equity doesn't go below zero
        if (currentEquity <= 0) {
          currentEquity = 0;
          break;
        }
        
        equity.push(currentEquity);
      }
      
      newSimulations.push({ equity });
    }
    
    setSimulations(newSimulations);
    
    // Create chart data
    const chartData = [];
    for (let period = 0; period <= NUM_PERIODS; period++) {
      const dataPoint: any = { period };
      
      // Add each simulation as a line
      newSimulations.forEach((sim, index) => {
        if (period < sim.equity.length) {
          dataPoint[`sim${index}`] = sim.equity[period];
        }
      });
      
      chartData.push(dataPoint);
    }
    
    setSimulationData(chartData);
    
    // Calculate statistics
    const finalEquities = newSimulations.map(sim => sim.equity[sim.equity.length - 1]);
    finalEquities.sort((a, b) => a - b);
    
    const medianEndingEquity = finalEquities[Math.floor(finalEquities.length / 2)];
    const bestCase = finalEquities[finalEquities.length - 1];
    const worstCase = finalEquities[0];
    
    // Calculate 50% and 90% confidence intervals
    const lowerFifty = finalEquities[Math.floor(finalEquities.length * 0.25)];
    const upperFifty = finalEquities[Math.floor(finalEquities.length * 0.75)];
    const lowerNinety = finalEquities[Math.floor(finalEquities.length * 0.05)];
    const upperNinety = finalEquities[Math.floor(finalEquities.length * 0.95)];
    
    // Calculate max drawdown across all simulations
    let maxDrawdownPct = 0;
    let maxDrawdownValue = 0;
    
    newSimulations.forEach(sim => {
      let peak = sim.equity[0];
      let maxDD = 0;
      let maxDDValue = 0;
      
      sim.equity.forEach(value => {
        if (value > peak) {
          peak = value;
        } else {
          const drawdown = (peak - value) / peak;
          const drawdownValue = peak - value;
          if (drawdown > maxDD) {
            maxDD = drawdown;
            maxDDValue = drawdownValue;
          }
        }
      });
      
      if (maxDD > maxDrawdownPct) {
        maxDrawdownPct = maxDD;
        maxDrawdownValue = maxDDValue;
      }
    });
    
    // Simple profit factor and win rate
    const wins = returns.filter(r => r > 0).length;
    const winRate = (wins / returns.length) * 100;
    
    const grossProfit = returns.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
    const grossLoss = Math.abs(returns.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
    const profitFactor = grossLoss ? grossProfit / grossLoss : 0;
    
    setStatistics({
      medianEndingEquity,
      maxDrawdown: { 
        percent: maxDrawdownPct * 100,
        value: maxDrawdownValue
      },
      profitFactor,
      winRate,
      bestCase,
      worstCase,
      confidenceIntervals: {
        fiftyPercent: [lowerFifty, upperFifty],
        ninetyPercent: [lowerNinety, upperNinety]
      }
    });
  };
  
  // Run simulation when component mounts
  useEffect(() => {
    if (isOpen && trades.length > 0) {
      runSimulation();
    }
  }, [isOpen, trades]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-1">Monte Carlo Simulation</DialogTitle>
          <DialogDescription>
            Testing your strategy's robustness through randomized statistical analysis
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 grid gap-6">
          {/* Main simulation chart */}
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-3">Equity Curve Simulations</h3>
              <div className="h-[350px]">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={simulationData}
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="period" 
                        label={{ 
                          value: 'Trading Periods', 
                          position: 'insideBottom', 
                          offset: -5,
                          style: { fill: 'hsl(var(--muted-foreground))' }
                        }}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        label={{ 
                          value: 'Equity', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: 'hsl(var(--muted-foreground))' }
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Equity']}
                        labelFormatter={(label) => `Period ${label}`}
                      />
                      
                      {/* Plot every 5th simulation to avoid crowding */}
                      {simulations.filter((_, idx) => idx % 5 === 0).map((_, idx) => (
                        <Line
                          key={idx * 5}
                          type="monotone"
                          dataKey={`sim${idx * 5}`}
                          stroke={`hsl(${210 + idx * 10}, 80%, 55%)`}
                          strokeWidth={1}
                          dot={false}
                          activeDot={false}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                <p>* Each line represents a potential equity curve based on your historical trade performance</p>
                <p>* Showing {Math.ceil(NUM_SIMULATIONS / 5)} of {NUM_SIMULATIONS} total simulations for better visibility</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Simulation statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-2">Risk Metrics</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Max Drawdown (Median)</div>
                    <div className="text-xl font-semibold text-foreground">{statistics.maxDrawdown.percent.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">({formatCurrency(statistics.maxDrawdown.value)})</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Worst Case Final Equity</div>
                    <div className="text-xl font-semibold text-destructive">{formatCurrency(statistics.worstCase)}</div>
                    <div className="text-xs text-muted-foreground">5% confidence level</div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/30 rounded-md">
                    <AlertCircle className="text-amber-500 h-5 w-5" />
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      Past performance is not indicative of future results. These simulations are estimates only.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Median Final Equity</div>
                    <div className="text-xl font-semibold text-foreground">{formatCurrency(statistics.medianEndingEquity)}</div>
                    <div className="text-xs text-muted-foreground">50% confidence level</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Best Case Final Equity</div>
                    <div className="text-xl font-semibold text-green-600">{formatCurrency(statistics.bestCase)}</div>
                    <div className="text-xs text-muted-foreground">95% confidence level</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Confidence Intervals (Final Equity)</div>
                    <div className="flex gap-2 items-center mt-1">
                      <div className="px-2 py-1 bg-muted text-xs rounded-md">
                        50%: {formatCurrency(statistics.confidenceIntervals.fiftyPercent[0])} to {formatCurrency(statistics.confidenceIntervals.fiftyPercent[1])}
                      </div>
                      <div className="px-2 py-1 bg-muted text-xs rounded-md">
                        90%: {formatCurrency(statistics.confidenceIntervals.ninetyPercent[0])} to {formatCurrency(statistics.confidenceIntervals.ninetyPercent[1])}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonteCarloSimulation;
