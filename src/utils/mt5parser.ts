
import { read, utils, write } from 'xlsx';
import { MT5Trade, MT5Summary, ParsedMT5Report } from '@/types/mt5reportgenie';

const generateCSV = (trades: MT5Trade[]): string => {
  const headers = [
    'Time', 'Deal', 'Symbol', 'Type', 'Direction', 'Volume',
    'Price', 'Order', 'Commission', 'Swap', 'Profit', 'Balance', 'Comment'
  ];

  const rows = trades.map(trade => [
    trade.openTime.toISOString(),
    trade.order,
    trade.symbol,
    trade.side || '',
    trade.state,
    trade.volumeLots,
    trade.priceOpen,
    '',  // Order placeholder
    '0.00',  // Commission placeholder
    '0.00',  // Swap placeholder
    trade.profit || '0.00',
    trade.balance || '0.00',
    trade.comment
  ]);

  // Create workbook and worksheet
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet([headers, ...rows]);
  
  // Convert to CSV
  return utils.sheet_to_csv(ws);
};

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
  let dataRows: string[][] = [];

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

    // Parse trades from the Deals section
    if (isDealsSection && headerRow.length > 0) {
      // Skip balance entries, empty rows, and summary rows
      if (row[2] === '' || row[2] === 'balance' || row[0]?.toLowerCase().includes('summary')) continue;

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

      trades.push(trade);
      dataRows.push(row);
    }
  }

  // Generate CSV from cleaned data
  const csvContent = generateCSV(trades);
  
  // Create a Blob and downloadable URL for the CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(blob);

  // Calculate basic summary metrics
  const profitableTrades = trades.filter(t => t.profit && t.profit > 0);
  const lossTrades = trades.filter(t => t.profit && t.profit < 0);
  
  summary['Total Trades'] = trades.length;
  summary['Profitable Trades'] = profitableTrades.length;
  summary['Loss Trades'] = lossTrades.length;
  summary['Win Rate'] = (profitableTrades.length / trades.length * 100).toFixed(2) + '%';
  summary['Total Net Profit'] = trades.reduce((sum, t) => sum + (t.profit || 0), 0);

  return { 
    summary, 
    trades,
    csvUrl  // Add the CSV URL to the return object
  };
};

export const validateMT5File = (file: File): boolean => {
  return file.name.endsWith('.xlsx');
};
