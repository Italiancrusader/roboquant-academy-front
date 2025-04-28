
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';

interface EquityChartProps {
  trades: MT5Trade[];
}

const EquityChart: React.FC<EquityChartProps> = ({ trades }) => {
  // Filter out initial balance entries
  const filteredTrades = trades.filter(trade => !(trade.type === 'balance' || trade.type === ''));
  
  const equityData = filteredTrades
    .filter(trade => trade.balance)
    .map(trade => ({
      date: trade.openTime,
      equity: trade.balance,
      profit: trade.profit || 0,
    }));

  const config = {
    equity: {
      label: 'Equity',
      theme: {
        light: '#0ea5e9', // Bright blue matching design
        dark: '#0ea5e9',
      },
    },
    profit: {
      label: 'Trade P/L',
      theme: {
        light: 'hsl(var(--success))',
        dark: 'hsl(var(--success))',
      },
    },
  };

  // Find initial and final equity values for display
  const initialEquity = equityData.length > 0 ? equityData[0].equity : 0;
  const finalEquity = equityData.length > 0 ? equityData[equityData.length - 1].equity : 0;

  // Find minimum and maximum equity for better Y-axis scaling
  const minEquity = Math.min(...equityData.map(d => d.equity)) * 0.95; // Add 5% padding
  const maxEquity = Math.max(...equityData.map(d => d.equity)) * 1.05; // Add 5% padding
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Equity Curve</h2>
        <div className="text-sm text-muted-foreground">
          {equityData.length > 0 && (
            <>
              Initial: ${initialEquity.toLocaleString()}
              <span className="mx-2">•</span>
              Final: ${finalEquity.toLocaleString()}
            </>
          )}
        </div>
      </div>
      
      <div className="w-full overflow-hidden">
        <div className="h-[350px] w-full bg-[#121212]">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={equityData} 
                margin={{ top: 20, right: 30, left: 80, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear().toString().slice(2)}`;
                  }}
                  height={20}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickMargin={10}
                  axisLine={{ stroke: "#374151" }}
                  tickLine={{ stroke: "#374151" }}
                />
                <YAxis 
                  width={70} 
                  tickFormatter={(value) => formatCurrency(value)}
                  domain={[minEquity, maxEquity]}
                  padding={{ top: 20, bottom: 20 }}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={{ stroke: "#374151" }}
                  tickLine={{ stroke: "#374151" }}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 shadow-md">
                        <div className="text-xs text-slate-400">
                          {new Date(data.date).toLocaleDateString()}
                        </div>
                        <div className="text-base font-bold text-white">
                          ${data.equity.toLocaleString()}
                        </div>
                        {data.profit !== 0 && (
                          <div className={`text-xs ${data.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {data.profit > 0 ? '+' : ''}{data.profit.toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#equity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default EquityChart;
