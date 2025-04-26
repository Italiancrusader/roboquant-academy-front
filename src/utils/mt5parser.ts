
import { read, utils } from 'xlsx';
import { MT5Trade, MT5Summary, ParsedMT5Report } from '@/types/mt5reportgenie';

export const parseMT5Excel = async (file: File): Promise<ParsedMT5Report> => {
  // Read the Excel file
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json<string[]>(worksheet, { header: 1 });

  const summary: MT5Summary = {};
  const trades: MT5Trade[] = [];
  let isTradeTable = false;
  let headerRow: string[] = [];

  for (const row of rows) {
    if (!row || row.length === 0) continue;

    if (!isTradeTable) {
      // Parse summary block
      const label = row[0];
      if (typeof label === 'string' && label.includes(':')) {
        const key = label.replace(':', '').trim();
        const value = row.slice(1).find(cell => cell !== undefined && cell !== '');
        if (value !== undefined) {
          const numValue = Number(value);
          summary[key] = isNaN(numValue) ? value : numValue;
        }
      }
      
      // Check for trade table start
      if (row.includes('Open Time')) {
        isTradeTable = true;
        headerRow = row.filter(cell => cell !== '');
        continue;
      }
    } else {
      // Parse trade records
      if (headerRow.length === 0 || row.every(cell => !cell)) continue;

      const trade: MT5Trade = {
        openTime: new Date(row[0]),
        order: Number(row[1]),
        symbol: String(row[2]),
        side: String(row[3]).toLowerCase() as 'buy' | 'sell',
        volumeLots: parseFloat(String(row[4]).split('/')[0]),
        priceOpen: Number(row[6]),
        stopLoss: row[7] === '—' ? null : Number(row[7]),
        takeProfit: row[8] === '—' ? null : Number(row[8]),
        timeFlag: new Date(row[9]),
        state: String(row[11]),
        comment: String(row[12] || ''),
      };

      // Handle profit and balance if present
      if (row.length > 13) {
        trade.profit = Number(row[13]);
        if (row.length > 14) {
          trade.balance = Number(row[14]);
        }
      }

      trades.push(trade);
    }
  }

  return { summary, trades };
};

export const validateMT5File = (file: File): boolean => {
  return file.name.endsWith('.xlsx');
};

