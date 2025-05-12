
import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { TradeType } from '@/types/strategyreportgenie';

interface TradeDistributionAnalysisProps {
  trades: TradeType[];
  currency?: string;
}

const TradeDistributionAnalysis: React.FC<TradeDistributionAnalysisProps> = ({ 
  trades,
  currency = '$'
}) => {
  const [distributionType, setDistributionType] = useState<'profit' | 'duration' | 'hour' | 'day'>('profit');
  
  // Process trade data for distribution analysis
  const { 
    profitDistribution, 
    durationDistribution, 
    hourDistribution,
    dayDistribution,
    profitStats,
    durationStats,
  } = useMemo(() => {
    if (!trades || !trades.length) {
      return {
        profitDistribution: [],
        durationDistribution: [],
        hourDistribution: [],
        dayDistribution: [],
        profitStats: { mean: 0, median: 0, stdDev: 0 },
        durationStats: { mean: 0, median: 0, stdDev: 0 }
      };
    }

    // Filter completed trades
    const completedTrades = trades.filter(t => t.profit !== undefined && t.state === 'out');
    
    // Extract profit values
    const profitValues = completedTrades.map(t => t.profit || 0);
    
    // Calculate profit distribution
    const calculateProfitDistribution = () => {
      if (!profitValues.length) return [];
      
      // Calculate min/max profit
      const minProfit = Math.min(...profitValues);
      const maxProfit = Math.max(...profitValues);
      
      // Calculate bin size - aim for 10-20 bins
      const range = maxProfit - minProfit;
      const binSize = range / 15; // target 15 bins
      
      // Create bins
      const bins: { [key: string]: number } = {};
      
      profitValues.forEach(profit => {
        const binIndex = Math.floor(profit / binSize);
        const binKey = `${(binIndex * binSize).toFixed(2)}`;
        
        if (!bins[binKey]) {
          bins[binKey] = 0;
        }
        
        bins[binKey]++;
      });
      
      // Convert to array
      return Object.entries(bins).map(([range, count]) => ({
        range: parseFloat(range),
        count,
        isPositive: parseFloat(range) >= 0
      })).sort((a, b) => a.range - b.range);
    };
    
    // Calculate duration distribution
    const calculateDurationDistribution = () => {
      // Process durations, convert to hours
      const durations = completedTrades.map(trade => {
        const durationStr = trade.duration;
        if (!durationStr) return 0;
        
        // Parse "2d 5h 30m" format
        let totalHours = 0;
        const dayMatch = durationStr.match(/(\d+)d/);
        const hourMatch = durationStr.match(/(\d+)h/);
        const minMatch = durationStr.match(/(\d+)m/);
        
        if (dayMatch) totalHours += parseInt(dayMatch[1]) * 24;
        if (hourMatch) totalHours += parseInt(hourMatch[1]);
        if (minMatch) totalHours += parseInt(minMatch[1]) / 60;
        
        return totalHours;
      });
      
      // Calculate bin size - aim for 8-12 bins
      const maxDuration = Math.max(...durations);
      const binSize = Math.max(1, Math.ceil(maxDuration / 10)); // at least 1 hour bins
      
      // Create bins
      const bins: { [key: string]: number } = {};
      
      durations.forEach(duration => {
        const binIndex = Math.floor(duration / binSize);
        const binKey = `${binIndex * binSize}`;
        
        if (!bins[binKey]) {
          bins[binKey] = 0;
        }
        
        bins[binKey]++;
      });
      
      // Convert to array
      return Object.entries(bins).map(([hours, count]) => ({
        hours: parseInt(hours),
        count,
        label: `${hours}-${parseInt(hours) + binSize} h`
      })).sort((a, b) => a.hours - b.hours);
    };
    
    // Calculate hour of day distribution
    const calculateHourDistribution = () => {
      const hourCounts = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
      
      completedTrades.forEach(trade => {
        if (trade.openTime) {
          const hour = trade.openTime.getHours();
          hourCounts[hour].count++;
        }
      });
      
      return hourCounts;
    };
    
    // Calculate day of week distribution
    const calculateDayDistribution = () => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayCounts = dayNames.map(day => ({ day, count: 0 }));
      
      completedTrades.forEach(trade => {
        if (trade.openTime) {
          const day = trade.openTime.getDay();
          dayCounts[day].count++;
        }
      });
      
      return dayCounts;
    };
    
    // Calculate statistics
    const calculateStats = (values: number[]) => {
      if (!values.length) return { mean: 0, median: 0, stdDev: 0 };
      
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      
      const sorted = [...values].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 
        ? (sorted[middle - 1] + sorted[middle]) / 2 
        : sorted[middle];
      
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      return { mean, median, stdDev };
    };
    
    return {
      profitDistribution: calculateProfitDistribution(),
      durationDistribution: calculateDurationDistribution(),
      hourDistribution: calculateHourDistribution(),
      dayDistribution: calculateDayDistribution(),
      profitStats: calculateStats(profitValues),
      durationStats: calculateStats(completedTrades.map(t => {
        const durationStr = t.duration;
        if (!durationStr) return 0;
        
        // Parse "2d 5h 30m" format
        let totalHours = 0;
        const dayMatch = durationStr.match(/(\d+)d/);
        const hourMatch = durationStr.match(/(\d+)h/);
        const minMatch = durationStr.match(/(\d+)m/);
        
        if (dayMatch) totalHours += parseInt(dayMatch[1]) * 24;
        if (hourMatch) totalHours += parseInt(hourMatch[1]);
        if (minMatch) totalHours += parseInt(minMatch[1]) / 60;
        
        return totalHours;
      })),
    };
  }, [trades]);
  
  // Format profit for display
  const formatProfit = (value: number) => {
    return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Format hours for display
  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
    return `${Math.floor(hours / 24)}d ${Math.floor(hours % 24)}h`;
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      switch (distributionType) {
        case 'profit':
          return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
              <p className="mb-1 font-semibold">Profit Range: {formatProfit(payload[0].payload.range)} to {formatProfit(payload[0].payload.range + (profitDistribution[1]?.range - profitDistribution[0]?.range || 0))}</p>
              <p>Number of Trades: {payload[0].value}</p>
            </div>
          );
        case 'duration':
          return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
              <p className="mb-1 font-semibold">Duration: {payload[0].payload.label}</p>
              <p>Number of Trades: {payload[0].value}</p>
            </div>
          );
        case 'hour':
          return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
              <p className="mb-1 font-semibold">Hour: {label}:00</p>
              <p>Number of Trades: {payload[0].value}</p>
            </div>
          );
        case 'day':
          return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
              <p className="mb-1 font-semibold">Day: {label}</p>
              <p>Number of Trades: {payload[0].value}</p>
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };
  
  // Render chart based on selected distribution type
  const renderChart = () => {
    switch (distributionType) {
      case 'profit':
        return (
          <div className="w-full aspect-[16/9]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={profitDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  tickFormatter={value => formatProfit(value)}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Number of Trades">
                  {profitDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isPositive ? '#65B741' : '#ff4d4f'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'duration':
        return (
          <div className="w-full aspect-[16/9]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={durationDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Number of Trades" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'hour':
        return (
          <div className="w-full aspect-[16/9]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={hourDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={value => `${value}:00`} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Number of Trades" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'day':
        return (
          <div className="w-full aspect-[16/9]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dayDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Number of Trades" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Render statistics based on selected distribution type
  const renderStats = () => {
    if (distributionType === 'profit') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Mean Profit</h4>
            <p className="text-lg font-bold">
              {formatProfit(profitStats.mean)}
            </p>
          </div>
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Median Profit</h4>
            <p className="text-lg font-bold">
              {formatProfit(profitStats.median)}
            </p>
          </div>
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Standard Deviation</h4>
            <p className="text-lg font-bold">
              {formatProfit(profitStats.stdDev)}
            </p>
          </div>
        </div>
      );
    }
    
    if (distributionType === 'duration') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Mean Duration</h4>
            <p className="text-lg font-bold">
              {formatHours(durationStats.mean)}
            </p>
          </div>
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Median Duration</h4>
            <p className="text-lg font-bold">
              {formatHours(durationStats.median)}
            </p>
          </div>
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Standard Deviation</h4>
            <p className="text-lg font-bold">
              {formatHours(durationStats.stdDev)}
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Get card description based on selected distribution type
  const getDescription = () => {
    switch (distributionType) {
      case 'profit':
        return "Frequency distribution of trade profits showing the number of trades in each profit range.";
      case 'duration':
        return "Distribution of trade durations showing how long positions are typically held.";
      case 'hour':
        return "Distribution of trades by hour of day, showing when trades are opened.";
      case 'day':
        return "Distribution of trades by day of week, showing which days see the most activity.";
      default:
        return "";
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Trade Distribution Analysis</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </div>
          <Select 
            value={distributionType} 
            onValueChange={(value) => setDistributionType(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Distribution Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profit">Profit Distribution</SelectItem>
              <SelectItem value="duration">Duration Distribution</SelectItem>
              <SelectItem value="hour">Hour of Day</SelectItem>
              <SelectItem value="day">Day of Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
        {renderStats()}
      </CardContent>
    </Card>
  );
};

export default TradeDistributionAnalysis; 
