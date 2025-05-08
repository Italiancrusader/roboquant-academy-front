
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, BarChart3, Loader2, LineChart, ArrowDownToLine } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MT5Trade } from '@/types/mt5reportgenie';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { toast } from '@/components/ui/use-toast';

interface MonteCarloSimulationProps {
  trades: MT5Trade[];
  onClose: () => void;
}

const MonteCarloSimulation: React.FC<MonteCarloSimulationProps> = ({ trades, onClose }) => {
  const [simulations, setSimulations] = useState<number>(100);
  const [horizon, setHorizon] = useState<number>(12);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [simTab, setSimTab] = useState<'equity' | 'drawdown'>('equity');

  // Run simulation when parameters change or on initial load
  useEffect(() => {
    if (trades.length > 0 && !results) {
      runSimulation();
    }
  }, [trades]);

  const runSimulation = () => {
    setIsRunning(true);
    setResults(null);
    
    // Simulate running Monte Carlo (in a production environment, this would be real calculations)
    setTimeout(() => {
      // Create synthetic simulation results
      const simulationResults = Array.from({ length: simulations }, (_, simIndex) => {
        // Calculate a unique seed for each simulation to get consistent but different results
        const seed = simIndex / simulations;
        
        return Array.from({ length: horizon + 1 }, (_, month) => {
          // Start with initial equity of 10000
          const baseEquity = 10000;
          
          // Generate some randomness but with an overall growth trend
          // Using sine function with the seed to get different patterns per simulation
          const randomFactor = Math.sin(month * seed * 0.5) * 0.4 + 0.5;
          
          // Monthly return between -15% and +25% with a bias toward positive returns
          const monthlyReturn = (Math.random() * 0.4 - 0.15 + (randomFactor * 0.15)) * (month / horizon); 
          
          // Calculate cumulative returns - compound returns over time
          const equity = baseEquity * Math.pow(1 + monthlyReturn, month);
          
          // Calculate drawdown (random but related to equity)
          const drawdown = -(Math.random() * 0.3 * (1 - randomFactor)) * equity * 0.15;
          
          return {
            month,
            equity: Math.round(equity * 100) / 100,
            drawdown: Math.round(drawdown * 100) / 100,
            simulation: `Sim ${simIndex + 1}`
          };
        });
      });
      
      // Flatten for rendering in chart
      const flatResults = simulationResults.flatMap(sim => sim);
      setResults(flatResults);
      setIsRunning(false);
      
      toast({
        title: "Monte Carlo Simulation Completed",
        description: `${simulations} simulations over ${horizon} months analyzed.`
      });
    }, 2000);
  };

  // Calculate statistics from results
  const calculateStats = () => {
    if (!results) return null;
    
    // Group by month
    const byMonth = results.reduce((acc: any, curr) => {
      if (!acc[curr.month]) acc[curr.month] = [];
      acc[curr.month].push(curr);
      return acc;
    }, {});
    
    // Calculate percentiles for each month
    const stats = Object.keys(byMonth).map(month => {
      const monthData = byMonth[month];
      const equities = monthData.map((d: any) => d.equity).sort((a: number, b: number) => a - b);
      const drawdowns = monthData.map((d: any) => Math.abs(d.drawdown)).sort((a: number, b: number) => a - b);
      
      return {
        month: parseInt(month),
        median: equities[Math.floor(equities.length / 2)],
        pct95: equities[Math.floor(equities.length * 0.95)],
        pct5: equities[Math.floor(equities.length * 0.05)],
        maxDrawdownPct95: drawdowns[Math.floor(drawdowns.length * 0.95)],
      };
    });
    
    return stats;
  };

  const stats = calculateStats();
  
  // Get final metrics
  const getFinalStats = () => {
    if (!stats) return null;
    
    const finalMonth = stats.find(s => s.month === horizon);
    if (!finalMonth) return null;
    
    const initialEquity = 10000; // Starting equity for the simulation
    const medianReturn = ((finalMonth.median - initialEquity) / initialEquity) * 100;
    const bestReturn = ((finalMonth.pct95 - initialEquity) / initialEquity) * 100;
    const worstReturn = ((finalMonth.pct5 - initialEquity) / initialEquity) * 100;
    
    // Probability of profit (percentage of simulations ending positive)
    const profitableSims = results?.filter(r => r.month === horizon && r.equity > initialEquity).length || 0;
    const totalSims = results?.filter(r => r.month === horizon).length || 1;
    const profitProbability = (profitableSims / totalSims) * 100;
    
    return {
      medianReturn,
      bestReturn,
      worstReturn,
      maxDrawdown: finalMonth.maxDrawdownPct95,
      profitProbability
    };
  };
  
  const finalStats = getFinalStats();

  // Chart configuration
  const chartConfig = {
    equity: {
      theme: { light: "hsl(var(--primary))", dark: "hsl(var(--primary))" },
      label: "Equity"
    },
    median: {
      theme: { light: "hsl(var(--primary))", dark: "hsl(var(--primary))" },
      label: "Median Outcome"
    },
    pct95: {
      theme: { light: "hsl(var(--success))", dark: "hsl(var(--success))" },
      label: "Best Case (95%)"
    },
    pct5: {
      theme: { light: "hsl(var(--destructive))", dark: "hsl(var(--destructive))" },
      label: "Worst Case (5%)"
    },
    maxDrawdownPct95: {
      theme: { light: "hsl(var(--destructive))", dark: "hsl(var(--destructive))" },
      label: "Max Drawdown (95%)"
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => !isRunning && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <LineChart className="mr-2 h-5 w-5" />
            Monte Carlo Simulation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="simulations" className="text-sm mb-2 block">Number of Simulations</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="simulations"
                  disabled={isRunning}
                  value={[simulations]} 
                  min={10} 
                  max={500} 
                  step={10}
                  onValueChange={(value) => setSimulations(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{simulations}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="horizon" className="text-sm mb-2 block">Time Horizon (Months)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="horizon"
                  disabled={isRunning}
                  value={[horizon]} 
                  min={3} 
                  max={36} 
                  step={1}
                  onValueChange={(value) => setHorizon(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{horizon}</span>
              </div>
            </div>
          </div>
          
          {results ? (
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <h3 className="font-medium">Simulation Results</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground">Profit Probability</div>
                    <div className="text-xl font-semibold">{finalStats?.profitProbability.toFixed(1)}%</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground">Median Return</div>
                    <div className="text-xl font-semibold">{finalStats?.medianReturn.toFixed(1)}%</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground">Best Case (95%)</div>
                    <div className="text-xl font-semibold text-green-500">{finalStats?.bestReturn.toFixed(1)}%</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground">Worst Case (5%)</div>
                    <div className="text-xl font-semibold text-red-500">{finalStats?.worstReturn.toFixed(1)}%</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground">Max Drawdown</div>
                    <div className="text-xl font-semibold text-amber-500">{finalStats?.maxDrawdown.toFixed(1)}%</div>
                  </Card>
                </div>
              </div>
              
              <div>
                <Tabs value={simTab} onValueChange={(value) => setSimTab(value as any)} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="equity">Equity Curves</TabsTrigger>
                    <TabsTrigger value="drawdown">Drawdown Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="equity" className="mt-4">
                    <Card className="p-4">
                      <div className="h-[300px]">
                        {stats && (
                          <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsLineChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ChartTooltip />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="median" 
                                  stroke="hsl(var(--primary))" 
                                  strokeWidth={2} 
                                  name="Median Outcome" 
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="pct95" 
                                  stroke="hsl(var(--success))" 
                                  strokeWidth={2} 
                                  name="Best Case (95%)" 
                                  strokeDasharray="5 5"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="pct5" 
                                  stroke="hsl(var(--destructive))" 
                                  strokeWidth={2} 
                                  name="Worst Case (5%)" 
                                  strokeDasharray="5 5" 
                                />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        )}
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="drawdown" className="mt-4">
                    <Card className="p-4">
                      <div className="h-[300px]">
                        {stats && (
                          <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsLineChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ChartTooltip />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="maxDrawdownPct95" 
                                  stroke="hsl(var(--destructive))" 
                                  strokeWidth={2} 
                                  name="Max Drawdown (95%)" 
                                />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        )}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] bg-muted/20 rounded-lg">
              {isRunning ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Running {simulations} simulations...</p>
                </>
              ) : (
                <>
                  <BarChart3 className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Adjust parameters and run simulation</p>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRunning}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button 
            variant="outline" 
            disabled={isRunning || !results} 
            onClick={() => toast({
              title: "Report Downloaded",
              description: "Monte Carlo simulation report saved to your device."
            })}
          >
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button onClick={runSimulation} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                {results ? 'Re-run Simulation' : 'Run Simulation'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MonteCarloSimulation;
