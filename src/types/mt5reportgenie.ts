
export interface FileType {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  dateUploaded: Date;
  parsedData?: ParsedMT5Report;
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
  dealId?: string;
  symbol: string;
  type?: string;      // Added type field (buy, sell, balance)
  direction?: "in" | "out"; // Ensuring consistent type with StrategyTrade
  side?: 'buy' | 'sell'; // Keep for backward compatibility
  volumeLots: number;
  priceOpen: number;
  stopLoss: number | null;
  takeProfit: number | null;
  timeFlag: Date;
  state: string;
  comment: string;
  profit?: number;
  balance?: number;
  commission?: number; // Added commission field
  swap?: number;       // Added swap field
}

export interface MT5Summary {
  [key: string]: number | string;
}

export interface ParsedMT5Report {
  summary: MT5Summary;
  trades: MT5Trade[];
  csvUrl: string;
}
