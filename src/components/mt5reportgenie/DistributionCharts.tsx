
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MT5Trade } from '@/types/mt5reportgenie';

interface DistributionChartsProps {
  trades: MT5Trade[];
}

const DistributionCharts: React.FC<DistributionChartsProps> = ({ trades }) => {
  // Filter only completed trades with profit/loss
  const completedTrades = trades.filter(trade => trade.profit !== undefined && trade.profit !== 0);
  
  // Create profit distribution data
  const profitRanges = [-2000, -1000, -500, 0, 500, 1000, 2000];
  const distributionData = profitRanges.slice(0, -1).map((min, i) => {
    const max = profitRanges[i + 1];
    const count = completedTrades.filter(t => 
      t.profit && t.profit >= min && t.profit < max
    ).length;
    return {
      range: `${min} to ${max}`,
      count,
      min,
      max,
    };
  });

  const config = {
    distribution: {
      label: 'Trade Distribution',
      theme: {
        light: 'hsl(var(--primary))',
        dark: 'hsl(var(--primary))',
      },
    },
  };

  return (
    <div className="space-y-4 mb-24">
      <h2 className="text-xl font-semibold">Profit Distribution</h2>
      <Card className="pt-6 pb-24">
        <div className="w-full" style={{ minHeight: '450px' }}>
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={distributionData} 
                margin={{ top: 10, right: 20, left: 20, bottom: 90 }}
              >
                <XAxis 
                  dataKey="range"
                  interval={0}
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis allowDecimals={false} width={40} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-xs text-muted-foreground">
                          Range: ${data.min} to ${data.max}
                        </div>
                        <div className="text-sm font-bold">
                          {data.count} trades
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" maxBarSize={50}>
                  {distributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.min < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'}
                      fillOpacity={0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};

export default DistributionCharts;
