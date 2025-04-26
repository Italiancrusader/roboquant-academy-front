
import React from 'react';
import { Card } from '@/components/ui/card';
import { MT5Trade } from '@/types/mt5reportgenie';

interface RiskMetricsProps {
  trades: MT5Trade[];
}

const RiskMetrics: React.FC<RiskMetricsProps> = ({ trades }) => {
  // Filter trades with profit data and that are "out" trades (completed)
  const completedTrades = trades.filter(t => t.profit !== undefined && t.direction === 'out');
  
  const metrics = React.useMemo(() => {
    const profitableTrades = completedTrades.filter(t => t.profit && t.profit > 0);
    const lossTrades = completedTrades.filter(t => t.profit && t.profit < 0);
    
    const totalProfit = profitableTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLoss = Math.abs(lossTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
    
    const winRate = completedTrades.length ? (profitableTrades.length / completedTrades.length) * 100 : 0;
    const profitFactor = totalLoss ? totalProfit / totalLoss : 0;
    
    const avgProfit = profitableTrades.length ? totalProfit / profitableTrades.length : 0;
    const avgLoss = lossTrades.length ? totalLoss / lossTrades.length : 0;
    
    // Calculate maximum drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    let balance = 0;
    
    // Find initial balance
    for (let i = 0; i < trades.length; i++) {
      if (trades[i].balance !== undefined) {
        balance = trades[i].balance;
        peak = balance;
        break;
      }
    }
    
    trades.forEach(trade => {
      if (trade.balance !== undefined) {
        balance = trade.balance;
        if (balance > peak) {
          peak = balance;
          currentDrawdown = 0;
        } else {
          currentDrawdown = peak - balance;
          if (currentDrawdown > maxDrawdown) {
            maxDrawdown = currentDrawdown;
          }
        }
      }
    });

    return {
      totalTrades: completedTrades.length,
      winningTrades: profitableTrades.length,
      losingTrades: lossTrades.length,
      winRate,
      profitFactor,
      averageWin: avgProfit,
      averageLoss: avgLoss,
      maxDrawdown,
      maxDrawdownPct: peak ? (maxDrawdown / peak) * 100 : 0,
    };
  }, [trades, completedTrades]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Risk & Performance Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Win Rate</h3>
          <div className="mt-2 text-2xl font-bold">
            {metrics.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.winningTrades} / {metrics.totalTrades} trades
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Profit Factor</h3>
          <div className="mt-2 text-2xl font-bold">
            {metrics.profitFactor.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Gross Profit / Gross Loss
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Max Drawdown</h3>
          <div className="mt-2 text-2xl font-bold">
            ${metrics.maxDrawdown.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.maxDrawdownPct.toFixed(1)}% of peak equity
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Average Win</h3>
          <div className="mt-2 text-2xl font-bold text-green-500">
            ${metrics.averageWin.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.winningTrades} winning trades
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Average Loss</h3>
          <div className="mt-2 text-2xl font-bold text-red-500">
            ${metrics.averageLoss.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.losingTrades} losing trades
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Reward/Risk</h3>
          <div className="mt-2 text-2xl font-bold">
            {(metrics.averageWin / metrics.averageLoss || 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg Win / Avg Loss
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RiskMetrics;
