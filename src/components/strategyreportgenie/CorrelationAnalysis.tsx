
import React from 'react';
import { StrategyTrade } from '@/types/strategyreportgenie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ZAxis
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Target, Network, GitBranch } from 'lucide-react';

interface CorrelationAnalysisProps {
  trades: StrategyTrade[];
}

interface SymbolPair {
  symbol1: string;
  symbol2: string;
  correlation: number;
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({ trades }) => {
  // Get completed trades
  const completedTrades = React.useMemo(() => 
    trades.filter(t => 
      t.profit !== undefined && 
      t.direction === 'out' && 
      t.type !== 'balance' && 
      t.type !== ''
    ), [trades]);
  
  // Generate symbol performance data
  const symbolPerformance = React.useMemo(() => {
    if (!completedTrades.length) return [];
    
    // Group trades by symbol and date
    const tradesBySymbolAndDate = new Map();
    
    completedTrades.forEach(trade => {
      const symbol = trade.symbol || 'Unknown';
      const date = trade.openTime.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const key = `${symbol}-${date}`;
      
      if (!tradesBySymbolAndDate.has(key)) {
        tradesBySymbolAndDate.set(key, {
          symbol,
          date,
          profit: 0,
          count: 0
        });
      }
      
      const entry = tradesBySymbolAndDate.get(key);
      entry.profit += trade.profit || 0;
      entry.count++;
    });
    
    return Array.from(tradesBySymbolAndDate.values());
  }, [completedTrades]);
  
  // Generate symbol correlation
  const symbolCorrelation = React.useMemo(() => {
    if (!symbolPerformance.length) return [];
    
    // Get unique symbols
    const symbols = [...new Set(symbolPerformance.map(item => item.symbol))];
    
    if (symbols.length <= 1) return []; // Need at least 2 symbols for correlation
    
    // Create a map of symbol to its daily profits
    const symbolProfitsByDate = new Map();
    
    symbols.forEach(symbol => {
      symbolProfitsByDate.set(symbol, new Map());
    });
    
    // Fill in the profit data by date
    symbolPerformance.forEach(item => {
      const symbolMap = symbolProfitsByDate.get(item.symbol);
      if (symbolMap) {
        symbolMap.set(item.date, item.profit);
      }
    });
    
    // Calculate correlation between symbol pairs
    const correlations: SymbolPair[] = [];
    
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbol1 = symbols[i];
        const symbol2 = symbols[j];
        
        const symbol1Data = symbolProfitsByDate.get(symbol1);
        const symbol2Data = symbolProfitsByDate.get(symbol2);
        
        // Get common dates
        const commonDates = [...symbol1Data.keys()].filter(date => symbol2Data.has(date));
        
        if (commonDates.length < 3) continue; // Need at least 3 points for meaningful correlation
        
        // Prepare arrays for correlation
        const symbol1Profits = commonDates.map(date => symbol1Data.get(date));
        const symbol2Profits = commonDates.map(date => symbol2Data.get(date));
        
        // Calculate correlation coefficient
        const correlation = calculateCorrelation(symbol1Profits, symbol2Profits);
        
        correlations.push({
          symbol1,
          symbol2,
          correlation
        });
      }
    }
    
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [symbolPerformance]);
  
  // Generate scatter plot data
  const scatterData = React.useMemo(() => {
    if (!symbolCorrelation.length) return [];
    
    return symbolCorrelation.map(item => ({
      x: item.correlation,
      y: Math.abs(item.correlation),
      name: `${item.symbol1} vs ${item.symbol2}`,
      correlation: item.correlation
    }));
  }, [symbolCorrelation]);
  
  // Helper function to calculate correlation coefficient
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    
    if (n === 0) return 0;
    
    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate covariance and variances
    let covariance = 0;
    let varX = 0;
    let varY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      
      covariance += diffX * diffY;
      varX += diffX * diffX;
      varY += diffY * diffY;
    }
    
    // Handle zero variance case
    if (varX === 0 || varY === 0) return 0;
    
    // Calculate correlation coefficient
    return covariance / Math.sqrt(varX * varY);
  };
  
  // COLORS for the charts
  const getCorrelationColor = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation > 0.7) return '#FF0000'; // Strong correlation (red)
    if (absCorrelation > 0.5) return '#FFA500'; // Moderate correlation (orange)
    if (absCorrelation > 0.3) return '#FFFF00'; // Weak correlation (yellow)
    return '#00FF00'; // Very weak correlation (green)
  };

  if (symbolPerformance.length === 0 || symbolCorrelation.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          {completedTrades.length === 0 ? 
            "No trade data available for correlation analysis" : 
            "Insufficient data for correlation analysis. Need multiple symbols with overlapping trading dates."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Symbol Correlation Analysis</h2>
      
      <div className="space-y-6">
        {/* Symbol Correlation Scatter Plot */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" /> Symbol Correlation Map
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Correlation" 
                    domain={[-1, 1]} 
                    label={{
                      value: 'Correlation Coefficient',
                      position: 'bottom',
                      offset: 5
                    }}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Impact" 
                    domain={[0, 1]} 
                    hide 
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="y" 
                    range={[50, 400]} 
                    scale="linear" 
                  />
                  <Tooltip 
                    formatter={(value, name) => [Number(value).toFixed(2), name === 'x' ? 'Correlation' : 'Strength']}
                    labelFormatter={(label, payload) => payload[0]?.payload?.name || 'Symbol Pair'}
                  />
                  <Legend />
                  <Scatter 
                    name="Symbol Correlations" 
                    data={scatterData} 
                    fill="#8884d8"
                    shape={(props: any) => {
                      const { cx, cy, r } = props;
                      const correlation = props.payload.correlation;
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={r} 
                          fill={getCorrelationColor(correlation)}
                          opacity={0.7}
                        />
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Symbol Correlation Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="h-5 w-5" /> Symbol Correlation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              <p className="mb-1">Correlation interpretation:</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>0.7 to 1.0: Strong correlation</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                <span>0.5 to 0.7: Moderate correlation</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span>0.3 to 0.5: Weak correlation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                <span>0.0 to 0.3: Very weak or no correlation</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Symbol Pair</th>
                    <th className="text-left p-2 border-b">Correlation</th>
                    <th className="text-left p-2 border-b">Strength</th>
                    <th className="text-left p-2 border-b">Relationship</th>
                  </tr>
                </thead>
                <tbody>
                  {symbolCorrelation.slice(0, 10).map((item, index) => {
                    const absCorrelation = Math.abs(item.correlation);
                    let strength = 'Very weak';
                    if (absCorrelation > 0.7) strength = 'Strong';
                    else if (absCorrelation > 0.5) strength = 'Moderate';
                    else if (absCorrelation > 0.3) strength = 'Weak';
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                        <td className="p-2">{item.symbol1} vs {item.symbol2}</td>
                        <td className="p-2">{item.correlation.toFixed(2)}</td>
                        <td className="p-2">{strength}</td>
                        <td className="p-2">
                          {item.correlation > 0 ? 'Positive (move together)' : 'Negative (inverse move)'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {symbolCorrelation.length > 10 && (
                <p className="text-muted-foreground text-xs mt-2">
                  Showing top 10 correlations out of {symbolCorrelation.length} symbol pairs.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;
