import { ParsedStrategyReport, StrategyTrade, StrategySummary } from '@/types/strategyreportgenie';

/**
 * Parse CSV content into a structured format
 * @param csvContent CSV content as a string
 * @returns Parsed strategy report data
 */
export const parseCSVContent = (csvContent: string): ParsedStrategyReport => {
  // Split by lines and remove any empty rows
  const rows = csvContent.split('\n')
    .map(row => row.trim())
    .filter(row => row.length > 0)
    .map(row => row.split(',').map(cell => cell.trim()));
  
  const headers = rows[0] || [];
  const data = rows.slice(1).filter(row => row.length >= Math.min(headers.length, 5));

  // Check for common CSV formats
  const isMT5Format = headers.some(h => h === 'Deal' || h === 'Time');
  
  // Extract trades from CSV
  const trades: StrategyTrade[] = [];
  
  try {
    if (isMT5Format) {
      // MT5 Format (Time,Deal,Symbol,Type,Direction,Volume,Price,Order,Commission,Swap,Profit,Balance,Comment)
      trades.push(...parseMT5Format(headers, data));
    } else {
      // Default/general format parser
      trades.push(...parseGeneralFormat(headers, data));
    }
  } catch (error) {
    console.error('Error parsing CSV format:', error);
  }
  
  // Calculate summary statistics
  const summary = calculateSummary(trades);
  
  return {
    summary,
    trades,
    csvUrl: URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' })),
    source: detectSource(headers, csvContent)
  };
};

/**
 * Parse MT5 CSV format
 */
const parseMT5Format = (headers: string[], data: string[][]): StrategyTrade[] => {
  // Find column indices
  const timeIndex = headers.findIndex(h => h === 'Time');
  const dealIndex = headers.findIndex(h => h === 'Deal');
  const symbolIndex = headers.findIndex(h => h === 'Symbol');
  const typeIndex = headers.findIndex(h => h === 'Type');
  const directionIndex = headers.findIndex(h => h === 'Direction');
  const volumeIndex = headers.findIndex(h => h === 'Volume');
  const priceIndex = headers.findIndex(h => h === 'Price');
  const orderIndex = headers.findIndex(h => h === 'Order');
  const commissionIndex = headers.findIndex(h => h === 'Commission');
  const swapIndex = headers.findIndex(h => h === 'Swap');
  const profitIndex = headers.findIndex(h => h === 'Profit');
  const balanceIndex = headers.findIndex(h => h === 'Balance');
  const commentIndex = headers.findIndex(h => h === 'Comment');
  
  return data.map(row => {
    // Parse date from MT5 format: "2023.03.15 09:30:00"
    const timeStr = timeIndex >= 0 ? row[timeIndex] : '';
    const openTime = parseDate(timeStr);
    
    // Determine direction (can be "in", "out" or explicitly "buy"/"sell")
    const direction = directionIndex >= 0 ? row[directionIndex].toLowerCase() : '';
    const type = typeIndex >= 0 ? row[typeIndex].toLowerCase() : '';
    
    let tradeDirection = 'long';
    let tradeState = 'in';
    
    // Determine long/short and in/out from direction and type
    if (direction.includes('in') || direction === 'buy') {
      tradeDirection = 'long';
      tradeState = 'in';
    } else if (direction.includes('out') || direction === 'sell') {
      tradeDirection = 'short';
      tradeState = 'out';
    }
    
    // Adjust based on type if needed
    if (type.includes('buy') || type.includes('long')) {
      tradeDirection = 'long';
    } else if (type.includes('sell') || type.includes('short')) {
      tradeDirection = 'short';
    }
    
    // Parse numeric values safely
    const volume = parseFloat(volumeIndex >= 0 ? row[volumeIndex] : '0') || 0;
    const price = parseFloat(priceIndex >= 0 ? row[priceIndex] : '0') || 0;
    const profit = parseFloat(profitIndex >= 0 ? row[profitIndex] : '0') || 0;
    const balance = parseFloat(balanceIndex >= 0 ? row[balanceIndex] : '') || undefined;
    const commission = parseFloat(commissionIndex >= 0 ? row[commissionIndex] : '0') || 0;
    const swap = parseFloat(swapIndex >= 0 ? row[swapIndex] : '0') || 0;
    
    return {
      openTime,
      order: orderIndex >= 0 ? parseInt(row[orderIndex]) || 0 : 0,
      dealId: dealIndex >= 0 ? row[dealIndex] : '',
      symbol: symbolIndex >= 0 ? row[symbolIndex] : '',
      type: typeIndex >= 0 ? row[typeIndex] : '',
      direction,
      side: tradeDirection as 'long' | 'short',
      volumeLots: volume,
      priceOpen: price,
      stopLoss: null,
      takeProfit: null,
      timeFlag: openTime,
      state: tradeState as 'in' | 'out',
      comment: commentIndex >= 0 ? row[commentIndex] : '',
      profit,
      commission,
      swap,
      balance
    };
  });
};

/**
 * Parse general CSV format with more flexible header detection
 */
const parseGeneralFormat = (headers: string[], data: string[][]): StrategyTrade[] => {
  // Find column indices with more flexible matching
  const openTimeIndex = headers.findIndex(h => 
    h.toLowerCase().includes('open') && h.toLowerCase().includes('time') ||
    h.toLowerCase() === 'time' || h.toLowerCase() === 'date'
  );
  
  const orderIndex = headers.findIndex(h => 
    h.toLowerCase().includes('order') || 
    h.toLowerCase().includes('ticket') || 
    h.toLowerCase().includes('deal')
  );
  
  const symbolIndex = headers.findIndex(h => 
    h.toLowerCase().includes('symbol') || 
    h.toLowerCase().includes('instrument')
  );
  
  const typeIndex = headers.findIndex(h => 
    h.toLowerCase().includes('type') || 
    h.toLowerCase().includes('action')
  );
  
  const volumeIndex = headers.findIndex(h => 
    h.toLowerCase().includes('volume') || 
    h.toLowerCase().includes('lot') || 
    h.toLowerCase().includes('size')
  );
  
  const priceOpenIndex = headers.findIndex(h => 
    (h.toLowerCase().includes('price') && (h.toLowerCase().includes('open') || !h.toLowerCase().includes('close'))) || 
    h.toLowerCase() === 'price'
  );
  
  const profitIndex = headers.findIndex(h => 
    h.toLowerCase().includes('profit') || 
    h.toLowerCase().includes('pnl') || 
    h.toLowerCase().includes('net')
  );
  
  const commissionIndex = headers.findIndex(h => h.toLowerCase().includes('commission') || h.toLowerCase().includes('fee'));
  const swapIndex = headers.findIndex(h => h.toLowerCase().includes('swap') || h.toLowerCase().includes('rollover'));
  const commentIndex = headers.findIndex(h => h.toLowerCase().includes('comment') || h.toLowerCase().includes('note'));
  const directionIndex = headers.findIndex(h => h.toLowerCase().includes('direction') || h.toLowerCase().includes('side'));
  const balanceIndex = headers.findIndex(h => h.toLowerCase().includes('balance') || h.toLowerCase().includes('equity'));
  
  return data.map(row => {
    // Parse trade direction
    let side: 'long' | 'short' = 'long';
    let state: 'in' | 'out' = 'out';
    
    // Try to determine direction from type or direction column
    const typeValue = (typeIndex >= 0 ? row[typeIndex] : '').toLowerCase();
    const directionValue = (directionIndex >= 0 ? row[directionIndex] : '').toLowerCase();
    
    if (typeValue.includes('buy') || typeValue.includes('long') || directionValue.includes('buy') || directionValue.includes('long')) {
      side = 'long';
    } else if (typeValue.includes('sell') || typeValue.includes('short') || directionValue.includes('sell') || directionValue.includes('short')) {
      side = 'short';
    }
    
    // Determine in/out state
    if (directionValue.includes('in') || typeValue.includes('open')) {
      state = 'in';
    } else if (directionValue.includes('out') || typeValue.includes('close')) {
      state = 'out';
    }
    
    // Parse date from various formats
    const timeStr = openTimeIndex >= 0 ? row[openTimeIndex] : '';
    const openTime = parseDate(timeStr);
    
    // Parse numeric values safely
    const volume = parseFloat(volumeIndex >= 0 ? row[volumeIndex] : '0') || 0;
    const price = parseFloat(priceOpenIndex >= 0 ? row[priceOpenIndex] : '0') || 0;
    const profit = parseFloat(profitIndex >= 0 ? row[profitIndex] : '0') || 0;
    const balance = parseFloat(balanceIndex >= 0 ? row[balanceIndex] : '') || undefined;
    const commission = parseFloat(commissionIndex >= 0 ? row[commissionIndex] : '0') || 0;
    const swap = parseFloat(swapIndex >= 0 ? row[swapIndex] : '0') || 0;
    
    return {
      openTime,
      order: orderIndex >= 0 ? parseInt(row[orderIndex]) || 0 : 0,
      dealId: (orderIndex >= 0 ? row[orderIndex] : '').toString(),
      symbol: symbolIndex >= 0 ? row[symbolIndex] : '',
      type: typeIndex >= 0 ? row[typeIndex] : '',
      direction: directionIndex >= 0 ? row[directionIndex] : state,
      side,
      volumeLots: volume,
      priceOpen: price,
      stopLoss: null,
      takeProfit: null,
      timeFlag: openTime,
      state,
      comment: commentIndex >= 0 ? row[commentIndex] : '',
      profit,
      commission,
      swap,
      balance
    };
  });
};

/**
 * Parse date from various formats
 */
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  try {
    // Try parsing directly first
    const directDate = new Date(dateStr);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }
    
    // MT5 format: 2023.03.15 09:30:00
    if (dateStr.includes('.') && dateStr.includes(':')) {
      const [datePart, timePart] = dateStr.split(' ');
      const [year, month, day] = datePart.split('.').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
    }
    
    // Handle other common formats
    // MM/DD/YYYY or DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split(/[/ :]/);
      if (parts.length >= 3) {
        // Assume MM/DD/YYYY for now
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }
    
    // Fallback
    return new Date();
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return new Date();
  }
};

/**
 * Detect the source platform based on CSV headers and content
 */
const detectSource = (headers: string[], csvContent: string): 'MT4' | 'MT5' | 'TradingView' => {
  const headerStr = headers.join(' ').toLowerCase();
  
  if (headerStr.includes('deal') && (headerStr.includes('balance') || headerStr.includes('profit'))) {
    return 'MT5';
  } else if (headerStr.includes('ticket') && headerStr.includes('profit')) {
    return 'MT4';
  } else if (headerStr.includes('tradingview') || csvContent.toLowerCase().includes('tradingview')) {
    return 'TradingView';
  }
  
  // Default to MT5 if can't determine
  return 'MT5';
};

/**
 * Calculate summary statistics from trades
 */
const calculateSummary = (trades: StrategyTrade[]): StrategySummary => {
  // Find initial balance if available
  let initialBalance = 10000;
  let finalBalance = initialBalance;
  
  // Find the first trade with a balance
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].balance !== undefined) {
      initialBalance = trades[i].balance;
      break;
    }
  }
  
  // Find the last trade with a balance
  for (let i = trades.length - 1; i >= 0; i--) {
    if (trades[i].balance !== undefined) {
      finalBalance = trades[i].balance;
      break;
    }
  }

  const completed = trades.filter(t => t.state === 'out' || t.direction === 'out');
  const profitable = completed.filter(t => (t.profit || 0) > 0);
  const losing = completed.filter(t => (t.profit || 0) < 0);
  
  const totalProfit = completed.reduce((sum, t) => sum + (t.profit || 0), 0);
  const totalCommission = completed.reduce((sum, t) => sum + (t.commission || 0), 0);
  const totalSwap = completed.reduce((sum, t) => sum + (t.swap || 0), 0);
  
  const grossProfit = profitable.reduce((sum, t) => sum + (t.profit || 0), 0);
  const grossLoss = Math.abs(losing.reduce((sum, t) => sum + (t.profit || 0), 0));
  
  // Calculate drawdown
  const equityCurve = calculateEquityCurve(trades, initialBalance);
  const maxDrawdown = Math.max(...equityCurve.map(p => p.drawdownPct));
  
  // Calculate metrics
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  const winRate = completed.length > 0 ? (profitable.length / completed.length) * 100 : 0;
  
  // Average trade metrics
  const avgProfit = profitable.length > 0 ? grossProfit / profitable.length : 0;
  const avgLoss = losing.length > 0 ? grossLoss / losing.length : 0;
  const avgTrade = completed.length > 0 ? totalProfit / completed.length : 0;
  
  // Create summary object
  return {
    'Initial Balance': `$${initialBalance.toFixed(2)}`,
    'Final Balance': `$${finalBalance.toFixed(2)}`,
    'Total Net Profit': `$${totalProfit.toFixed(2)}`,
    'Gross Profit': `$${grossProfit.toFixed(2)}`,
    'Gross Loss': `$${grossLoss.toFixed(2)}`,
    'Profit Factor': profitFactor.toFixed(2),
    'Expected Payoff': avgTrade.toFixed(2),
    'Absolute Drawdown': `$${(maxDrawdown * initialBalance).toFixed(2)}`,
    'Maximal Drawdown': `$${(maxDrawdown * initialBalance).toFixed(2)} (${(maxDrawdown * 100).toFixed(2)}%)`,
    'Total Trades': completed.length.toString(),
    'Short Positions': completed.filter(t => t.side === 'short').length.toString(),
    'Long Positions': completed.filter(t => t.side === 'long').length.toString(),
    'Profit Trades': `${profitable.length} (${winRate.toFixed(2)}%)`,
    'Loss Trades': losing.length.toString(),
    'Largest Profit Trade': `$${Math.max(...profitable.map(t => t.profit || 0), 0).toFixed(2)}`,
    'Largest Loss Trade': `-$${Math.max(...losing.map(t => Math.abs(t.profit || 0)), 0).toFixed(2)}`,
    'Average Profit Trade': `$${avgProfit.toFixed(2)}`,
    'Average Loss Trade': `-$${avgLoss.toFixed(2)}`,
    'Maximum Consecutive Wins': calculateConsecutive(completed, true).toString(),
    'Maximum Consecutive Losses': calculateConsecutive(completed, false).toString(),
    'Total Commission': `$${totalCommission.toFixed(2)}`,
    'Total Swap': `$${totalSwap.toFixed(2)}`,
    'Strategy Name': 'Custom Trading Strategy'
  };
};

/**
 * Calculate consecutive wins/losses
 */
const calculateConsecutive = (trades: StrategyTrade[], countingWins: boolean): number => {
  let maxConsecutive = 0;
  let current = 0;
  
  for (const trade of trades) {
    const isWin = (trade.profit || 0) > 0;
    if (isWin === countingWins) {
      current++;
      maxConsecutive = Math.max(maxConsecutive, current);
    } else {
      current = 0;
    }
  }
  
  return maxConsecutive;
};

/**
 * Calculate equity curve and drawdown
 */
const calculateEquityCurve = (trades: StrategyTrade[], startBalance: number = 10000): Array<{date: Date, equity: number, drawdown: number, drawdownPct: number}> => {
  const result = [];
  let equity = startBalance;
  let peak = equity;
  const sortedTrades = [...trades].sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
  
  // Add initial point
  result.push({
    date: new Date(sortedTrades[0]?.openTime || new Date()),
    equity,
    drawdown: 0,
    drawdownPct: 0
  });
  
  // Calculate equity changes
  for (const trade of sortedTrades) {
    // Update equity based on balance if available or profit for completed trades
    if (trade.balance !== undefined) {
      equity = trade.balance;
    } else if ((trade.state === 'out' || trade.direction === 'out') && trade.profit !== undefined) {
      equity += trade.profit;
    } else {
      // Skip trades that don't affect equity
      continue;
    }
    
    if (equity > peak) {
      peak = equity;
    }
    
    const drawdown = peak - equity;
    const drawdownPct = peak > 0 ? drawdown / peak : 0;
    
    result.push({
      date: new Date(trade.timeFlag || trade.openTime),
      equity,
      drawdown,
      drawdownPct
    });
  }
  
  return result;
}; 