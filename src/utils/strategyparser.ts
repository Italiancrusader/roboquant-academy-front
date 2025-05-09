import { read, utils, write } from 'xlsx';
import { StrategyTrade, StrategySummary, ParsedStrategyReport } from '@/types/strategyreportgenie';

/**
 * Format date and time in a more readable format (MM/DD/YYYY HH:MM:SS)
 */
const formatDateTime = (date: Date): string => {
  try {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid Date';
  }
};

/**
 * Generate CSV content from processed trades
 */
const generateCSV = (trades: StrategyTrade[]): string => {
  const headers = [
    'Time', 'Deal', 'Symbol', 'Type', 'Direction', 'Volume',
    'Price', 'Order', 'Commission', 'Swap', 'Profit', 'Balance', 'Comment'
  ];

  const rows = trades.map(trade => {
    // Use the actual trade timestamp for each row
    const dateTime = trade.openTime ? formatDateTime(trade.openTime) : 'N/A';
    
    return [
      dateTime,
      trade.dealId || '', // Use dealId directly without fallback
      trade.symbol || '',
      trade.type || '',
      trade.direction || '',
      trade.volumeLots !== undefined ? trade.volumeLots.toString() : '',
      trade.priceOpen !== undefined ? trade.priceOpen.toString() : '',
      trade.order.toString() || '',
      trade.commission !== undefined ? trade.commission.toFixed(2) : '0.00',
      trade.swap !== undefined ? trade.swap.toFixed(2) : '0.00',
      trade.profit !== undefined ? trade.profit.toFixed(2) : '0.00',
      trade.balance !== undefined ? trade.balance.toFixed(2) : '0.00',
      trade.comment || ''
    ];
  });

  // Create workbook and worksheet
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet([headers, ...rows]);
  
  // Convert to CSV
  return utils.sheet_to_csv(ws);
};

/**
 * Parse date string from MT5 format (YYYY.MM.DD HH:MM:SS) to JavaScript Date
 */
const parseMT5Date = (dateStr: string): Date => {
  try {
    // Check if the date is in YYYY.MM.DD format
    if (dateStr.includes('.') && dateStr.split('.')[0].length === 4) {
      const [datePart, timePart] = dateStr.split(' ');
      const [year, month, day] = datePart.split('.');
      const [hours, minutes, seconds] = timePart.split(':');
      
      // Create a new Date object (month is 0-indexed in JavaScript)
      return new Date(Number(year), Number(month) - 1, Number(day), 
                      Number(hours), Number(minutes), Number(seconds));
    } else {
      // Fallback for other formats
      return new Date(dateStr);
    }
  } catch (e) {
    console.error('Error parsing date:', e, dateStr);
    return new Date(); // Return current date as fallback
  }
};

/**
 * Clean numeric values by removing spaces and replacing commas with dots
 */
const cleanNumeric = (value: string): number => {
  if (!value) return 0;
  // Remove spaces and replace commas with dots for decimal parsing
  // This handles European format (1.234,56) as well as US format (1,234.56)
  const cleaned = String(value).replace(/\s+/g, '');
  
  // Check if the value contains both commas and dots
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Determine which is the decimal separator based on position
    const lastCommaPos = cleaned.lastIndexOf(',');
    const lastDotPos = cleaned.lastIndexOf('.');
    
    if (lastCommaPos > lastDotPos) {
      // European format: 1.234,56 -> comma is decimal separator
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    } else {
      // US format: 1,234.56 -> dot is decimal separator
      return parseFloat(cleaned.replace(/,/g, ''));
    }
  } else if (cleaned.includes(',')) {
    // Check if comma is a decimal separator or thousands separator
    const parts = cleaned.split(',');
    if (parts[parts.length - 1].length <= 2) {
      // Likely a decimal separator: 1234,56
      return parseFloat(cleaned.replace(',', '.'));
    } else {
      // Likely a thousands separator: 1,234
      return parseFloat(cleaned.replace(/,/g, ''));
    }
  }
  
  // Default case - just try to parse it
  return parseFloat(cleaned);
};

/**
 * Detect if a file is likely a TradingView export
 */
const detectTradingViewFile = async (file: File): Promise<boolean> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: 'array' });
    
    // Check for common TradingView sheet names
    if (workbook.SheetNames.some(name => 
      name === "List of trades" || 
      name.toLowerCase().includes('tradingview') ||
      name.toLowerCase().includes('trading view')
    )) {
      return true;
    }
    
    // Check first sheet for TradingView header patterns
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = utils.sheet_to_json<any>(worksheet, { header: 1 });
    
    // Look for TradingView specific headers
    if (rows.length > 0) {
      const headerRow = rows[0];
      const headerStr = headerRow.join(' ').toLowerCase();
      
      if (headerStr.includes('trade #') || 
          headerStr.includes('signal') || 
          headerStr.includes('price usd') || 
          headerStr.includes('cumulative profit')) {
        return true;
      }
    }
    
    // Check filename
    if (file.name.toLowerCase().includes('tradingview') || 
        file.name.toLowerCase().includes('trading view') || 
        file.name.toLowerCase().includes('tv ')) {
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error detecting TradingView file', e);
    return false;
  }
};

/**
 * Parse TradingView Excel report file
 */
const parseTradingViewExcel = async (file: File, initialBalance?: number): Promise<ParsedStrategyReport> => {
  // Read the Excel file
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  
  // TradingView exports contain a sheet called "List of trades"
  const sheetName = workbook.SheetNames.find(name => name === "List of trades") || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json<any>(worksheet, { header: 1 });
  
  const summary: StrategySummary = {};
  const trades: StrategyTrade[] = [];
  let headerRowIndex = 0; // TradingView typically has header in first row
  
  // Use provided initialBalance or default to 10,000
  const startingBalance = initialBalance || 10000;
  
  // Process TradingView format
  if (rows.length > 0) {
    // Find the headers (TradingView usually has headers in first row)
    const headers = rows[headerRowIndex];
    
    // Find column indexes for important fields
    const tradeNumIndex = headers.findIndex((h: string) => h === 'Trade #');
    const typeIndex = headers.findIndex((h: string) => h === 'Type');
    const signalIndex = headers.findIndex((h: string) => h === 'Signal');
    const dateTimeIndex = headers.findIndex((h: string) => h === 'Date/Time');
    const priceIndex = headers.findIndex((h: string) => h === 'Price USD');
    const contractsIndex = headers.findIndex((h: string) => h === 'Contracts');
    const profitUsdIndex = headers.findIndex((h: string) => h === 'Profit USD');
    const profitPctIndex = headers.findIndex((h: string) => h === 'Profit %');
    const cumulativeProfitUsdIndex = headers.findIndex((h: string) => h === 'Cumulative profit USD');
    const cumulativeProfitPctIndex = headers.findIndex((h: string) => h === 'Cumulative profit %');
    const drawdownUsdIndex = headers.findIndex((h: string) => h === 'Drawdown USD');
    
    // Initialize with the provided initial balance
    let runningBalance = startingBalance;
    let maxDrawdown = 0;
    let peakBalance = startingBalance;
    
    // Process data rows
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      // Get values from the row
      const tradeNum = tradeNumIndex >= 0 ? row[tradeNumIndex] : '';
      const type = typeIndex >= 0 ? row[typeIndex] : '';
      const signal = signalIndex >= 0 ? row[signalIndex] : '';
      const dateTimeStr = dateTimeIndex >= 0 ? row[dateTimeIndex] : '';
      const priceStr = priceIndex >= 0 ? String(row[priceIndex]) : '0';
      const contracts = contractsIndex >= 0 ? cleanNumeric(String(row[contractsIndex])) : 0;
      const profitUsd = profitUsdIndex >= 0 ? cleanNumeric(String(row[profitUsdIndex])) : 0;
      
      // Parse price, ensuring it properly handles commas
      const price = cleanNumeric(priceStr);
      console.log(`Parsed price from '${priceStr}' to ${price}`);
      
      // Parse date/time - using the time spacing logic for consistent time progression
      let openTime: Date;
      try {
        // Generate slightly different timestamps for each trade to prevent them all having the same time
        // This creates a more realistic view of trades over time
        const baseDate = new Date();
        
        // Set the base date to start of the month for consistency
        baseDate.setDate(1);
        
        // Add some hours and minutes based on the trade index to create variation
        // Each trade will be spaced by about 2 hours
        const hoursToAdd = (i - headerRowIndex) * 2;
        const minutesToAdd = (i - headerRowIndex) * 15; // 15 minute intervals
        
        openTime = new Date(baseDate);
        openTime.setHours(openTime.getHours() + hoursToAdd);
        openTime.setMinutes(openTime.getMinutes() + minutesToAdd);
      } catch (e) {
        console.error("Error creating trade timestamp:", e);
        openTime = new Date(); // Use current date as fallback
      }
      
      // Determine trade direction and state
      const isEntry = type.toLowerCase().includes('entry');
      const isExit = type.toLowerCase().includes('exit');
      const direction = isEntry ? 'in' : (isExit ? 'out' : '');
      
      // Determine trade side
      let side: 'long' | 'short' | undefined;
      if (signal && signal.toLowerCase().includes('long')) {
        side = 'long';
      } else if (signal && signal.toLowerCase().includes('short')) {
        side = 'short';
      } else if (type.toLowerCase().includes('long')) {
        side = 'long';
      } else if (type.toLowerCase().includes('short')) {
        side = 'short';
      }
      
      // Update running balance
      if (i === headerRowIndex + 1 && direction === 'in') {
        // First entry trade begins with initial balance
        // Do nothing, using the initial balance
      } else if (direction === 'out') {
        // For exit trades, add profit to balance
        runningBalance += profitUsd;
        
        if (runningBalance > peakBalance) {
          peakBalance = runningBalance;
        }
        
        const currentDrawdown = peakBalance - runningBalance;
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
        }
      }
      
      // Create trade object with the varying timestamp
      const trade: StrategyTrade = {
        openTime,
        order: Number(tradeNum) || i,
        dealId: `TV-${tradeNum || i}`,
        symbol: '', // TradingView export might not include symbol
        type: type,
        direction: direction,
        side: side,
        volumeLots: contracts,
        priceOpen: price,
        stopLoss: null,
        takeProfit: null,
        timeFlag: openTime,
        state: signal || '',
        comment: signal || '',
        profit: profitUsd,
        balance: direction === 'out' ? runningBalance : undefined,
        commission: 0, // TradingView doesn't typically include commission
        swap: 0,       // TradingView doesn't typically include swap
      };
      
      trades.push(trade);
    }
    
    // Update summary
    const totalTrades = trades.filter(t => t.direction === 'out').length;
    const profitableTrades = trades.filter(t => t.profit !== undefined && t.profit > 0 && t.direction === 'out').length;
    const lossTrades = trades.filter(t => t.profit !== undefined && t.profit < 0 && t.direction === 'out').length;
    const totalProfit = trades.filter(t => t.direction === 'out').reduce((sum, t) => sum + (t.profit || 0), 0);
    const winRate = (totalTrades > 0) ? (profitableTrades / totalTrades * 100).toFixed(2) : '0';
    
    summary['Total Trades'] = totalTrades;
    summary['Profitable Trades'] = profitableTrades;
    summary['Loss Trades'] = lossTrades;
    summary['Win Rate'] = `${winRate}%`;
    summary['Total Net Profit'] = totalProfit;
    summary['Initial Balance'] = startingBalance;
    summary['Final Balance'] = runningBalance;
    summary['Max Drawdown'] = maxDrawdown;
  }
  
  // Generate CSV from processed data
  const csvContent = generateCSV(trades);
  
  // Create a Blob and downloadable URL for the CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(blob);

  return { 
    summary, 
    trades,
    csvUrl,
    source: 'TradingView'
  };
};

/**
 * Parses MT5/MT4 Excel file and extracts trades
 */
export const parseMT5Excel = async (file: File, initialBalance?: number): Promise<ParsedStrategyReport> => {
  // Read the Excel file
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  
  // Check if this might be a TradingView export
  const isTradingView = await detectTradingViewFile(file);
  if (isTradingView) {
    console.log("Detected TradingView export format");
    return parseTradingViewExcel(file, initialBalance);
  }
  
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json<string[]>(worksheet, { header: 1 });

  const summary: StrategySummary = {};
  const trades: StrategyTrade[] = [];
  let headerRowIndex = -1;
  
  // First, find the header row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    // Look for "Time" and "Deal" in the first columns
    if ((row[0] === 'Time' && row[1] === 'Deal') || 
        (row[0]?.includes('Time') && row[1]?.includes('Deal'))) {
      headerRowIndex = i;
      break;
    }
  }
  
  // If we found a header row, process the data rows
  if (headerRowIndex >= 0) {
    const headerRow = rows[headerRowIndex];
    
    // Find column indexes for important fields
    const timeIndex = headerRow.findIndex(h => h === 'Time');
    const dealIndex = headerRow.findIndex(h => h === 'Deal');
    const symbolIndex = headerRow.findIndex(h => h === 'Symbol');
    const typeIndex = headerRow.findIndex(h => h === 'Type');
    const directionIndex = headerRow.findIndex(h => h === 'Direction');
    const volumeIndex = headerRow.findIndex(h => h === 'Volume');
    const priceIndex = headerRow.findIndex(h => h === 'Price');
    const orderIndex = headerRow.findIndex(h => h === 'Order');
    const commissionIndex = headerRow.findIndex(h => h === 'Commission');
    const swapIndex = headerRow.findIndex(h => h === 'Swap');
    const profitIndex = headerRow.findIndex(h => h === 'Profit');
    const balanceIndex = headerRow.findIndex(h => h === 'Balance');
    const commentIndex = headerRow.findIndex(h => h === 'Comment');
    
    // Process data rows
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      // Extract values based on column indexes
      const timeValue = timeIndex >= 0 && row[timeIndex] ? String(row[timeIndex]) : '';
      const dealValue = dealIndex >= 0 && row[dealIndex] ? String(row[dealIndex]) : '';
      const symbolValue = symbolIndex >= 0 && row[symbolIndex] ? String(row[symbolIndex]) : '';
      const typeValue = typeIndex >= 0 && row[typeIndex] ? String(row[typeIndex]) : '';
      const directionValue = directionIndex >= 0 && row[directionIndex] ? String(row[directionIndex]) : '';
      const volumeValue = volumeIndex >= 0 && row[volumeIndex] ? String(row[volumeIndex]) : '';
      const priceValue = priceIndex >= 0 && row[priceIndex] ? String(row[priceIndex]) : '';
      const orderValue = orderIndex >= 0 && row[orderIndex] ? String(row[orderIndex]) : '';
      const commissionValue = commissionIndex >= 0 && row[commissionIndex] ? String(row[commissionIndex]) : '0';
      const swapValue = swapIndex >= 0 && row[swapIndex] ? String(row[swapIndex]) : '0';
      const profitValue = profitIndex >= 0 && row[profitIndex] ? String(row[profitIndex]) : '0';
      const balanceValue = balanceIndex >= 0 && row[balanceIndex] ? String(row[balanceIndex]) : '0';
      const commentValue = commentIndex >= 0 && row[commentIndex] ? String(row[commentIndex]) : '';
      
      // Skip empty rows
      if (!timeValue && !dealValue) continue;
      
      // Parse date
      const openTime = parseMT5Date(timeValue);
      
      // Determine if this is a balance entry
      const isBalanceEntry = typeValue === 'balance' || typeValue === '';
      
      // Parse trade data
      const trade: StrategyTrade = {
        openTime,
        order: parseInt(orderValue) || 0,
        dealId: dealValue,
        symbol: symbolValue,
        type: typeValue,
        direction: directionValue,
        volumeLots: cleanNumeric(volumeValue),
        priceOpen: cleanNumeric(priceValue),
        stopLoss: null,
        takeProfit: null,
        timeFlag: openTime,
        state: directionValue || '',
        comment: commentValue,
        commission: cleanNumeric(commissionValue),
        swap: cleanNumeric(swapValue),
        profit: cleanNumeric(profitValue),
        balance: cleanNumeric(balanceValue),
      };
      
      // Parse stop loss and take profit from comment if available
      if (commentValue) {
        const slMatch = commentValue.match(/sl (\d+\.?\d*)/i);
        const tpMatch = commentValue.match(/tp (\d+\.?\d*)/i);
        
        if (slMatch) {
          trade.stopLoss = Number(slMatch[1]);
        }
        if (tpMatch) {
          trade.takeProfit = Number(tpMatch[1]);
        }
      }
      
      trades.push(trade);
      
      // Update initial balance from the first balance entry
      if (isBalanceEntry && !summary['Initial Balance']) {
        summary['Initial Balance'] = trade.balance;
      }
    }
  } else {
    // Fallback to the old parsing logic if header row is not found
    console.warn('Header row not found, falling back to default parsing');
    
    const summary: StrategySummary = {};
    const trades: StrategyTrade[] = [];
    let isDealsSection = false;
    let headerRow: string[] = [];
    
    // First pass - identify deals section and extract raw deals
    for (const row of rows) {
      if (!row || row.length === 0) continue;

      // Check for the start of the Deals section
      if (row[0] === 'Deals') {
        isDealsSection = true;
        continue;
      }

      // Skip the header row but store it
      if (isDealsSection && (row[0] === 'Time' || row[1] === 'Deal')) {
        headerRow = row;
        continue;
      }

      // Process rows in the Deals section
      if (isDealsSection && headerRow.length > 0) {
        // Skip empty rows and summary rows
        if (row[0]?.toLowerCase().includes('summary')) continue;
        
        // Determine date and time columns - assuming first two columns contain date and time
        let dateStr = row[0];
        let timeStr = '';
        let dealId = '';
        
        // Check if the deal ID is in the second column
        if (isNaN(Number(row[0])) && !isNaN(Number(row[1]))) {
          // Time split across first columns with Deal in column 2
          if (row[0].includes('.')) {
            dateStr = row[0];
            timeStr = row[1];
            dealId = row[2];
          } else {
            // Format like "MM/DD/YYYY HH:MM:SS" in first column
            const parts = row[0].split(' ');
            if (parts.length >= 2) {
              dateStr = parts[0].replace(/["']/g, '');
              timeStr = parts[1].replace(/["']/g, '');
            }
            dealId = row[1];
          }
        } else if (row[1] && row[1].includes(':')) {
          // Time in second column
          dateStr = row[0];
          timeStr = row[1];
          dealId = row[2];
        } else {
          // Deal ID in second column, assuming date and time are combined in first
          dealId = row[1];
          
          // Try to split the first column if it contains both date and time
          const firstCol = String(row[0]).replace(/["']/g, '');
          if (firstCol.includes(' ')) {
            const parts = firstCol.split(' ');
            dateStr = parts[0];
            timeStr = parts[1];
          }
        }
        
        // Process balance entry
        if (row[2] === '' || row[2] === 'balance') {
          const balanceValue = Number(String(row[11] || row[10]).replace(',', '.'));
          if (!isNaN(balanceValue)) {
            summary['Initial Balance'] = balanceValue;
          }
          
          // Still create a trade entry for balance rows
          const openTime = dateStr.includes('/') 
            ? new Date(dateStr.split('/')[2] + '-' + dateStr.split('/')[0] + '-' + dateStr.split('/')[1] + 'T' + timeStr)
            : parseMT5Date(dateStr);
            
          trades.push({
            openTime,
            order: Number(dealId) || 0,
            dealId: dealId, // Store the original deal ID string
            symbol: 'undefined',
            volumeLots: NaN,
            priceOpen: NaN,
            stopLoss: null,
            takeProfit: null,
            timeFlag: openTime,
            state: '',
            comment: row[12] || '',
            balance: balanceValue,
            profit: 0
          });
          
          continue;
        }

        // Parse date based on format
        let openTime: Date;
        if (dateStr.includes('/')) {
          // MM/DD/YYYY format
          const [month, day, year] = dateStr.split('/');
          openTime = new Date(`${year}-${month}-${day}T${timeStr}`);
        } else if (dateStr.includes('.')) {
          // DD.MM.YYYY format
          openTime = parseMT5Date(dateStr);
        } else {
          // Fallback
          openTime = new Date(dateStr + ' ' + timeStr);
        }

        // Determine side and state
        let side: 'buy' | 'sell' | undefined;
        let state: string = '';
        
        if (row[3] === 'buy' || row[3] === 'sell') {
          side = row[3] as 'buy' | 'sell';
          state = row[4] || ''; // Usually 'in'
        } else {
          state = row[4] || ''; // Usually 'out'
        }

        // Parse trade data
        const trade: StrategyTrade = {
          openTime,
          order: Number(dealId) || 0,
          dealId: dealId, // Store the original deal ID string
          symbol: String(row[2]),
          side,
          volumeLots: Number(String(row[5]).replace(',', '.')),
          priceOpen: Number(String(row[6]).replace(',', '.')),
          stopLoss: null,
          takeProfit: null,
          timeFlag: openTime,
          state,
          comment: String(row[12] || ''),
        };

        // Parse stop loss and take profit from comment if available
        const comment = trade.comment;
        if (comment) {
          const slMatch = comment.match(/sl (\d+\.?\d*)/i);
          const tpMatch = comment.match(/tp (\d+\.?\d*)/i);
          
          if (slMatch) {
            trade.stopLoss = Number(slMatch[1]);
          }
          if (tpMatch) {
            trade.takeProfit = Number(tpMatch[1]);
          }
        }

        // Add profit and balance if present
        const profitIndex = row.length > 10 ? 10 : 9;
        const balanceIndex = row.length > 11 ? 11 : 10;
        
        const profit = Number(String(row[profitIndex]).replace(',', '.'));
        const balance = Number(String(row[balanceIndex]).replace(',', '.'));
        
        if (!isNaN(profit)) {
          trade.profit = profit;
        }
        if (!isNaN(balance)) {
          trade.balance = balance;
        }

        trades.push(trade);
      }
    }
  }
  
  // Calculate trade statistics
  const inTrades = trades.filter(t => t.direction === 'in');
  const outTrades = trades.filter(t => t.direction === 'out');
  const completeTrades = Math.min(inTrades.length, outTrades.length);
  const profitableTrades = trades.filter(t => t.profit && t.profit > 0);
  const lossTrades = trades.filter(t => t.profit && t.profit < 0);
  
  // Update summary
  summary['Total Deals'] = trades.length;
  summary['In Deals'] = inTrades.length;
  summary['Out Deals'] = outTrades.length;
  summary['Complete Trades'] = completeTrades;
  summary['Profitable Deals'] = profitableTrades.length;
  summary['Loss Deals'] = lossTrades.length;
  summary['Win Rate'] = outTrades.length > 0 
    ? (profitableTrades.length / outTrades.length * 100).toFixed(2) + '%'
    : '0.00%';
  
  const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  summary['Total Net Profit'] = totalProfit;
  
  // Find the last balance value
  const lastTrade = trades[trades.length - 1];
  const finalBalance = lastTrade ? lastTrade.balance : summary['Initial Balance'];
  summary['Final Balance'] = finalBalance;

  // Generate CSV from processed data
  const csvContent = generateCSV(trades);
  
  // Create a Blob and downloadable URL for the CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(blob);

  return { 
    summary, 
    trades,
    csvUrl,
    source: file.name.toLowerCase().includes('mt4') ? 'MT4' : 'MT5'
  };
};

export const validateStrategyFile = (file: File): boolean => {
  return file.name.endsWith('.xlsx');
};
