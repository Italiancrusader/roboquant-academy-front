
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Settings, ArrowUp, ArrowDown, Check, RefreshCcw, Loader2, Sliders } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ParsedMT5Report } from '@/types/mt5reportgenie';
import { toast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';

interface StrategyOptimizerProps {
  data: ParsedMT5Report | undefined;
  onClose: () => void;
}

interface Parameter {
  name: string;
  type: 'float' | 'integer' | 'boolean';
  current: number | boolean;
  min?: number;
  max?: number;
  step?: number;
  include: boolean;
}

interface OptimizationResult {
  id: number;
  params: Record<string, number | boolean>;
  profitFactor: number;
  netProfit: number;
  maxDrawdown: number;
  tradesCount: number;
  winRate: number;
  sortino: number;
  score: number;
}

const StrategyOptimizer: React.FC<StrategyOptimizerProps> = ({ data, onClose }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationTarget, setOptimizationTarget] = useState<'profitFactor' | 'netProfit' | 'sortino'>('profitFactor');
  const [results, setResults] = useState<OptimizationResult[] | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [iterations, setIterations] = useState(200);
  
  // Default parameters (in a real system, these would come from the strategy's actual params)
  const [parameters, setParameters] = useState<Parameter[]>([
    { name: 'Take Profit', type: 'integer', current: 50, min: 10, max: 100, step: 5, include: true },
    { name: 'Stop Loss', type: 'integer', current: 30, min: 10, max: 60, step: 5, include: true },
    { name: 'MA Period', type: 'integer', current: 20, min: 5, max: 50, step: 1, include: true },
    { name: 'RSI Period', type: 'integer', current: 14, min: 5, max: 30, step: 1, include: true },
    { name: 'RSI Overbought', type: 'integer', current: 70, min: 60, max: 90, step: 1, include: false },
    { name: 'RSI Oversold', type: 'integer', current: 30, min: 10, max: 40, step: 1, include: false },
    { name: 'Use Trailing Stop', type: 'boolean', current: true, include: true },
    { name: 'Weekend Trading', type: 'boolean', current: false, include: false }
  ]);

  // Generate optimization results
  const runOptimization = () => {
    if (!data) {
      toast({
        title: "Missing Data",
        description: "No strategy data is available for optimization",
        variant: "destructive"
      });
      return;
    }
    
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setResults(null);
    setSelectedResultId(null);
    
    // Simulation progress updates
    const progressInterval = setInterval(() => {
      setOptimizationProgress(prev => {
        const next = prev + Math.random() * 15;
        return next > 100 ? 100 : next;
      });
    }, 500);
    
    // Simulated optimization process (in a real system, this would run actual optimizations)
    setTimeout(() => {
      clearInterval(progressInterval);
      setOptimizationProgress(100);
      
      // Generate synthetic results
      const generatedResults: OptimizationResult[] = Array.from({ length: 10 }, (_, i) => {
        // Generate varied parameters
        const params: Record<string, number | boolean> = {};
        parameters.forEach(param => {
          if (!param.include) {
            params[param.name] = param.current;
            return;
          }
          
          if (param.type === 'boolean') {
            params[param.name] = Math.random() > 0.5;
          } else {
            const range = (param.max || 100) - (param.min || 0);
            const variation = (Math.random() - 0.5) * range * 0.5;
            const numericCurrent = param.current as number;
            params[param.name] = Math.round((numericCurrent + variation) / (param.step || 1)) * (param.step || 1);
            
            // Clamp to min/max
            if (param.min !== undefined && (params[param.name] as number) < param.min) {
              params[param.name] = param.min;
            }
            if (param.max !== undefined && (params[param.name] as number) > param.max) {
              params[param.name] = param.max;
            }
          }
        });
        
        // Generate synthetic metrics
        // Best result is usually in the middle of the array (not first, not last)
        const optimality = i === 4 ? 1.0 : i === 5 ? 0.95 : Math.random() * 0.9;
        
        // Calculate metrics with randomness but favoring the target metric
        const profitFactor = 1.2 + optimality * 1.3;
        const netProfit = 1000 + optimality * 4000;
        const maxDrawdown = 800 - optimality * 400;
        const tradesCount = 150 + Math.floor(Math.random() * 100);
        const winRate = 45 + optimality * 25;
        const sortino = 0.8 + optimality * 1.7;
        
        // Calculate a score based on the optimization target
        let score;
        if (optimizationTarget === 'profitFactor') {
          score = profitFactor;
        } else if (optimizationTarget === 'netProfit') {
          score = netProfit / 1000; // Normalize
        } else {
          score = sortino;
        }
        
        return {
          id: i + 1,
          params,
          profitFactor,
          netProfit,
          maxDrawdown,
          tradesCount,
          winRate,
          sortino,
          score
        };
      });
      
      // Sort by the optimization target
      generatedResults.sort((a, b) => b.score - a.score);
      
      setResults(generatedResults);
      setSelectedResultId(generatedResults[0].id);
      
      setIsOptimizing(false);
      
      toast({
        title: "Optimization Complete",
        description: `Found ${generatedResults.length} parameter combinations. Best ${optimizationTarget}: ${generatedResults[0].score.toFixed(2)}`
      });
    }, 4000);
  };

  // Get selected result
  const selectedResult = results?.find(r => r.id === selectedResultId);
  
  // Select a parameter to update
  const handleParameterChange = (index: number, value: number | boolean) => {
    setParameters(prev => 
      prev.map((param, i) => 
        i === index ? { ...param, current: value } : param
      )
    );
  };
  
  // Toggle parameter inclusion in optimization
  const toggleParameterInclusion = (index: number) => {
    setParameters(prev => 
      prev.map((param, i) => 
        i === index ? { ...param, include: !param.include } : param
      )
    );
  };
  
  // Apply selected result as current parameters
  const applySelectedResult = () => {
    if (!selectedResult) return;
    
    setParameters(prev => 
      prev.map(param => ({
        ...param,
        current: selectedResult.params[param.name]
      }))
    );
    
    toast({
      title: "Parameters Applied",
      description: "The selected optimization result has been applied."
    });
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={() => !isOptimizing && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Sliders className="mr-2 h-5 w-5" />
            Strategy Optimizer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Parameter Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-3 text-sm font-medium text-muted-foreground">
                  <div>Parameter</div>
                  <div className="col-span-2">Value Range</div>
                  <div className="text-right">Include</div>
                </div>
                
                <Separator />
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {parameters.map((param, index) => (
                    <div key={param.name} className="grid grid-cols-4 gap-3 items-center">
                      <Label htmlFor={`param-${index}`} className="font-medium">
                        {param.name}
                      </Label>
                      
                      <div className="col-span-2">
                        {param.type === 'boolean' ? (
                          <Select
                            value={param.current ? "true" : "false"}
                            onValueChange={(val) => 
                              handleParameterChange(index, val === "true")
                            }
                            disabled={isOptimizing}
                          >
                            <SelectTrigger id={`param-${index}`}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Slider
                              id={`param-${index}`}
                              disabled={isOptimizing}
                              value={[param.current as number]}
                              min={param.min}
                              max={param.max}
                              step={param.step}
                              onValueChange={(val) => 
                                handleParameterChange(index, val[0])
                              }
                            />
                            <Input
                              type="number"
                              className="w-16"
                              value={param.current as number}
                              onChange={(e) => 
                                handleParameterChange(index, 
                                  isNaN(parseFloat(e.target.value)) 
                                    ? param.min || 0 
                                    : parseFloat(e.target.value)
                                )
                              }
                              disabled={isOptimizing}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <Switch
                          checked={param.include}
                          onCheckedChange={() => toggleParameterInclusion(index)}
                          disabled={isOptimizing}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Optimization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="optimization-target">Optimization Target</Label>
                  <Select
                    value={optimizationTarget}
                    onValueChange={(val: any) => setOptimizationTarget(val)}
                    disabled={isOptimizing}
                  >
                    <SelectTrigger id="optimization-target">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profitFactor">Profit Factor</SelectItem>
                      <SelectItem value="netProfit">Net Profit</SelectItem>
                      <SelectItem value="sortino">Sortino Ratio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="iterations">Iterations</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="iterations"
                      disabled={isOptimizing}
                      value={[iterations]}
                      min={50}
                      max={500}
                      step={50}
                      onValueChange={(val) => setIterations(val[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{iterations}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={runOptimization}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Start Optimization
                    </>
                  )}
                </Button>
                
                {isOptimizing && (
                  <div className="space-y-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${optimizationProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {Math.round(optimizationProgress)}% complete
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {results && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Optimization Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="table">
                  <TabsList className="mb-4">
                    <TabsTrigger value="table">Table View</TabsTrigger>
                    <TabsTrigger value="comparison">Parameter Comparison</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="table">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Profit Factor</TableHead>
                            <TableHead>Net Profit</TableHead>
                            <TableHead>Max DD</TableHead>
                            <TableHead>Win Rate</TableHead>
                            <TableHead>Trades</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((result) => (
                            <TableRow 
                              key={result.id} 
                              onClick={() => setSelectedResultId(result.id)}
                              className={`cursor-pointer ${selectedResultId === result.id ? 'bg-muted' : ''}`}
                            >
                              <TableCell>
                                {selectedResultId === result.id && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{result.profitFactor.toFixed(2)}</TableCell>
                              <TableCell>${result.netProfit.toFixed(0)}</TableCell>
                              <TableCell>${result.maxDrawdown.toFixed(0)}</TableCell>
                              <TableCell>{result.winRate.toFixed(1)}%</TableCell>
                              <TableCell>{result.tradesCount}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {result.score.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="comparison">
                    {selectedResult && (
                      <div className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Parameter Comparison</h3>
                          <div className="space-y-3">
                            {parameters.map(param => {
                              const originalValue = param.current;
                              const optimizedValue = selectedResult.params[param.name];
                              // Type guard to ensure we only compare numbers with numbers
                              const showArrow = typeof originalValue === 'number' && typeof optimizedValue === 'number' && 
                                                originalValue !== optimizedValue;
                              const isHigher = typeof originalValue === 'number' && typeof optimizedValue === 'number' && 
                                              optimizedValue > originalValue;

                              return (
                                <div key={param.name} className="grid grid-cols-3 gap-2">
                                  <div className="text-sm font-medium">{param.name}</div>
                                  <div className="text-sm">
                                    Original: <span className="font-semibold">{originalValue.toString()}</span>
                                  </div>
                                  <div className="text-sm">
                                    Optimized: <span className="font-semibold">{optimizedValue?.toString()}</span>
                                    {showArrow && (
                                      isHigher ? (
                                        <ArrowUp className="h-3 w-3 inline ml-1 text-green-500" />
                                      ) : (
                                        <ArrowDown className="h-3 w-3 inline ml-1 text-amber-500" />
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="p-3">
                            <div className="text-xs text-muted-foreground">Profit Factor</div>
                            <div className="text-xl font-semibold">{selectedResult.profitFactor.toFixed(2)}</div>
                          </Card>
                          <Card className="p-3">
                            <div className="text-xs text-muted-foreground">Net Profit</div>
                            <div className="text-xl font-semibold">${selectedResult.netProfit.toFixed(0)}</div>
                          </Card>
                          <Card className="p-3">
                            <div className="text-xs text-muted-foreground">Max Drawdown</div>
                            <div className="text-xl font-semibold">${selectedResult.maxDrawdown.toFixed(0)}</div>
                          </Card>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isOptimizing}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={applySelectedResult} 
            disabled={isOptimizing || !selectedResult}
          >
            <Settings className="h-4 w-4 mr-2" />
            Apply Selected Parameters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StrategyOptimizer;
