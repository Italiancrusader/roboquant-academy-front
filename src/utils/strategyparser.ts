
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
 * Parse date string from various formats to JavaScript Date
 * Enhanced to better handle TradingView date formats
 */
const parseDate = (dateStr: string): Date => {
  try {
    console.log(`Attempting to parse date: "${dateStr}"`);
    
    if (!dateStr || typeof dateStr !== 'string') {
      console.error('Invalid date string provided:', dateStr);
      return new Date();
    }
    
    // Remove any extra spaces that might be present
    dateStr = dateStr.trim();
    
    // Handle different date formats:
    
    // 1. YYYY-MM-DD HH:MM:SS or YYYY-MM-DD HH:MM format (common in TradingView)
    const isoFormatRegex = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
    if (isoFormatRegex.test(dateStr)) {
      const match = dateStr.match(isoFormatRegex);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Month is 0-indexed in JS
        const day = parseInt(match[3], 10);
        const hour = match[4] ? parseInt(match[4], 10) : 0;
        const minute = match[5] ? parseInt(match[5], 10) : 0;
        const second = match[6] ? parseInt(match[6], 10) : 0;
        
        const parsedDate = new Date(year, month, day, hour, minute, second);
        console.log(`Successfully parsed YYYY-MM-DD HH:MM[:SS] format: ${parsedDate}`);
        return parsedDate;
      }
    }
    
    // 2. YYYY.MM.DD HH:MM:SS format (MT5 common format)
    if (dateStr.includes('.') && dateStr.split('.')[0].length === 4) {
      const [datePart, timePart] = dateStr.split(' ');
      const [year, month, day] = datePart.split('.');
      
      if (timePart) {
        const [hours, minutes, seconds] = timePart.split(':');
        
        // Create a new Date object (month is 0-indexed in JavaScript)
        const parsedDate = new Date(
          Number(year), 
          Number(month) - 1, 
          Number(day), 
          Number(hours) || 0, 
          Number(minutes) || 0, 
          Number(seconds) || 0
        );
        console.log(`Successfully parsed YYYY.MM.DD HH:MM:SS format: ${parsedDate}`);
        return parsedDate;
      } else {
        const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
        console.log(`Successfully parsed YYYY.MM.DD format: ${parsedDate}`);
        return parsedDate;
      }
    }
    
    // 3. MM/DD/YYYY HH:MM:SS format (US format)
    if (dateStr.includes('/')) {
      const [datePart, timePart] = dateStr.split(' ');
      const [month, day, year] = datePart.split('/');
      
      if (timePart) {
        const [hours, minutes, seconds] = timePart.split(':');
        
        const parsedDate = new Date(
          Number(year), 
          Number(month) - 1, 
          Number(day), 
          Number(hours) || 0, 
          Number(minutes) || 0, 
          Number(seconds) || 0
        );
        console.log(`Successfully parsed MM/DD/YYYY HH:MM:SS format: ${parsedDate}`);
        return parsedDate;
      } else {
        const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
        console.log(`Successfully parsed MM/DD/YYYY format: ${parsedDate}`);
        return parsedDate;
      }
    }
    
    // Fallback to standard Date parsing with explicit logging
    try {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        console.log(`Successfully parsed using standard Date constructor: ${parsedDate}`);
        return parsedDate;
      } else {
        console.error(`Standard Date constructor failed to parse: "${dateStr}"`);
      }
    } catch (e) {
      console.error(`Error in standard Date parsing for "${dateStr}":`, e);
    }
    
    console.error(`All parsing methods failed for date string: "${dateStr}"`);
    return new Date(); // Return current date as fallback
  } catch (e) {
    console.error(`Exception in parseDate for "${dateStr}":`, e);
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
 * Parse TradingView Excel report file with enhanced date parsing
 */
const parseTradingViewExcel = async (file: File, initialBalance?: number): Promise<ParsedStrategyReport> => {
  // Read the Excel file
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  
  // TradingView exports contain a sheet called "List of trades"
  const sheetName = workbook.SheetNames.find(name => name === "List of trades") || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json<any>(worksheet, { header: 1 });
  
  console.log(`Parsing TradingView Excel file: ${file.name}`);
  console.log(`Found sheet: ${sheetName}`);
  console.log(`Total rows: ${rows.length}`);
  
  const summary: StrategySummary = {};
  const trades: StrategyTrade[] = [];
  let headerRowIndex = 0; // TradingView typically has header in first row
  
  // Use provided initialBalance or default to 10,000
  const startingBalance = initialBalance || 10000;
  
  // Process TradingView format
  if (rows.length > 0) {
    // Find the headers (TradingView usually has headers in first row)
    const headers = rows[headerRowIndex];
    console.log('Headers row:', headers);
    
    // Find column indexes for important fields - use case-insensitive search and be more flexible
    const findColumnIndex = (possibleHeaders: string[]): number => {
      return headers.findIndex((h: string) => {
        if (!h) return false;
        const headerText = String(h).toLowerCase();
        return possibleHeaders.some(possible => headerText.includes(possible.toLowerCase()));
      });
    };
    
    const tradeNumIndex = findColumnIndex(['Trade #', 'Trade', 'ID', 'Deal']);
    const typeIndex = findColumnIndex(['Type', 'Action']);
    const signalIndex = findColumnIndex(['Signal', 'Direction', 'Side']);
    const dateTimeIndex = findColumnIndex(['Date/Time', 'Date', 'Time', 'DateTime']);
    const priceIndex = findColumnIndex(['Price', 'Price USD', 'Entry Price']);
    const contractsIndex = findColumnIndex(['Contracts', 'Volume', 'Size', 'Lot']);
    const profitUsdIndex = findColumnIndex(['Profit USD', 'Profit', 'P/L']);
    const profitPctIndex = findColumnIndex(['Profit %', 'Return', 'Return %']);
    const cumulativeProfitUsdIndex = findColumnIndex(['Cumulative profit USD', 'Cumulative Profit', 'Balance']);
    
    console.log(`Found column indexes:`, {
      tradeNumIndex,
      typeIndex,
      signalIndex,
      dateTimeIndex,
      priceIndex,
      contractsIndex,
      profitUsdIndex,
      profitPctIndex,
      cumulativeProfitUsdIndex
    });
    
    // Initialize with the provided initial balance
    let runningBalance = startingBalance;
    let maxDrawdown = 0;
    let peakBalance = startingBalance;
    
    // Process data rows
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      console.log(`Processing row ${i}:`, row);
      
      // Get values from the row with safer fallbacks
      const getRowValue = (index: number): string => {
        if (index < 0 || index >= row.length) return '';
        return row[index] !== undefined && row[index] !== null ? String(row[index]) : '';
      };
      
      const tradeNum = getRowValue(tradeNumIndex);
      const type = getRowValue(typeIndex);
      const signal = getRowValue(signalIndex);
      const dateTimeStr = getRowValue(dateTimeIndex);
      const priceStr = getRowValue(priceIndex);
      const contractsStr = getRowValue(contractsIndex);
      const profitUsdStr = getRowValue(profitUsdIndex);
      
      console.log(`Trade ${i} extracted values:`, {
        tradeNum,
        type,
        signal,
        dateTimeStr,
        priceStr,
        contractsStr,
        profitUsdStr
      });
      
      // Parse and validate numeric values with explicit error handling
      let contracts = 0;
      let profitUsd = 0;
      let price = 0;
      
      try {
        contracts = cleanNumeric(contractsStr);
      } catch (e) {
        console.error(`Error parsing contracts value "${contractsStr}":`, e);
      }
      
      try {
        profitUsd = cleanNumeric(profitUsdStr);
      } catch (e) {
        console.error(`Error parsing profit value "${profitUsdStr}":`, e);
      }
      
      try {
        price = cleanNumeric(priceStr);
      } catch (e) {
        console.error(`Error parsing price value "${priceStr}":`, e);
      }
      
      // Parse date/time with enhanced date parser
      let openTime: Date;
      try {
        if (dateTimeStr) {
          openTime = parseDate(dateTimeStr);
          console.log(`Parsed date "${dateTimeStr}" -> ${openTime}`);
        } else {
          console.warn(`Missing date/time for row ${i}, generating placeholder`);
          // Generate slightly different timestamps for each trade if no date is provided
          const baseDate = new Date();
          baseDate.setDate(1);
          const hoursToAdd = (i - headerRowIndex) * 2;
          const minutesToAdd = (i - headerRowIndex) * 15; // 15 minute intervals
          
          openTime = new Date(baseDate);
          openTime.setHours(openTime.getHours() + hoursToAdd);
          openTime.setMinutes(openTime.getMinutes() + minutesToAdd);
        }
      } catch (e) {
        console.error(`Error creating trade timestamp for "${dateTimeStr}":`, e);
        openTime = new Date(); // Use current date as fallback
      }
      
      // Determine trade direction and state
      const isEntry = type.toLowerCase().includes('entry');
      const isExit = type.toLowerCase().includes('exit');
      const direction = isEntry ? 'in' : (isExit ? 'out' : '');
      
      console.log(`Trade ${i} direction: ${direction} (isEntry: ${isEntry}, isExit: ${isExit})`);
      
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
      
      // Create trade object with the parsed timestamp
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
      console.log(`Added trade with timestamp ${trade.openTime}`);
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
    
    console.log('Summary generated:', summary);
    console.log('Total trades processed:', trades.length);
  }
  
  // Generate CSV from processed data
  const csvContent = generateCSV(trades);
  
  // Create a Blob and downloadable URL for the CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(blob);
  
  console.log('CSV generated and URL created');

  return { 
    summary, 
    trades,
    csvUrl,
    source: 'TradingView'
  };
};

/**
 * Parses MT5/MT4 Excel file and extracts trades with enhanced date parsing
 */
export const parseMT5Excel = async (file: File, initialBalance?: number): Promise<ParsedStrategyReport> => {
  // Read the Excel file
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  
  console.log(`Parsing MT5/MT4 Excel file: ${file.name}`);
  
  // Check if this might be a TradingView export
  const isTradingView = await detectTradingViewFile(file);
  if (isTradingView) {
    console.log("Detected TradingView export format");
    return parseTradingViewExcel(file, initialBalance);
  }
  
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json<string[]>(worksheet, { header: 1 });
  console.log(`Total rows in MT5 file: ${rows.length}`);

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
      console.log(`Found header row at index ${i}:`, row);
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
    
    console.log(`Found column indexes:`, {
      timeIndex,
      dealIndex,
      symbolIndex,
      typeIndex,
      directionIndex,
      volumeIndex,
      priceIndex,
      orderIndex,
      commissionIndex,
      swapIndex,
      profitIndex,
      balanceIndex,
      commentIndex
    });
    
    // Process data rows
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      // Extract values based on column indexes with safe fallbacks
      const getRowValue = (index: number): string => {
        if (index < 0 || index >= row.length) return '';
        return row[index] !== undefined && row[index] !== null ? String(row[index]) : '';
      };
      
      const timeValue = getRowValue(timeIndex);
      const dealValue = getRowValue(dealIndex);
      const symbolValue = getRowValue(symbolIndex);
      const typeValue = getRowValue(typeIndex);
      const directionValue = getRowValue(directionIndex);
      const volumeValue = getRowValue(volumeIndex);
      const priceValue = getRowValue(priceIndex);
      const orderValue = getRowValue(orderIndex);
      const commissionValue = getRowValue(commissionIndex);
      const swapValue = getRowValue(swapIndex);
      const profitValue = getRowValue(profitIndex);
      const balanceValue = getRowValue(balanceIndex);
      const commentValue = getRowValue(commentIndex);
      
      // Skip empty rows
      if (!timeValue && !dealValue) continue;
      
      console.log(`Processing row ${i}, Date value: "${timeValue}"`);
      
      // Parse date using improved function
      const openTime = parseDate(timeValue);
      console.log(`Parsed date: ${openTime}`);
      
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
            : parseDate(dateStr);
            
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
          openTime = parseDate(dateStr);
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
  const profitableTrades = trades.filter(t => t.profit !== undefined && t.profit > 0);
  const lossTrades = trades.filter(t => t.profit !== undefined && t.profit < 0);
  
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
  
  console.log('MT5 parsing complete, generated CSV');

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
