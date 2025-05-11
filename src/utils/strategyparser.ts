import { read, utils, write } from 'xlsx';
import { StrategyTrade, StrategySummary, ParsedStrategyReport } from '@/types/strategyreportgenie';

/**
 * Debug utility for the strategy parser
 */
const DEBUG = {
  enabled: true,
  dateProcessing: true,
  rowProcessing: false,
  columnMapping: true,
  
  log: (category: string, message: string, data?: any) => {
    if (!DEBUG.enabled) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[DEBUG:${category}] ${timestamp}`;
    
    switch (category) {
      case 'date':
        if (!DEBUG.dateProcessing) return;
        break;
      case 'row':
        if (!DEBUG.rowProcessing) return;
        break;
      case 'columns':
        if (!DEBUG.columnMapping) return;
        break;
    }
    
    if (data !== undefined) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  },
  
  inspect: (dateStr: string, parsedDate: Date) => {
    if (!DEBUG.enabled || !DEBUG.dateProcessing) return;
    
    console.group(`🔍 Date Parsing Inspection for: "${dateStr}"`);
    console.log(`Original string: "${dateStr}"`);
    console.log(`Parsed result: ${parsedDate.toISOString()}`);
    console.log(`Local string: ${parsedDate.toString()}`);
    console.log(`UTC string: ${parsedDate.toUTCString()}`);
    console.log(`Time values:`, {
      year: parsedDate.getFullYear(),
      month: parsedDate.getMonth() + 1, // +1 because getMonth is 0-indexed
      day: parsedDate.getDate(),
      hours: parsedDate.getHours(),
      minutes: parsedDate.getMinutes(),
      seconds: parsedDate.getSeconds()
    });
    console.groupEnd();
  }
};

/**
 * Convert Excel numeric date to JavaScript Date object
 * Excel dates are number of days since 1/1/1900 (with a leap year bug)
 * 
 * @param excelDate A numeric Excel date value
 * @returns JavaScript Date object
 */
const excelDateToJSDate = (excelDate: number): Date => {
  // Excel's epoch starts on 1/1/1900
  // First step is to check if the value is a number
  if (isNaN(excelDate)) {
    DEBUG.log('date', `Invalid Excel date value: ${excelDate}`, excelDate);
    return new Date(); // Return current date as fallback
  }
  
  DEBUG.log('date', `Converting Excel date: ${excelDate}`);
  
  // Excel has a leap year bug where it thinks 1900 was a leap year
  // If date is greater than 60 (2/29/1900 in Excel), adjust by subtracting 1
  const offsetDays = excelDate > 60 ? 1 : 0;
  
  // Excel dates are days since 1/1/1900
  // Convert to milliseconds and adjust for Excel's leap year bug
  const milliseconds = Math.round((excelDate - offsetDays) * 86400 * 1000);
  
  // Create a new date by adding milliseconds to the Excel epoch (1/1/1900)
  const excelEpoch = new Date(1900, 0, 1);
  const resultDate = new Date(excelEpoch.getTime() + milliseconds);
  
  DEBUG.log('date', `Excel date ${excelDate} converted to: ${resultDate.toISOString()}`);
  
  return resultDate;
};

/**
 * Check if a string might be an Excel numeric date
 */
const isExcelNumericDate = (dateStr: string): boolean => {
  // Check if it's a number or a number with decimals
  const isNumeric = /^[0-9]+(\.[0-9]+)?$/.test(dateStr);
  
  // Most Excel dates are big numbers (>40000 for recent dates)
  if (isNumeric) {
    const numVal = parseFloat(dateStr);
    // Valid Excel dates should be a reasonable number (>30000 for dates after 1980)
    // and less than 50000 (covers dates well into the future)
    return numVal > 30000 && numVal < 50000;
  }
  
  return false;
};

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
 * Enhanced with better debugging and specific format handling
 */
const parseDate = (dateStr: string): Date => {
  try {
    DEBUG.log('date', `Attempting to parse date: "${dateStr}"`);
    
    if (!dateStr || typeof dateStr !== 'string') {
      DEBUG.log('date', 'Invalid date string provided:', dateStr);
      return new Date();
    }
    
    // Remove any extra spaces that might be present
    dateStr = dateStr.trim();
    DEBUG.log('date', `Trimmed date string: "${dateStr}"`);
    
    // Check for Excel numeric date format (e.g. "45777.33333333333")
    if (isExcelNumericDate(dateStr)) {
      DEBUG.log('date', `Detected Excel numeric date format: ${dateStr}`);
      const excelDate = parseFloat(dateStr);
      const jsDate = excelDateToJSDate(excelDate);
      DEBUG.inspect(dateStr, jsDate);
      return jsDate;
    }
    
    // Handle the specific format "2025-05-07 09:15" (YYYY-MM-DD HH:MM)
    const specificFormatRegex = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/;
    const specificMatch = dateStr.match(specificFormatRegex);
    
    if (specificMatch) {
      const [, yearStr, monthStr, dayStr, hoursStr, minutesStr] = specificMatch;
      
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed in JS
      const day = parseInt(dayStr, 10);
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      DEBUG.log('date', `MATCH FOUND - Specific format: ${year}-${month+1}-${day} ${hours}:${minutes}`);
      
      // Create date object using UTC to avoid timezone issues
      const parsedDate = new Date(Date.UTC(year, month, day, hours, minutes, 0));
      DEBUG.log('date', `Successfully parsed specific date format to UTC: ${parsedDate.toISOString()}`);
      DEBUG.log('date', `Local time equivalent: ${parsedDate.toString()}`);
      
      DEBUG.inspect(dateStr, parsedDate);
      return parsedDate;
    }
    
    // Handle MM/DD/YYYY HH:MM:SS format (like "05/09/2025 17:28:11")
    const usDateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/;
    const usMatch = dateStr.match(usDateTimeRegex);
    
    if (usMatch) {
      const [, monthStr, dayStr, yearStr, hoursStr, minutesStr, secondsStr] = usMatch;
      
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed in JS
      const day = parseInt(dayStr, 10);
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const seconds = parseInt(secondsStr, 10);
      
      DEBUG.log('date', `MATCH FOUND - US date format: ${month+1}/${day}/${year} ${hours}:${minutes}:${seconds}`);
      
      // Create date object using UTC to avoid timezone issues
      const parsedDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
      DEBUG.log('date', `Successfully parsed US date format: ${parsedDate.toISOString()}`);
      
      DEBUG.inspect(dateStr, parsedDate);
      return parsedDate;
    }
    
    // Handle different date formats (existing logic with added debugging):
    
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
        DEBUG.log('date', `Successfully parsed YYYY-MM-DD HH:MM[:SS] format: ${parsedDate.toISOString()}`);
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
        DEBUG.log('date', `Successfully parsed YYYY.MM.DD HH:MM:SS format: ${parsedDate.toISOString()}`);
        return parsedDate;
      } else {
        const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
        DEBUG.log('date', `Successfully parsed YYYY.MM.DD format: ${parsedDate.toISOString()}`);
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
        DEBUG.log('date', `Successfully parsed MM/DD/YYYY HH:MM:SS format: ${parsedDate.toISOString()}`);
        return parsedDate;
      } else {
        const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
        DEBUG.log('date', `Successfully parsed MM/DD/YYYY format: ${parsedDate.toISOString()}`);
        return parsedDate;
      }
    }
    
    // Enhanced debugging for TradingView specific format
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      DEBUG.log('date', 'Detected possible TradingView date format with year first');
      
      // Additional handling for TradingView format
      const parts = dateStr.split(' ');
      if (parts.length === 2) {
        const datePart = parts[0]; // e.g. "2025-05-07"
        const timePart = parts[1]; // e.g. "09:15"
        
        const dateBits = datePart.split('-');
        const timeBits = timePart.split(':');
        
        if (dateBits.length === 3 && timeBits.length >= 2) {
          const year = parseInt(dateBits[0], 10);
          const month = parseInt(dateBits[1], 10) - 1;
          const day = parseInt(dateBits[2], 10);
          const hours = parseInt(timeBits[0], 10);
          const minutes = parseInt(timeBits[1], 10);
          const seconds = timeBits[2] ? parseInt(timeBits[2], 10) : 0;
          
          DEBUG.log('date', `Creating date from components: Y=${year}, M=${month+1}, D=${day}, h=${hours}, m=${minutes}, s=${seconds}`);
          
          // Create date object using UTC to avoid timezone issues
          const parsedDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
          DEBUG.log('date', `Created TradingView format date: ${parsedDate.toISOString()}`);
          
          DEBUG.inspect(dateStr, parsedDate);
          return parsedDate;
        }
      }
    }
    
    // Fallback to standard Date parsing with explicit logging
    try {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        DEBUG.log('date', `Standard Date constructor parsing succeeded: ${parsedDate.toISOString()}`);
        DEBUG.inspect(dateStr, parsedDate);
        return parsedDate;
      } else {
        DEBUG.log('date', `Standard Date constructor failed to parse: "${dateStr}"`);
      }
    } catch (e) {
      DEBUG.log('date', `Error in standard Date parsing for "${dateStr}":`, e);
    }
    
    DEBUG.log('date', `❌ ALL PARSING METHODS FAILED for date string: "${dateStr}"`);
    const fallbackDate = new Date();
    DEBUG.log('date', `Using fallback current date: ${fallbackDate.toISOString()}`);
    return fallbackDate;
  } catch (e) {
    DEBUG.log('date', `‼️ EXCEPTION in parseDate for "${dateStr}":`, e);
    return new Date();
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
 * Parse TradingView Excel report file with enhanced date parsing and debugging
 */
const parseTradingViewExcel = async (file: File, initialBalance?: number): Promise<ParsedStrategyReport> => {
  DEBUG.log('parser', `Starting TradingView Excel parsing for file: ${file.name}`);
  
  // Read the Excel file
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  
  // TradingView exports contain a sheet called "List of trades"
  const sheetName = workbook.SheetNames.find(name => name === "List of trades") || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json<any>(worksheet, { header: 1 });
  
  DEBUG.log('parser', `Found sheet: ${sheetName}`);
  DEBUG.log('parser', `Total rows: ${rows.length}`);
  
  const summary: StrategySummary = {};
  const trades: StrategyTrade[] = [];
  let headerRowIndex = 0; // TradingView typically has header in first row
  
  // Use provided initialBalance or default to 10,000
  const startingBalance = initialBalance || 10000;
  DEBUG.log('parser', `Using initial balance: ${startingBalance}`);
  
  // Process TradingView format
  if (rows.length > 0) {
    // Find the headers (TradingView usually has headers in first row)
    const headers = rows[headerRowIndex];
    DEBUG.log('columns', 'Headers row:', headers);
    
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
    
    DEBUG.log('columns', `Found column indexes:`, {
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
      
      DEBUG.log('row', `Processing row ${i}:`, row);
      
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
      
      DEBUG.log('row', `Trade ${i} extracted values:`, {
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
        DEBUG.log('row', `Error parsing contracts value "${contractsStr}":`, e);
      }
      
      try {
        profitUsd = cleanNumeric(profitUsdStr);
      } catch (e) {
        DEBUG.log('row', `Error parsing profit value "${profitUsdStr}":`, e);
      }
      
      try {
        price = cleanNumeric(priceStr);
      } catch (e) {
        DEBUG.log('row', `Error parsing price value "${priceStr}":`, e);
      }
      
      // Parse date/time with enhanced date parser
      let openTime: Date;
      try {
        if (dateTimeStr) {
          // Create a clean copy for direct debug inspection
          DEBUG.log('date', `Row ${i} - Date string before parsing: "${dateTimeStr}"`);
          
          // First try specific format YYYY-MM-DD HH:MM (like "2025-05-07 09:15")
          const specificFormatMatch = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
          
          if (specificFormatMatch) {
            const [, yearStr, monthStr, dayStr, hoursStr, minutesStr] = specificFormatMatch;
            
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed in JS
            const day = parseInt(dayStr, 10);
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            
            DEBUG.log('date', `Trade ${i} - Creating date directly from components: Y=${year}, M=${month+1}, D=${day}, h=${hours}, m=${minutes}`);
            
            // Create the date using UTC to avoid timezone issues
            openTime = new Date(Date.UTC(year, month, day, hours, minutes, 0));
            
            // Debug date creation
            DEBUG.log('date', `Trade ${i} - Direct parsing result: ${openTime.toISOString()}`);
            DEBUG.log('date', `Trade ${i} - UTC string: ${openTime.toUTCString()}`);
            DEBUG.log('date', `Trade ${i} - Local string: ${openTime.toString()}`);
          } else {
            // Try alternate format MM/DD/YYYY HH:MM:SS
            const usDtFormat = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/;
            const usMatch = dateTimeStr.match(usDtFormat);
            
            if (usMatch) {
              const [, monthStr, dayStr, yearStr, hoursStr, minutesStr, secondsStr] = usMatch;
              
              const year = parseInt(yearStr, 10);
              const month = parseInt(monthStr, 10) - 1;
              const day = parseInt(dayStr, 10);
              const hours = parseInt(hoursStr, 10);
              const minutes = parseInt(minutesStr, 10);
              const seconds = parseInt(secondsStr, 10);
              
              DEBUG.log('date', `Trade ${i} - Creating date from US format: M=${month+1}, D=${day}, Y=${year}, h=${hours}, m=${minutes}, s=${seconds}`);
              
              // Create the date using UTC to avoid timezone issues
              openTime = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
              DEBUG.log('date', `Trade ${i} - US format parsing result: ${openTime.toISOString()}`);
            } else {
              // Fall back to standard parser
              openTime = parseDate(dateTimeStr);
              DEBUG.log('date', `Trade ${i} - Standard parse date result: ${openTime.toISOString()}`);
            }
          }
          
          // Validate the parsed date to ensure it's not too far in the future or past
          const now = new Date();
          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(now.getFullYear() - 5);
          const fiveYearsFromNow = new Date();
          fiveYearsFromNow.setFullYear(now.getFullYear() + 5);
          
          if (openTime < fiveYearsAgo || openTime > fiveYearsFromNow) {
            DEBUG.log('date', `⚠️ Trade ${i} - Date validation warning: ${openTime.toISOString()} is outside reasonable range`);
          }
        } else {
          DEBUG.log('date', `Trade ${i} - Missing date/time, generating placeholder`);
          // Generate timestamp with trade number to ensure uniqueness
          openTime = new Date(); 
          // Make each trade have a slightly different time by offset based on trade number
          openTime.setMinutes(openTime.getMinutes() - Number(tradeNum || i));
          DEBUG.log('date', `Trade ${i} - Generated placeholder date: ${openTime.toISOString()}`);
        }
      } catch (e) {
        DEBUG.log('date', `‼️ Trade ${i} - Error creating trade timestamp for "${dateTimeStr}":`, e);
        openTime = new Date(); // Use current date as fallback
        openTime.setMinutes(openTime.getMinutes() - i); // Ensure uniqueness
        DEBUG.log('date', `Trade ${i} - Fallback date after error: ${openTime.toISOString()}`);
      }
      
      // Ensure date is valid
      if (isNaN(openTime.getTime())) {
        DEBUG.log('date', `⚠️ Trade ${i} - Invalid date detected, using current time`);
        openTime = new Date();
        openTime.setMinutes(openTime.getMinutes() - i); // Ensure uniqueness
      }
      
      // Determine trade direction and state
      const isEntry = type.toLowerCase().includes('entry');
      const isExit = type.toLowerCase().includes('exit');
      let direction: "in" | "out" = isEntry ? "in" : (isExit ? "out" : "in");
      
      DEBUG.log('row', `Trade ${i} direction: ${direction} (isEntry: ${isEntry}, isExit: ${isExit})`);
      
      // Determine trade side
      let side: 'long' | 'short';
      if (signal && signal.toLowerCase().includes('long')) {
        side = 'long';
      } else if (signal && signal.toLowerCase().includes('short')) {
        side = 'short';
      } else if (type.toLowerCase().includes('long')) {
        side = 'long';
      } else if (type.toLowerCase().includes('short')) {
        side = 'short';
      } else {
        // Default to long if we can't determine
        side = 'long';
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
        symbol: '', 
        type: type || 'trade', // Ensure type is always set
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
        commission: 0,
        swap: 0,
      };
      
      trades.push(trade);
      DEBUG.log('row', `Added trade ${i} with timestamp ${trade.openTime.toISOString()}`);
    }
    
    // Update summary
    const totalTrades = trades.filter(t => t.direction === 'out').length;
    const profitableTrades = trades.filter(t => t.profit !== undefined && t.profit > 0 && t.direction === 'out').length;
    const lossTrades = trades.filter(t => t.profit !== undefined && t.profit < 0 && t.direction === 'out').length;
    const totalProfit = trades.filter(t => t.direction === 'out').reduce((sum, t) => sum + (t.profit || 0), 0);
    const winRate = (totalTrades > 0) ? (profitableTrades / totalTrades * 100).toFixed(2) : '0';
    
    summary['Total Trades'] = String(totalTrades);
    summary['Profitable Trades'] = String(profitableTrades);
    summary['Loss Trades'] = String(lossTrades);
    summary['Win Rate'] = `${winRate}%`;
    summary['Total Net Profit'] = String(totalProfit);
    summary['Initial Balance'] = String(startingBalance);
    summary['Final Balance'] = String(runningBalance);
    summary['Max Drawdown'] = String(maxDrawdown);
    
    DEBUG.log('parser', 'Summary generated:', summary);
    DEBUG.log('parser', `Total trades processed: ${trades.length}`);
  }
  
  // Generate CSV from processed data
  const csvContent = generateCSV(trades);
  
  // Create a Blob and downloadable URL for the CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(blob);
  
  DEBUG.log('parser', 'CSV generated and URL created');
  
  // Log first few trades for debugging
  if (trades.length > 0) {
    DEBUG.log('parser', 'First 3 trades for verification:', trades.slice(0, 3));
  }

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
  DEBUG.log('parser', `Starting MT5/MT4 Excel parsing for file: ${file.name}`);
  
  // Read the Excel file
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  
  // Check if this might be a TradingView export
  const isTradingView = await detectTradingViewFile(file);
  if (isTradingView) {
    DEBUG.log('parser', "Detected TradingView export format, switching parser");
    return parseTradingViewExcel(file, initialBalance);
  }
  
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json<string[]>(worksheet, { header: 1 });
  DEBUG.log('parser', `Total rows in MT5 file: ${rows.length}`);

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
      DEBUG.log('parser', `Found header row at index ${i}:`, row);
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
    
    DEBUG.log('parser', `Found column indexes:`, {
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
      
      DEBUG.log('parser', `Processing row ${i}, Date value: "${timeValue}"`);
      
      // Parse date using improved function
      const openTime = parseDate(timeValue);
      DEBUG.log('parser', `Parsed date: ${openTime}`);
      
      // Determine if this is a balance entry
      const isBalanceEntry = typeValue === 'balance' || typeValue === '';
      
      // Make sure direction is a valid value
      let direction: "in" | "out";
      if (directionValue === "in" || directionValue === "out") {
        direction = directionValue;
      } else {
        // Default direction based on other fields
        direction = typeValue.toLowerCase().includes('entry') ? "in" : "out";
      }
      
      // Create trade entry
      const trade: StrategyTrade = {
        openTime,
        order: parseInt(orderValue) || 0,
        dealId: dealValue,
        symbol: symbolValue,
        type: typeValue,
        direction: direction,
        side: 'long', // Default to long if not specified
        volumeLots: cleanNumeric(volumeValue),
        priceOpen: cleanNumeric(priceValue),
        stopLoss: null,
        takeProfit: null,
        timeFlag: openTime,
        state: direction,
        comment: commentValue,
        commission: cleanNumeric(commissionValue),
        swap: cleanNumeric(swapValue),
        profit: cleanNumeric(profitValue),
        balance: cleanNumeric(balanceValue),
      };
      
      // Determine side based on type
      if (typeValue.toLowerCase().includes('buy') || typeValue.toLowerCase().includes('long')) {
        trade.side = 'long';
      } else if (typeValue.toLowerCase().includes('sell') || typeValue.toLowerCase().includes('short')) {
        trade.side = 'short';
      }
      
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
        summary['Initial Balance'] = String(trade.balance || 0);
      }
    }
  } else {
    // Fallback to the old parsing logic if header row is not found
    DEBUG.log('parser', 'Header row not found, falling back to default parsing');
    
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
              dateStr = parts[0].replace(/[\"']/g, '');
              timeStr = parts[1].replace(/[\"']/g, '');
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
          const firstCol = String(row[0]).replace(/[\"']/g, '');
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
            summary['Initial Balance'] = String(balanceValue);
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
            volumeLots: 0,
            priceOpen: 0,
            stopLoss: null,
            takeProfit: null,
            timeFlag: openTime,
            state: '',
            comment: row[12] || '',
            balance: balanceValue,
            profit: 0,
            direction: "in", // Default direction for balance entries
            side: "long",
            commission: 0,
            swap: 0
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
        let side: 'long' | 'short' = 'long'; // Default
        let direction: "in" | "out" = "in"; // Default
        
        // Parse row[3] to determine if it's buy/sell and transform to long/short
        if (row[3] === 'buy') {
          side = 'long';
        } else if (row[3] === 'sell') {
          side = 'short';
        }
        
        // Determine direction based on row[4]
        if (row[4] === 'in') {
          direction = 'in';
        } else if (row[4] === 'out') {
          direction = 'out';
        }
        
        // Create trade entry
        const trade: StrategyTrade = {
          openTime,
          order: Number(dealId) || 0,
          dealId: dealId,
          symbol: row[2] || '',
          type: row[3] || '',
          direction: direction,
          side: side,
          volumeLots: Number(String(row[5] || '0').replace(',', '.')),
          priceOpen: Number(String(row[6] || '0').replace(',', '.')),
          stopLoss: null,
          takeProfit: null,
          timeFlag: openTime,
          state: row[4] || '',
          comment: row[12] || '',
          commission: Number(String(row[8] || '0').replace(',', '.')),
          swap: Number(String(row[9] || '0').replace(',', '.')),
          profit: Number(String(row[10] || '0').replace(',', '.')),
          balance: Number(String(row[11] || '0').replace(',', '.'))
        };
        
        trades.push(trade);
      }
    }
  }
  
  // Generate CSV from processed data
  const csvContent = generateCSV(trades);
  
  // Create a Blob and downloadable URL for the CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(blob);
  
  DEBUG.log('parser', 'MT5 parsing completed');
  
  return { 
    summary, 
    trades,
    csvUrl,
    source: 'MT5'
  };
};

/**
 * Basic validation for strategy files
 */
export const validateStrategyFile = (file: File): boolean => {
  const validExtensions = ['.xlsx'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  return validExtensions.includes(fileExtension);
};
