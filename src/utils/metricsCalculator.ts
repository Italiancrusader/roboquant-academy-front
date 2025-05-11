import { StrategyTrade } from '@/types/strategyreportgenie';

export interface CalculatedMetrics {
  totalNetProfit: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  expectedPayoff: number;
  absoluteDrawdown: number;
  maxDrawdown: number;
  relativeDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  tradesTotal: number;
  tradesShort: number;
  tradesLong: number;
  winRate: number;
  avgTradeProfit: number;
  avgWinning: number;
  avgLosing: number;
  largestWin: number;
  largestLoss: number;
  recoveryFactor: number;
  tradeDuration: string;
  commissionTotal: number;
  swapTotal: number;
  returnMean: number;
  returnMedian: number;
  returnSkew: number;
  returnKurtosis: number;
  tailRatio: number;
  initialBalance: number;
  finalBalance: number;
}

/**
 * Calculate trading metrics from an array of trades
 */
export function calculateMetrics(trades: StrategyTrade[]): CalculatedMetrics {
  if (!trades.length) {
    return getEmptyMetrics();
  }
  
  let initialBalance = 0;
  let finalBalance = 0;
  
  // Find initial balance
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].balance !== undefined) {
      initialBalance = trades[i].balance;
      break;
    }
  }
  
  // Find final balance
  for (let i = trades.length - 1; i >= 0; i--) {
    if (trades[i].balance !== undefined) {
      finalBalance = trades[i].balance;
      break;
    }
  }
  
  const totalNetProfit = finalBalance - initialBalance;
  
  // Filter trades with profit
  const profitableTrades = trades.filter(trade => trade.profit !== undefined && trade.profit > 0);
  const losingTrades = trades.filter(trade => trade.profit !== undefined && trade.profit < 0);
  const closedTrades = trades.filter(trade => trade.profit !== undefined);
  
  // Calculate total profits and losses
  const grossProfit = profitableTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0));
  
  // Calculate profit factor and win rate
  const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? 100 : 0;
  const winRate = profitableTrades.length / (closedTrades.length || 1) * 100;
  
  // Calculate expected payoff
  const expectedPayoff = closedTrades.length ? totalNetProfit / closedTrades.length : 0;
  
  // Drawdown calculations - requires equity curve
  const equityCurve = generateEquityCurve(trades);
  const { maxDrawdown, relativeDrawdown, absoluteDrawdown } = calculateDrawdowns(equityCurve);
  
  // Short vs Long trades
  const longTrades = trades.filter(t => t.side === 'long' && t.profit !== undefined);
  const shortTrades = trades.filter(t => t.side === 'short' && t.profit !== undefined);
  
  // Average profit/loss metrics
  const avgTradeProfit = closedTrades.length ? totalNetProfit / closedTrades.length : 0;
  const avgWinning = profitableTrades.length ? grossProfit / profitableTrades.length : 0;
  const avgLosing = losingTrades.length ? grossLoss / losingTrades.length * -1 : 0;
  
  // Largest win and loss
  const largestWin = profitableTrades.length ? Math.max(...profitableTrades.map(t => t.profit || 0)) : 0;
  const largestLoss = losingTrades.length ? Math.min(...losingTrades.map(t => t.profit || 0)) : 0;
  
  // Recovery factor
  const recoveryFactor = maxDrawdown ? totalNetProfit / maxDrawdown : 0;
  
  // Calculate average trade duration
  const tradeDuration = calculateAverageDuration(trades);
  
  // Calculate commissions and swaps
  const commissionTotal = trades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
  const swapTotal = trades.reduce((sum, trade) => sum + (trade.swap || 0), 0);
  
  // Advanced statistical metrics
  const returns = calculateReturns(trades);
  const returnMean = returns.length ? returns.reduce((sum, ret) => sum + ret, 0) / returns.length : 0;
  const returnMedian = calculateMedian(returns);
  const returnStdDev = calculateStandardDeviation(returns, returnMean);
  const returnSkew = calculateSkewness(returns, returnMean, returnStdDev);
  const returnKurtosis = calculateKurtosis(returns, returnMean, returnStdDev);
  
  // Risk-adjusted return metrics
  const sharpeRatio = calculateSharpeRatio(returnMean, returnStdDev);
  const sortinoRatio = calculateSortinoRatio(returns, returnMean);
  const calmarRatio = maxDrawdown ? totalNetProfit / maxDrawdown : 0;
  const tailRatio = calculateTailRatio(returns);
  
  return {
    totalNetProfit,
    grossProfit,
    grossLoss,
    profitFactor,
    expectedPayoff,
    absoluteDrawdown,
    maxDrawdown,
    relativeDrawdown,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    tradesTotal: closedTrades.length,
    tradesShort: shortTrades.length,
    tradesLong: longTrades.length,
    winRate,
    avgTradeProfit,
    avgWinning,
    avgLosing,
    largestWin,
    largestLoss,
    recoveryFactor,
    tradeDuration,
    commissionTotal,
    swapTotal,
    returnMean,
    returnMedian,
    returnSkew,
    returnKurtosis,
    tailRatio,
    initialBalance,
    finalBalance
  };
}

/**
 * Generate an equity curve from trades
 */
function generateEquityCurve(trades: StrategyTrade[]): { date: Date; equity: number; drawdown: number }[] {
  const result: { date: Date; equity: number; drawdown: number }[] = [];
  let equity = 0;
  let peakEquity = 0;
  let maxDrawdown = 0;
  
  // Find starting balance
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].balance !== undefined) {
      equity = trades[i].balance;
      peakEquity = equity;
      break;
    }
  }
  
  for (const trade of trades) {
    if (trade.balance !== undefined) {
      equity = trade.balance;
    } else if (trade.profit !== undefined) {
      equity += trade.profit;
    }
    
    if (equity > peakEquity) {
      peakEquity = equity;
    }
    
    const currentDrawdown = peakEquity - equity;
    maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    
    result.push({
      date: trade.openTime,
      equity,
      drawdown: currentDrawdown
    });
  }
  
  return result;
}

/**
 * Calculate drawdown metrics from an equity curve
 */
function calculateDrawdowns(equityCurve: { date: Date; equity: number; drawdown: number }[]) {
  if (!equityCurve.length) {
    return { maxDrawdown: 0, relativeDrawdown: 0, absoluteDrawdown: 0 };
  }
  
  let maxDrawdown = 0;
  let peakEquity = equityCurve[0].equity;
  let relativeDrawdown = 0;
  
  for (const point of equityCurve) {
    if (point.equity > peakEquity) {
      peakEquity = point.equity;
    }
    
    const currentDrawdown = peakEquity - point.equity;
    const currentRelativeDrawdown = peakEquity ? (currentDrawdown / peakEquity) * 100 : 0;
    
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
      relativeDrawdown = currentRelativeDrawdown;
    }
  }
  
  return {
    maxDrawdown,
    relativeDrawdown,
    absoluteDrawdown: maxDrawdown
  };
}

/**
 * Calculate average trade duration
 */
function calculateAverageDuration(trades: StrategyTrade[]): string {
  const closedTrades = trades.filter(trade => 
    trade.openTime && 
    trade.timeFlag && 
    trade.profit !== undefined
  );
  
  if (!closedTrades.length) return "0h 0m";
  
  const totalMinutes = closedTrades.reduce((sum, trade) => {
    const duration = (trade.timeFlag?.getTime() || 0) - (trade.openTime?.getTime() || 0);
    return sum + (duration / (1000 * 60)); // Convert to minutes
  }, 0);
  
  const avgMinutes = totalMinutes / closedTrades.length;
  const hours = Math.floor(avgMinutes / 60);
  const minutes = Math.floor(avgMinutes % 60);
  
  return `${hours}h ${minutes}m`;
}

/**
 * Calculate returns array from trades
 */
function calculateReturns(trades: StrategyTrade[]): number[] {
  const returns: number[] = [];
  const closedTrades = trades.filter(trade => trade.profit !== undefined);
  
  // Calculate trade returns as percentage of account equity
  let equity = 0;
  
  // Find starting balance
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].balance !== undefined) {
      equity = trades[i].balance;
      break;
    }
  }
  
  for (const trade of closedTrades) {
    if (trade.balance !== undefined) {
      equity = trade.balance;
    } else if (trade.profit !== undefined && equity > 0) {
      const returnPct = (trade.profit / equity) * 100;
      returns.push(returnPct);
      equity += trade.profit;
    }
  }
  
  return returns;
}

/**
 * Calculate median of an array of numbers
 */
function calculateMedian(values: number[]): number {
  if (!values.length) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
}

/**
 * Calculate standard deviation
 */
function calculateStandardDeviation(values: number[], mean: number): number {
  if (!values.length) return 0;
  
  const variance = values.reduce((sum, value) => {
    return sum + Math.pow(value - mean, 2);
  }, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Calculate skewness
 */
function calculateSkewness(values: number[], mean: number, stdDev: number): number {
  if (!values.length || stdDev === 0) return 0;
  
  const n = values.length;
  const sum = values.reduce((sum, value) => {
    return sum + Math.pow((value - mean) / stdDev, 3);
  }, 0);
  
  return sum * n / ((n - 1) * (n - 2));
}

/**
 * Calculate kurtosis
 */
function calculateKurtosis(values: number[], mean: number, stdDev: number): number {
  if (!values.length || stdDev === 0) return 0;
  
  const n = values.length;
  const sum = values.reduce((sum, value) => {
    return sum + Math.pow((value - mean) / stdDev, 4);
  }, 0);
  
  return sum * n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) - (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
}

/**
 * Calculate Sharpe ratio
 */
function calculateSharpeRatio(returnMean: number, returnStdDev: number): number {
  // Assuming risk-free rate of 0% for simplicity
  if (returnStdDev === 0) return returnMean > 0 ? 10 : 0;
  return returnMean / returnStdDev;
}

/**
 * Calculate Sortino ratio
 */
function calculateSortinoRatio(returns: number[], mean: number): number {
  // Downside deviation calculation
  const negativeReturns = returns.filter(r => r < 0);
  
  if (!negativeReturns.length) return mean > 0 ? 10 : 0;
  
  const downsideVariance = negativeReturns.reduce((sum, r) => {
    return sum + Math.pow(r, 2);
  }, 0) / negativeReturns.length;
  
  const downsideDeviation = Math.sqrt(downsideVariance);
  
  if (downsideDeviation === 0) return mean > 0 ? 10 : 0;
  return mean / downsideDeviation;
}

/**
 * Calculate tail ratio (ratio of 95th percentile to 5th percentile, in absolute terms)
 */
function calculateTailRatio(returns: number[]): number {
  if (returns.length < 20) return 1;
  
  const sorted = [...returns].sort((a, b) => a - b);
  const p5Index = Math.floor(returns.length * 0.05);
  const p95Index = Math.floor(returns.length * 0.95);
  
  const p5 = sorted[p5Index];
  const p95 = sorted[p95Index];
  
  if (p5 >= 0 || p95 <= 0) return 1;
  return Math.abs(p95 / p5);
}

/**
 * Return empty metrics object with default values
 */
function getEmptyMetrics(): CalculatedMetrics {
  return {
    totalNetProfit: 0,
    grossProfit: 0,
    grossLoss: 0,
    profitFactor: 0,
    expectedPayoff: 0,
    absoluteDrawdown: 0,
    maxDrawdown: 0,
    relativeDrawdown: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    calmarRatio: 0,
    tradesTotal: 0,
    tradesShort: 0,
    tradesLong: 0,
    winRate: 0,
    avgTradeProfit: 0,
    avgWinning: 0,
    avgLosing: 0,
    largestWin: 0,
    largestLoss: 0,
    recoveryFactor: 0,
    tradeDuration: "0h 0m",
    commissionTotal: 0,
    swapTotal: 0,
    returnMean: 0,
    returnMedian: 0,
    returnSkew: 0,
    returnKurtosis: 0,
    tailRatio: 0,
    initialBalance: 0,
    finalBalance: 0
  };
} 