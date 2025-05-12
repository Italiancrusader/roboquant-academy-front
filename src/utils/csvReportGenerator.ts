import { StrategyReport, StrategyMetrics, TradeType } from '@/types/strategyreportgenie';

/**
 * Generates a CSV file from a StrategyReport object with detailed metrics
 * @param report The strategy report data
 * @returns CSV string content
 */
export function generateCsvReport(report: StrategyReport): string {
  if (!report) {
    return '';
  }

  let csvContent = '';
  
  // Section 1: Report Information
  csvContent += 'REPORT INFORMATION\n';
  csvContent += `Report ID,${report.id}\n`;
  csvContent += `File Name,${report.fileName}\n`;
  csvContent += `Generated Date,${new Date().toISOString()}\n\n`;
  
  // Section 2: Summary Metrics
  csvContent += 'SUMMARY METRICS\n';
  csvContent += formatMetricsForCsv(report.metrics);
  csvContent += '\n';
  
  // Section 3: Equity Curve
  csvContent += 'EQUITY CURVE\n';
  csvContent += 'Date,Equity,Drawdown,DrawdownPercent\n';
  
  if (report.equityCurve && report.equityCurve.length) {
    report.equityCurve.forEach(point => {
      const drawdownPercent = point.equity > 0 ? (point.drawdown / point.equity) * 100 : 0;
      csvContent += `${formatDate(point.date)},${point.equity.toFixed(2)},${point.drawdown.toFixed(2)},${drawdownPercent.toFixed(2)}\n`;
    });
  }
  csvContent += '\n';
  
  // Section 4: Monthly Returns
  csvContent += 'MONTHLY RETURNS\n';
  csvContent += 'Year,Month,Return (%),Number of Trades\n';
  
  if (report.monthlyReturns && report.monthlyReturns.length) {
    const monthlyTradeCount = calculateMonthlyTradeCount(report.trades);
    
    report.monthlyReturns.forEach(monthly => {
      const monthName = getMonthName(monthly.month);
      const tradeCount = monthlyTradeCount[`${monthly.year}-${monthly.month}`] || 0;
      csvContent += `${monthly.year},${monthName},${monthly.return.toFixed(2)},${tradeCount}\n`;
    });
  }
  csvContent += '\n';
  
  // Section 5: Weekday Performance
  csvContent += 'WEEKDAY PERFORMANCE\n';
  csvContent += 'Day,Return (%),Trades,Win Rate (%)\n';
  
  if (report.weekdayPerformance && report.weekdayPerformance.length) {
    report.weekdayPerformance.forEach(day => {
      csvContent += `${day.day},${day.return.toFixed(2)},${day.trades},${day.winRate.toFixed(2)}\n`;
    });
  }
  csvContent += '\n';
  
  // Section 6: Hourly Performance
  csvContent += 'HOURLY PERFORMANCE\n';
  csvContent += 'Hour,Return (%),Trades,Win Rate (%)\n';
  
  if (report.hourlyPerformance && report.hourlyPerformance.length) {
    report.hourlyPerformance.forEach(hour => {
      csvContent += `${hour.hour}:00,${hour.return.toFixed(2)},${hour.trades},${hour.winRate.toFixed(2)}\n`;
    });
  }
  csvContent += '\n';
  
  // Section 7: All Trades
  csvContent += 'TRADES\n';
  csvContent += formatTradesHeaderForCsv();
  
  if (report.trades && report.trades.length) {
    report.trades.forEach(trade => {
      csvContent += formatTradeForCsv(trade);
    });
  }
  
  return csvContent;
}

/**
 * Format metrics object as CSV rows
 */
function formatMetricsForCsv(metrics: StrategyMetrics): string {
  let csv = 'Metric,Value\n';
  
  // Performance metrics
  csv += `Total Net Profit,${formatNumber(metrics.totalNetProfit)}\n`;
  csv += `Gross Profit,${formatNumber(metrics.grossProfit)}\n`;
  csv += `Gross Loss,${formatNumber(metrics.grossLoss)}\n`;
  csv += `Profit Factor,${formatNumber(metrics.profitFactor)}\n`;
  csv += `Expected Payoff,${formatNumber(metrics.expectedPayoff)}\n`;
  csv += `CAGR (%),${formatNumber(metrics.cagr || 0)}\n`;
  csv += `Annualized Return (%),${formatNumber(metrics.annualizedReturn || 0)}\n`;
  
  // Risk metrics
  csv += `Absolute Drawdown,${formatNumber(metrics.absoluteDrawdown)}\n`;
  csv += `Maximum Drawdown,${formatNumber(metrics.maxDrawdown)}\n`;
  csv += `Relative Drawdown (%),${formatNumber(metrics.relativeDrawdown)}\n`;
  csv += `Recovery Factor,${formatNumber(metrics.recoveryFactor)}\n`;
  csv += `Value at Risk (95%),${formatNumber(metrics.var95 || 0)}\n`;
  csv += `Monte Carlo Expected Drawdown (95%),${formatNumber(metrics.mcDrawdownExpected95)}\n`;
  csv += `Monte Carlo Profitable (%),${formatNumber(metrics.mcProfitablePct)}\n`;
  csv += `Monte Carlo Ruin Probability,${formatNumber(metrics.mcRuinProbability)}\n`;
  
  // Trade statistics
  csv += `Total Trades,${metrics.tradesTotal}\n`;
  csv += `Long Trades,${metrics.tradesLong}\n`;
  csv += `Short Trades,${metrics.tradesShort}\n`;
  csv += `Win Rate (%),${formatNumber(metrics.winRate)}\n`;
  csv += `Average Trade Profit,${formatNumber(metrics.avgTradeProfit)}\n`;
  csv += `Average Winning Trade,${formatNumber(metrics.avgWinning)}\n`;
  csv += `Average Losing Trade,${formatNumber(metrics.avgLosing)}\n`;
  csv += `Largest Winning Trade,${formatNumber(metrics.largestWin)}\n`;
  csv += `Largest Losing Trade,${formatNumber(metrics.largestLoss)}\n`;
  csv += `Win/Loss Ratio,${formatNumber(metrics.winLossRatio || 0)}\n`;
  csv += `Expectancy,${formatNumber(metrics.expectancy || 0)}\n`;
  csv += `Trade Duration,${metrics.tradeDuration}\n`;
  
  // Streak analysis
  csv += `Max Consecutive Wins,${metrics.maxConsecutiveWins || 0}\n`;
  csv += `Max Consecutive Losses,${metrics.maxConsecutiveLosses || 0}\n`;
  csv += `Avg Consecutive Wins,${formatNumber(metrics.avgConsecutiveWins || 0)}\n`;
  csv += `Avg Consecutive Losses,${formatNumber(metrics.avgConsecutiveLosses || 0)}\n`;
  csv += `Max Win Streak Amount,${formatNumber(metrics.maxWinStreak?.amount || 0)}\n`;
  csv += `Max Loss Streak Amount,${formatNumber(metrics.maxLossStreak?.amount || 0)}\n`;
  
  // Additional costs
  csv += `Commission Total,${formatNumber(metrics.commissionTotal)}\n`;
  csv += `Swap Total,${formatNumber(metrics.swapTotal)}\n`;
  
  // Statistical metrics
  csv += `Return Mean (%),${formatNumber(metrics.returnMean)}\n`;
  csv += `Return Median (%),${formatNumber(metrics.returnMedian)}\n`;
  csv += `Return Skewness,${formatNumber(metrics.returnSkew)}\n`;
  csv += `Return Kurtosis,${formatNumber(metrics.returnKurtosis)}\n`;
  csv += `Tail Ratio,${formatNumber(metrics.tailRatio)}\n`;
  csv += `Autocorrelation,${formatNumber(metrics.autocorrelation || 0)}\n`;
  
  // Risk-adjusted metrics
  csv += `Sharpe Ratio,${formatNumber(metrics.sharpeRatio)}\n`;
  csv += `Sortino Ratio,${formatNumber(metrics.sortinoRatio)}\n`;
  csv += `Calmar Ratio,${formatNumber(metrics.calmarRatio)}\n`;

  return csv;
}

/**
 * Format trade header for CSV
 */
function formatTradesHeaderForCsv(): string {
  return 'Open Time,Order,Symbol,Type,Volume,Price,Stop Loss,Take Profit,Close Time,State,Comment,Profit,Swap,Commission,Duration\n';
}

/**
 * Format a single trade for CSV output
 */
function formatTradeForCsv(trade: TradeType): string {
  return `${formatDate(trade.openTime)},${trade.order},${trade.symbol},${trade.type},${trade.volume},${formatNumber(trade.price)},${trade.stopLoss ? formatNumber(trade.stopLoss) : ''},${trade.takeProfit ? formatNumber(trade.takeProfit) : ''},${formatDate(trade.closeTime)},${trade.state},${sanitizeCSVField(trade.comment)},${formatNumber(trade.profit)},${formatNumber(trade.swap)},${formatNumber(trade.commission)},${trade.duration}\n`;
}

/**
 * Format a date object as a string for CSV
 */
function formatDate(date: Date): string {
  if (!date) return '';
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Format a number for CSV with 2 decimal places
 */
function formatNumber(num: number): string {
  if (num === undefined || num === null) return '';
  return Number(num).toFixed(2);
}

/**
 * Sanitize a field for CSV format
 */
function sanitizeCSVField(field: string): string {
  if (!field) return '';
  // If field contains comma, quote, or newline, wrap in quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Double up any quotes
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return field;
}

/**
 * Get month name from month number (1-12)
 */
function getMonthName(month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month - 1] || '';
}

/**
 * Calculate the number of trades per month
 */
function calculateMonthlyTradeCount(trades: TradeType[]): Record<string, number> {
  const monthlyCount: Record<string, number> = {};
  
  trades.forEach(trade => {
    if (trade.closeTime) {
      const year = trade.closeTime.getFullYear();
      const month = trade.closeTime.getMonth() + 1;
      const key = `${year}-${month}`;
      
      if (!monthlyCount[key]) {
        monthlyCount[key] = 0;
      }
      
      monthlyCount[key]++;
    }
  });
  
  return monthlyCount;
}

/**
 * Generate a CSV file and trigger a download
 */
export function downloadCsvReport(report: StrategyReport, filename: string = 'strategy-report.csv'): void {
  if (!report) return;
  
  const csvContent = generateCsvReport(report);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 