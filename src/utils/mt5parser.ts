import { read, utils, write } from 'xlsx';
import { MT5Trade, MT5Summary, ParsedMT5Report } from '@/types/mt5reportgenie';

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
const generateCSV = (trades: MT5Trade[]): string => {
  const headers = [
    'Time', 'Deal', 'Symbol', 'Type', 'Direction', 'Volume',
    'Price', 'Order', 'Commission', 'Swap', 'Profit', 'Balance', 'Comment'
  ];

  const rows = trades.map(trade => {
    const dateTime = formatDateTime(trade.openTime);
    
    return [
      dateTime,
      trade.order.toString(),
      trade.symbol || 'undefined',
      trade.side || '',
      trade.state || '',
      trade.volumeLots !== undefined ? trade.volumeLots.toString() : 'NAN',
      trade.priceOpen !== undefined ? trade.priceOpen.toString() : 'NAN',
      '',  // Order placeholder
      '0.00',  // Commission placeholder
      '0.00',  // Swap placeholder
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
 * Parse date string from MT5 format (DD.MM.YYYY HH:MM:SS) to JavaScript Date
 */
const parseMT5Date = (dateStr: string, timeStr: string): Date => {
  try {
    // Split the date and time components
    const [day, month, year] = dateStr.split('.');
    const [hours, minutes, seconds] = timeStr.split(':');
    
    // Create a new Date object (month is 0-indexed in JavaScript)
    return new Date(Number(year), Number(month) - 1, Number(day), 
                   Number(hours), Number(minutes), Number(seconds));
  } catch (e) {
    console.error('Error parsing date:', e, dateStr, timeStr);
    return new Date(); // Return current date as fallback
  }
};

/**
 * Parses MT5 Excel file and extracts trades
 */
export const parseMT5Excel = async (file: File): Promise<ParsedMT5Report> => {
  // Read the Excel file
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json<string[]>(worksheet, { header: 1 });

  const summary: MT5Summary = {};
  const trades: MT5Trade[] = [];
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
          : parseMT5Date(dateStr, timeStr);
          
        trades.push({
          openTime,
          order: Number(dealId) || 0,
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
        openTime = parseMT5Date(dateStr, timeStr);
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
      const trade: MT5Trade = {
        openTime,
        order: Number(dealId) || 0,
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
  
  // Calculate trade statistics
  const inDeals = trades.filter(t => t.state === 'in');
  const outDeals = trades.filter(t => t.state === 'out');
  const completeTrades = Math.min(inDeals.length, outDeals.length);
  const profitableTrades = trades.filter(t => t.profit && t.profit > 0);
  const lossTrades = trades.filter(t => t.profit && t.profit < 0);
  
  // Update summary
  summary['Total Deals'] = trades.length;
  summary['In Deals'] = inDeals.length;
  summary['Out Deals'] = outDeals.length;
  summary['Complete Trades'] = completeTrades;
  summary['Profitable Deals'] = profitableTrades.length;
  summary['Loss Deals'] = lossTrades.length;
  summary['Win Rate'] = completeTrades > 0 
    ? (profitableTrades.length / outDeals.length * 100).toFixed(2) + '%'
    : '0.00%';
  
  const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  summary['Total Net Profit'] = totalProfit;
  
  // Find the last balance value
  let finalBalance = trades.length > 0 ? 
    trades[trades.length - 1].balance : 
    summary['Initial Balance'] || 0;
    
  // If undefined, calculate it
  if (finalBalance === undefined) {
    finalBalance = (summary['Initial Balance'] as number || 0) + totalProfit;
  }
  
  summary['Final Balance'] = finalBalance;

  // Generate CSV from processed data
  const csvContent = generateCSV(trades);
  
  // Create a Blob and downloadable URL for the CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(blob);

  return { 
    summary, 
    trades,
    csvUrl
  };
};

export const validateMT5File = (file: File): boolean => {
  return file.name.endsWith('.xlsx');
};
