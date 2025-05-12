import { StrategyTrade, MonthlyReturn } from '@/types/strategyreportgenie';

/**
 * Generate monthly returns from trades data
 */
export function generateMonthlyReturns(trades: StrategyTrade[]): MonthlyReturn[] {
  if (!trades.length) return [];
  
  // Create a map to track monthly performance
  const monthlyMap: Map<string, { profit: number; startBalance: number; endBalance: number }> = new Map();
  
  // Get the initial balance
  let initialBalance = 0;
  for (const trade of trades) {
    if (trade.balance !== undefined) {
      initialBalance = trade.balance;
      break;
    }
  }
  
  let currentBalance = initialBalance;
  let currentMonth = '';
  
  // Process trades chronologically
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = a.timeFlag || a.openTime;
    const dateB = b.timeFlag || b.openTime;
    return dateA.getTime() - dateB.getTime();
  });
  
  for (const trade of sortedTrades) {
    const tradeDate = trade.timeFlag || trade.openTime;
    const month = `${tradeDate.getFullYear()}-${(tradeDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Update balances based on trades
    if (trade.balance !== undefined) {
      currentBalance = trade.balance;
    } else if (trade.profit !== undefined) {
      currentBalance += trade.profit;
    }
    
    // If we've moved to a new month
    if (month !== currentMonth) {
      currentMonth = month;
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          profit: 0,
          startBalance: currentBalance,
          endBalance: currentBalance
        });
      }
    }
    
    // Update current month's data
    if (trade.profit !== undefined && monthlyMap.has(currentMonth)) {
      const monthData = monthlyMap.get(currentMonth)!;
      monthData.profit += trade.profit;
      monthData.endBalance = currentBalance;
      monthlyMap.set(currentMonth, monthData);
    }
  }
  
  // Convert the map to an array of monthly returns
  const results: MonthlyReturn[] = [];
  
  for (const [key, value] of monthlyMap.entries()) {
    const [yearStr, monthStr] = key.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    
    // Calculate percentage return
    const percentReturn = value.startBalance ? 
      ((value.endBalance - value.startBalance) / value.startBalance) * 100 : 0;
    
    results.push({
      year,
      month,
      return: percentReturn,
      profit: value.profit,
      startBalance: value.startBalance,
      endBalance: value.endBalance
    });
  }
  
  // Sort by year and month
  results.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  
  return results;
}

/**
 * Generate drawdown periods from equity curve
 */
export function findSignificantDrawdownPeriods(
  equityCurve: Array<{ date: Date; equity: number; drawdown: number }>,
  minDrawdownPercent: number = 5
): Array<{ start: Date; end: Date; amount: number; amountPct: number }> {
  if (!equityCurve.length) return [];
  
  const drawdownPeriods = [];
  let inDrawdown = false;
  let drawdownStart: Date | null = null;
  let drawdownPeak = 0;
  let maxDrawdownInPeriod = 0;
  
  for (let i = 0; i < equityCurve.length; i++) {
    const point = equityCurve[i];
    const drawdownPct = point.equity ? (point.drawdown / point.equity) * 100 : 0;
    
    if (!inDrawdown && drawdownPct >= minDrawdownPercent) {
      // Start of a drawdown period
      inDrawdown = true;
      drawdownStart = point.date;
      drawdownPeak = point.equity + point.drawdown;
      maxDrawdownInPeriod = point.drawdown;
    } else if (inDrawdown) {
      // Already in drawdown
      if (point.drawdown > maxDrawdownInPeriod) {
        maxDrawdownInPeriod = point.drawdown;
      }
      
      if (drawdownPct < minDrawdownPercent) {
        // End of drawdown period
        inDrawdown = false;
        
        if (drawdownStart) {
          const maxDrawdownPct = drawdownPeak ? (maxDrawdownInPeriod / drawdownPeak) * 100 : 0;
          
          drawdownPeriods.push({
            start: drawdownStart,
            end: point.date,
            amount: maxDrawdownInPeriod,
            amountPct: maxDrawdownPct
          });
          
          drawdownStart = null;
          maxDrawdownInPeriod = 0;
        }
      }
    }
  }
  
  // If still in drawdown at the end of the data
  if (inDrawdown && drawdownStart && equityCurve.length > 0) {
    const lastPoint = equityCurve[equityCurve.length - 1];
    const maxDrawdownPct = drawdownPeak ? (maxDrawdownInPeriod / drawdownPeak) * 100 : 0;
    
    drawdownPeriods.push({
      start: drawdownStart,
      end: lastPoint.date,
      amount: maxDrawdownInPeriod,
      amountPct: maxDrawdownPct
    });
  }
  
  return drawdownPeriods;
}

/**
 * Calculate win/loss distribution by day of week
 */
export function calculateDayOfWeekDistribution(trades: StrategyTrade[]): Array<{ 
  day: string; 
  totalTrades: number; 
  wins: number; 
  losses: number; 
  winRate: number;
  avgProfit: number;
}> {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats: { [key: string]: { totalTrades: number; wins: number; losses: number; totalProfit: number } } = {};
  
  // Initialize stats for each day
  for (const day of days) {
    dayStats[day] = { totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 };
  }
  
  // Process trades
  for (const trade of trades) {
    if (trade.profit === undefined || (!trade.openTime && !trade.timeFlag)) continue;
    
    const tradeDate = trade.timeFlag || trade.openTime;
    const dayOfWeek = days[tradeDate.getDay()];
    
    dayStats[dayOfWeek].totalTrades++;
    dayStats[dayOfWeek].totalProfit += trade.profit;
    
    if (trade.profit > 0) {
      dayStats[dayOfWeek].wins++;
    } else if (trade.profit < 0) {
      dayStats[dayOfWeek].losses++;
    }
  }
  
  // Convert to array and calculate additional metrics
  return days.map(day => {
    const stats = dayStats[day];
    return {
      day,
      totalTrades: stats.totalTrades,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.totalTrades ? (stats.wins / stats.totalTrades) * 100 : 0,
      avgProfit: stats.totalTrades ? stats.totalProfit / stats.totalTrades : 0
    };
  });
}

/**
 * Calculate win/loss distribution by hour of day
 */
export function calculateHourDistribution(trades: StrategyTrade[]): Array<{
  hour: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgProfit: number;
}> {
  const hourStats: { [key: number]: { totalTrades: number; wins: number; losses: number; totalProfit: number } } = {};
  
  // Initialize stats for each hour
  for (let hour = 0; hour < 24; hour++) {
    hourStats[hour] = { totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 };
  }
  
  // Process trades
  for (const trade of trades) {
    if (trade.profit === undefined || (!trade.openTime && !trade.timeFlag)) continue;
    
    const tradeDate = trade.timeFlag || trade.openTime;
    const hour = tradeDate.getHours();
    
    hourStats[hour].totalTrades++;
    hourStats[hour].totalProfit += trade.profit;
    
    if (trade.profit > 0) {
      hourStats[hour].wins++;
    } else if (trade.profit < 0) {
      hourStats[hour].losses++;
    }
  }
  
  // Convert to array and calculate additional metrics
  return Object.keys(hourStats).map(hourStr => {
    const hour = parseInt(hourStr);
    const stats = hourStats[hour];
    return {
      hour,
      totalTrades: stats.totalTrades,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.totalTrades ? (stats.wins / stats.totalTrades) * 100 : 0,
      avgProfit: stats.totalTrades ? stats.totalProfit / stats.totalTrades : 0
    };
  }).sort((a, b) => a.hour - b.hour);
}

/**
 * Calculate win/loss distribution by month
 */
export function calculateMonthDistribution(trades: StrategyTrade[]): Array<{
  month: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgProfit: number;
}> {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthStats: { [key: string]: { totalTrades: number; wins: number; losses: number; totalProfit: number } } = {};
  
  // Initialize stats for each month
  for (const month of months) {
    monthStats[month] = { totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 };
  }
  
  // Process trades
  for (const trade of trades) {
    if (trade.profit === undefined || (!trade.openTime && !trade.timeFlag)) continue;
    
    const tradeDate = trade.timeFlag || trade.openTime;
    const month = months[tradeDate.getMonth()];
    
    monthStats[month].totalTrades++;
    monthStats[month].totalProfit += trade.profit;
    
    if (trade.profit > 0) {
      monthStats[month].wins++;
    } else if (trade.profit < 0) {
      monthStats[month].losses++;
    }
  }
  
  // Convert to array and calculate additional metrics
  return months.map(month => {
    const stats = monthStats[month];
    return {
      month,
      totalTrades: stats.totalTrades,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.totalTrades ? (stats.wins / stats.totalTrades) * 100 : 0,
      avgProfit: stats.totalTrades ? stats.totalProfit / stats.totalTrades : 0
    };
  });
}
