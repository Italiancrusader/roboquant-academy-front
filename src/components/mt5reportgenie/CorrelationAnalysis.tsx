
import React from 'react';
import { MT5Trade } from '@/types/mt5reportgenie';
import { Card } from '@/components/ui/card';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  Cell,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CorrelationAnalysisProps {
  trades: MT5Trade[];
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({ trades }) => {
  // Extract symbols from trades
  const symbols = React.useMemo(() => {
    const uniqueSymbols = new Set<string>();
    
    trades.forEach(trade => {
      if (trade.symbol) {
        uniqueSymbols.add(trade.symbol);
      }
    });
    
    return Array.from(uniqueSymbols);
  }, [trades]);
  
  // Group trades by day and symbol for correlation analysis
  const symbolDailyProfits = React.useMemo(() => {
    if (symbols.length === 0) return {};
    
    // Group trades by date and symbol
    const groupedByDate: Record<string, Record<string, number>> = {};
    
    trades.forEach(trade => {
      if (!trade.symbol || !trade.profit || trade.direction !== 'out') return;
      
      const date = new Date(trade.timeFlag || trade.openTime).toISOString().split('T')[0];
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = {};
      }
      
      if (!groupedByDate[date][trade.symbol]) {
        groupedByDate[date][trade.symbol] = 0;
      }
      
      groupedByDate[date][trade.symbol] += trade.profit;
    });
    
    return groupedByDate;
  }, [trades, symbols]);
  
  // Calculate correlation between symbols
  const symbolCorrelations = React.useMemo(() => {
    if (symbols.length <= 1) return [];
    
    // Prepare arrays of daily profits for each symbol
    const symbolProfits: Record<string, number[]> = {};
    const dates = Object.keys(symbolDailyProfits).sort();
    
    symbols.forEach(symbol => {
      symbolProfits[symbol] = dates.map(date => 
        symbolDailyProfits[date][symbol] || 0
      );
    });
    
    // Calculate correlation coefficient between each pair of symbols
    const correlations: Array<{
      symbolA: string;
      symbolB: string;
      correlation: number;
      tradesA: number;
      tradesB: number;
    }> = [];
    
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbolA = symbols[i];
        const symbolB = symbols[j];
        
        const profitsA = symbolProfits[symbolA];
        const profitsB = symbolProfits[symbolB];
        
        // Count non-zero entries (active trading days)
        const tradesA = profitsA.filter(p => p !== 0).length;
        const tradesB = profitsB.filter(p => p !== 0).length;
        
        // Only calculate correlation if both symbols have sufficient data
        if (tradesA > 3 && tradesB > 3) {
          // Calculate Pearson correlation coefficient
          const correlation = calculateCorrelation(profitsA, profitsB);
          
          correlations.push({
            symbolA,
            symbolB,
            correlation,
            tradesA,
            tradesB,
          });
        }
      }
    }
    
    // Sort by absolute correlation value (descending)
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [symbols, symbolDailyProfits]);
  
  // Generate scatter plot data for symbol pair correlation visualization
  const getScatterData = (symbolA: string, symbolB: string) => {
    const data: Array<{ x: number; y: number; date: string }> = [];
    
    Object.entries(symbolDailyProfits).forEach(([date, profits]) => {
      const profitA = profits[symbolA] || 0;
      const profitB = profits[symbolB] || 0;
      
      // Only include days where both symbols had trades
      if (profitA !== 0 || profitB !== 0) {
        data.push({
          x: profitA,
          y: profitB,
          date,
        });
      }
    });
    
    return data;
  };
  
  // Calculate Pearson correlation coefficient between two arrays
  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    
    // Calculate means
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate variances and covariance
    let ssX = 0;
    let ssY = 0;
    let ssXY = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      
      ssX += xDiff * xDiff;
      ssY += yDiff * yDiff;
      ssXY += xDiff * yDiff;
    }
    
    // Calculate correlation coefficient
    const correlation = ssX > 0 && ssY > 0 ? ssXY / Math.sqrt(ssX * ssY) : 0;
    
    return Math.round(correlation * 1000) / 1000; // Round to 3 decimal places
  };

  // Select top correlation for visualization
  const topCorrelation = symbolCorrelations.length > 0 ? symbolCorrelations[0] : null;
  const scatterData = topCorrelation 
    ? getScatterData(topCorrelation.symbolA, topCorrelation.symbolB) 
    : [];
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Get color based on correlation value
  const getCorrelationColor = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    
    if (absCorrelation > 0.7) {
      return correlation > 0 ? 'text-green-600' : 'text-red-600';
    } else if (absCorrelation > 0.3) {
      return correlation > 0 ? 'text-green-500' : 'text-red-500';
    } else {
      return 'text-yellow-500';
    }
  };
  
  // Get description of correlation strength
  const getCorrelationStrength = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    
    if (absCorrelation > 0.8) {
      return 'Very Strong';
    } else if (absCorrelation > 0.6) {
      return 'Strong';
    } else if (absCorrelation > 0.4) {
      return 'Moderate';
    } else if (absCorrelation > 0.2) {
      return 'Weak';
    } else {
      return 'Very Weak';
    }
  };
  
  // Chart configuration
  const config = {
    correlation: {
      label: 'Symbol Correlation',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Correlation Analysis</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Analyzing relationships between different trading instruments to identify diversification opportunities and risk factors.
        </p>
      </div>
      
      {topCorrelation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Correlation Scatter Plot */}
          <Card className="p-5">
            <h3 className="text-base font-medium mb-4">
              {topCorrelation.symbolA} vs {topCorrelation.symbolB} Correlation
            </h3>
            <div className="text-sm mb-2">
              <span>Correlation Coefficient: </span>
              <span className={`font-bold ${getCorrelationColor(topCorrelation.correlation)}`}>
                {topCorrelation.correlation.toFixed(3)} 
              </span>
              <span className="text-xs ml-2 text-muted-foreground">
                ({getCorrelationStrength(topCorrelation.correlation)})
              </span>
            </div>
            <div className="h-[300px]">
              <ChartContainer config={config}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={topCorrelation.symbolA}
                      domain={['dataMin', 'dataMax']}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={formatCurrency}
                      label={{ 
                        value: topCorrelation.symbolA, 
                        position: 'insideBottom', 
                        offset: -5,
                        fill: "hsl(var(--muted-foreground))" 
                      }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={topCorrelation.symbolB}
                      domain={['dataMin', 'dataMax']}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={formatCurrency}
                      label={{ 
                        value: topCorrelation.symbolB, 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: "hsl(var(--muted-foreground))" 
                      }}
                    />
                    <ZAxis range={[50, 400]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-xl">
                            <div className="text-sm font-medium mb-1">
                              {new Date(data.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">{topCorrelation.symbolA}:</span> {formatCurrency(data.x)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">{topCorrelation.symbolB}:</span> {formatCurrency(data.y)}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Scatter
                      name="Correlation"
                      data={scatterData}
                      fill="hsl(var(--primary))"
                    >
                      {scatterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.x * entry.y > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                          fillOpacity={0.7}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Each point represents daily P/L of both symbols. 
              Strong correlation suggests similar market behavior.
            </div>
          </Card>
          
          {/* Correlation Table */}
          <Card className="p-5">
            <h3 className="text-base font-medium mb-4">Top Symbol Correlations</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol Pair</TableHead>
                    <TableHead className="text-right">Correlation</TableHead>
                    <TableHead className="text-right">Strength</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {symbolCorrelations.slice(0, 8).map((correlation, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {correlation.symbolA} / {correlation.symbolB}
                      </TableCell>
                      <TableCell className={`text-right ${getCorrelationColor(correlation.correlation)}`}>
                        {correlation.correlation.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getCorrelationStrength(correlation.correlation)}
                      </TableCell>
                      <TableCell className="text-right">
                        {correlation.tradesA}/{correlation.tradesB}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-green-500">Positive correlation:</strong> Instruments tend to move in the same direction</li>
                <li><strong className="text-red-500">Negative correlation:</strong> Instruments tend to move in opposite directions</li>
                <li><strong className="text-yellow-500">Low correlation:</strong> Potential diversification benefit</li>
              </ul>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">
            Insufficient data to perform correlation analysis. 
            Need more trades across multiple instruments.
          </p>
        </Card>
      )}
    </div>
  );
};

export default CorrelationAnalysis;
