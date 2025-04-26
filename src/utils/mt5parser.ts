
import { read, utils, write } from 'xlsx';
import { MT5Trade, MT5Summary, ParsedMT5Report } from '@/types/mt5reportgenie';

/**
 * Format date and time in a more readable format
 */
const formatDateTime = (dateTimeStr: string): string => {
  try {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateTimeStr;
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

  const rows = trades.map(trade => [
    formatDateTime(trade.openTime.toISOString()),
    trade.order,
    trade.symbol,
    trade.side || '',
    trade.state,
    trade.volumeLots,
    trade.priceOpen,
    '',  // Order placeholder
    '0.00',  // Commission placeholder
    '0.00',  // Swap placeholder
    trade.profit !== undefined ? trade.profit.toFixed(2) : '0.00',
    trade.balance !== undefined ? trade.balance.toFixed(2) : '0.00',
    trade.comment
  ]);

  // Create workbook and worksheet
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet([headers, ...rows]);
  
  // Convert to CSV
  return utils.sheet_to_csv(ws);
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
  
  // Group deals by symbol and then by order to pair INs and OUTs
  const dealsBySymbol: { [key: string]: MT5Trade[] } = {};
  
  // First pass - identify deals section and extract raw deals
  for (const row of rows) {
    if (!row || row.length === 0) continue;

    // Check for the start of the Deals section
    if (row[0] === 'Deals') {
      isDealsSection = true;
      continue;
    }

    // Skip the header row but store it
    if (isDealsSection && row[0] === 'Time') {
      headerRow = row;
      continue;
    }

    // Process rows in the Deals section
    if (isDealsSection && headerRow.length > 0) {
      // Skip empty rows and summary rows
      if (row[0]?.toLowerCase().includes('summary')) continue;
      
      // Process balance entries separately
      if (row[2] === 'balance' || row[2] === '') {
        // Add balance entry to summary info
        const balanceValue = Number(String(row[11]).replace(',', '.'));
        if (!isNaN(balanceValue)) {
          summary['Initial Balance'] = balanceValue;
        }
        continue;
      }

      // Parse trade data
      const trade: MT5Trade = {
        openTime: new Date(row[0].replace(/\./g, '-')), // Convert date format
        order: Number(row[1]),
        symbol: String(row[2]),
        side: row[4] === 'in' ? row[3] as 'buy' | 'sell' : undefined,
        volumeLots: Number(row[5]),
        priceOpen: Number(String(row[6]).replace(',', '.')), // Handle decimal separator
        stopLoss: null,
        takeProfit: null,
        timeFlag: new Date(row[0].replace(/\./g, '-')),
        state: row[4], // 'in' or 'out'
        comment: String(row[12] || ''),
      };

      // Parse stop loss and take profit from comment if available
      if (trade.comment) {
        const slMatch = trade.comment.match(/sl (\d+\.?\d*)/i);
        const tpMatch = trade.comment.match(/tp (\d+\.?\d*)/i);
        
        if (slMatch) {
          trade.stopLoss = Number(slMatch[1]);
        }
        if (tpMatch) {
          trade.takeProfit = Number(tpMatch[1]);
        }
      }

      // Add profit and balance if present
      const profit = Number(String(row[10]).replace(',', '.'));
      const balance = Number(String(row[11]).replace(',', '.'));
      
      if (!isNaN(profit)) {
        trade.profit = profit;
      }
      if (!isNaN(balance)) {
        trade.balance = balance;
      }

      // Group trades by symbol for later processing
      if (!dealsBySymbol[trade.symbol]) {
        dealsBySymbol[trade.symbol] = [];
      }
      dealsBySymbol[trade.symbol].push(trade);
    }
  }
  
  // Second pass - match IN and OUT deals to create complete trades
  Object.values(dealsBySymbol).forEach(symbolTrades => {
    // Sort by order ID and time to ensure correct matching
    symbolTrades.sort((a, b) => a.order - b.order || a.openTime.getTime() - b.openTime.getTime());
    
    // Add each trade to the final list
    trades.push(...symbolTrades);
  });

  // Generate CSV from cleaned data
  const csvContent = generateCSV(trades);
  
  // Create a Blob and downloadable URL for the CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(blob);

  // Calculate basic summary metrics
  const profitableTrades = trades.filter(t => t.profit && t.profit > 0);
  const lossTrades = trades.filter(t => t.profit && t.profit < 0);
  
  summary['Total Deals'] = trades.length;
  summary['In Deals'] = trades.filter(t => t.state === 'in').length;
  summary['Out Deals'] = trades.filter(t => t.state === 'out').length;
  
  // Calculate the number of complete trades (pairs of IN and OUT)
  const completeTrades = Math.min(
    trades.filter(t => t.state === 'in').length,
    trades.filter(t => t.state === 'out').length
  );
  
  summary['Complete Trades'] = completeTrades;
  summary['Profitable Deals'] = profitableTrades.length;
  summary['Loss Deals'] = lossTrades.length;
  summary['Win Rate'] = completeTrades > 0 
    ? (profitableTrades.length / completeTrades * 100).toFixed(2) + '%'
    : '0.00%';
  summary['Total Net Profit'] = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  summary['Final Balance'] = trades.length > 0 ? trades[trades.length - 1].balance || 0 : summary['Initial Balance'] || 0;

  return { 
    summary, 
    trades,
    csvUrl  // Add the CSV URL to the return object
  };
};

export const validateMT5File = (file: File): boolean => {
  return file.name.endsWith('.xlsx');
};
