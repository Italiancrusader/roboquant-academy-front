import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MonthlyReturn } from '@/types/strategyreportgenie';

interface MonthlyPerformanceHeatmapProps {
  monthlyReturns: MonthlyReturn[];
  currency?: string;
}

const MonthlyPerformanceHeatmap: React.FC<MonthlyPerformanceHeatmapProps> = ({ 
  monthlyReturns,
  currency = '$'
}) => {
  const [displayMode, setDisplayMode] = React.useState<'return' | 'heatmap'>('heatmap');
  
  // Create a matrix of monthly returns by year and month
  const { matrix, years, maxReturn, minReturn, yearlyReturns } = useMemo(() => {
    if (!monthlyReturns || !monthlyReturns.length) {
      return { 
        matrix: [], 
        years: [], 
        maxReturn: 0, 
        minReturn: 0,
        yearlyReturns: {}
      };
    }
    
    // Extract unique years
    const uniqueYears = [...new Set(monthlyReturns.map(m => m.year))].sort();
    
    // Create matrix
    const returnMatrix: { [year: number]: { [month: number]: number } } = {};
    const yearTotals: { [year: number]: number } = {};
    
    // Initialize matrix with zeros
    uniqueYears.forEach(year => {
      returnMatrix[year] = {};
      yearTotals[year] = 0;
      for (let month = 1; month <= 12; month++) {
        returnMatrix[year][month] = 0;
      }
    });
    
    // Fill in matrix with data
    monthlyReturns.forEach(monthly => {
      returnMatrix[monthly.year][monthly.month] = monthly.return;
      yearTotals[monthly.year] += monthly.return;
    });
    
    // Find min/max returns
    const allReturns = monthlyReturns.map(m => m.return);
    const max = Math.max(...allReturns);
    const min = Math.min(...allReturns);
    
    return { 
      matrix: returnMatrix, 
      years: uniqueYears, 
      maxReturn: max,
      minReturn: min,
      yearlyReturns: yearTotals
    };
  }, [monthlyReturns]);
  
  // Get month name
  const getMonthName = (month: number): string => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return monthNames[month - 1];
  };
  
  // Get color for a cell based on return value
  const getCellColor = (returnValue: number): string => {
    if (returnValue === 0) return 'bg-gray-100 dark:bg-gray-800';
    
    if (returnValue > 0) {
      // Green scale for positive returns
      const intensity = Math.min(returnValue / maxReturn, 1);
      const alpha = 0.2 + (intensity * 0.8);
      return `bg-green-500/[${alpha}]`;
    } else {
      // Red scale for negative returns
      const intensity = Math.min(Math.abs(returnValue) / Math.abs(minReturn), 1);
      const alpha = 0.2 + (intensity * 0.8);
      return `bg-red-500/[${alpha}]`;
    }
  };
  
  // Format return value
  const formatReturn = (value: number): string => {
    if (value === 0) return '0.00%';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Monthly Performance</CardTitle>
          <Select 
            value={displayMode} 
            onValueChange={(value) => setDisplayMode(value as 'return' | 'heatmap')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Display Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heatmap">Heatmap</SelectItem>
              <SelectItem value="return">Return Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 font-semibold text-left">Year</th>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <th key={`header-${month}`} className="p-2 font-semibold text-center">
                    {getMonthName(month)}
                  </th>
                ))}
                <th className="p-2 font-semibold text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {years.map(year => (
                <tr key={`row-${year}`} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2 font-semibold">{year}</td>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                    const returnValue = matrix[year][month];
                    const cellClass = displayMode === 'heatmap' ? getCellColor(returnValue) : '';
                    
                    return (
                      <td 
                        key={`cell-${year}-${month}`} 
                        className={`p-2 text-center ${cellClass} ${returnValue === 0 ? 'text-gray-400' : returnValue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {formatReturn(returnValue)}
                      </td>
                    );
                  })}
                  <td 
                    className={`p-2 text-center font-semibold ${yearlyReturns[year] === 0 ? 'text-gray-400' : yearlyReturns[year] > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {formatReturn(yearlyReturns[year])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-end items-center space-x-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500/80 mr-1"></div>
            <span>Negative</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 mr-1"></div>
            <span>Flat</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500/80 mr-1"></div>
            <span>Positive</span>
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Best Month</h4>
            <p className="text-green-600 dark:text-green-400 text-lg font-bold">
              {formatReturn(maxReturn)}
            </p>
            {monthlyReturns.find(m => m.return === maxReturn) && (
              <p className="text-xs text-gray-500">
                {getMonthName(monthlyReturns.find(m => m.return === maxReturn)!.month)} {monthlyReturns.find(m => m.return === maxReturn)!.year}
              </p>
            )}
          </div>
          
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Worst Month</h4>
            <p className="text-red-600 dark:text-red-400 text-lg font-bold">
              {formatReturn(minReturn)}
            </p>
            {monthlyReturns.find(m => m.return === minReturn) && (
              <p className="text-xs text-gray-500">
                {getMonthName(monthlyReturns.find(m => m.return === minReturn)!.month)} {monthlyReturns.find(m => m.return === minReturn)!.year}
              </p>
            )}
          </div>
          
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold">Consistency</h4>
            <p className="text-lg font-bold">
              {Math.round((monthlyReturns.filter(m => m.return > 0).length / monthlyReturns.length) * 100)}%
            </p>
            <p className="text-xs text-gray-500">
              Positive Months
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPerformanceHeatmap; 