
// Define types for strategy trades
export interface StrategyTrade {
  openTime: Date;
  timeFlag?: Date;
  order: number;
  dealId?: string;
  symbol: string;
  type?: string;
  direction?: string;
  side?: 'buy' | 'sell';
  volumeLots: number;
  priceOpen: number;
  stopLoss: number | null;
  takeProfit: number | null;
  state: string;
  comment: string;
  profit?: number;
  balance?: number;
  commission?: number;
  swap?: number;
}

// Define strategy metrics
export interface StrategyMetrics {
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
  
  mcDrawdownExpected95: number;
  mcProfitablePct: number;
  mcRuinProbability: number;
  
  // Optional properties that may be used
  cagr?: number;
  annualizedReturn?: number;
  var95?: number;
  winLossRatio?: number;
  expectancy?: number;
  maxConsecutiveWins?: number;
  maxConsecutiveLosses?: number;
  avgConsecutiveWins?: number;
  avgConsecutiveLosses?: number;
  maxWinStreak?: { count: number; amount: number };
  maxLossStreak?: { count: number; amount: number };
  autocorrelation?: number;
}

// For backwards compatibility with any code that expects TradeType
export interface TradeType {
  openTime: Date;
  order: number;
  symbol: string;
  type: string;
  volume: number;
  price: number;
  stopLoss: number | null;
  takeProfit: number | null;
  closeTime: Date;
  state: string;
  comment: string;
  profit: number;
  swap: number;
  commission: number;
  duration: string;
}

export interface TimeAggregation {
  period: string;
  return: number;
  trades: number;
  winRate: number;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
  profit?: number;
  startBalance?: number;
  endBalance?: number;
}

export interface WeekdayPerformance {
  day: string;
  return: number;
  trades: number;
  winRate: number;
}

export interface HourlyPerformance {
  hour: number;
  return: number;
  trades: number;
  winRate: number;
}

export interface StrategyReport {
  id: string;
  fileName: string;
  trades: TradeType[];
  metrics: StrategyMetrics;
  equityCurve: Array<{ date: Date; equity: number; drawdown: number }>;
  monthlyReturns: MonthlyReturn[];
  weekdayPerformance: WeekdayPerformance[];
  hourlyPerformance: HourlyPerformance[];
}
