export interface FileType {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  dateUploaded: Date;
}

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

export interface StrategyMetrics {
  // Basic metrics
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
  
  // Trade statistics
  tradesTotal: number;
  tradesShort: number;
  tradesLong: number;
  winRate: number;
  avgTradeProfit: number;
  avgWinning: number;
  avgLosing: number;
  largestWin: number;
  largestLoss: number;
  
  // Additional metrics
  recoveryFactor: number;
  tradeDuration: string;
  commissionTotal: number;
  swapTotal: number;
  
  // Distribution
  returnMean: number;
  returnMedian: number;
  returnSkew: number;
  returnKurtosis: number;
  tailRatio: number;
  
  // Monte Carlo
  mcDrawdownExpected95: number;
  mcProfitablePct: number;
  mcRuinProbability: number;
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

export interface MT5Trade {
  openTime: Date;
  order: number;
  symbol: string;
  side?: 'buy' | 'sell';
  volumeLots: number;
  priceOpen: number;
  stopLoss: number | null;
  takeProfit: number | null;
  timeFlag: Date;
  state: string;
  comment: string;
  profit?: number;
  balance?: number;
}

export interface MT5Summary {
  [key: string]: number | string;
}

export interface ParsedMT5Report {
  summary: MT5Summary;
  trades: MT5Trade[];
  csvUrl: string;
}
