
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileType } from '@/types/mt5reportgenie';
import { Circle, BarChart2, TrendingDown, Calculator, FileText, Trash2 } from 'lucide-react';
import KpiCards from './KpiCards';
import EquityChart from './EquityChart';
import RiskMetrics from './RiskMetrics';
import DistributionCharts from './DistributionCharts';
import CalendarView from './CalendarView';
import NarrativePanel from './NarrativePanel';

interface ReportDashboardProps {
  files: FileType[];
  onClearFiles: () => void;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ files, onClearFiles }) => {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id);
  
  const activeFile = files.find(file => file.id === activeFileId);
  
  // Mock data for demo - in a real app, this would come from the backend
  const mockMetrics = {
    totalNetProfit: 12547.89,
    grossProfit: 17890.34,
    grossLoss: -5342.45,
    profitFactor: 3.35,
    expectedPayoff: 47.91,
    absoluteDrawdown: 1876.50,
    maxDrawdown: 3421.67,
    relativeDrawdown: 15.3, // percent
    sharpeRatio: 1.89,
    sortinoRatio: 2.34,
    calmarRatio: 1.12,
    tradesTotal: 262,
    tradesShort: 145,
    tradesLong: 117,
    winRate: 68.7, // percent
    avgTradeProfit: 47.89,
    avgWinning: 104.62,
    avgLosing: -69.38,
    largestWin: 846.75,
    largestLoss: -423.56,
    recoveryFactor: 3.67,
    tradeDuration: "4h 12m", // average
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="space-y-2 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Strategy Analysis</h2>
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <Badge 
                key={file.id}
                variant={file.id === activeFileId ? "default" : "outline"} 
                className="cursor-pointer py-1.5 px-3"
                onClick={() => setActiveFileId(file.id)}
              >
                <Circle className={`h-2 w-2 mr-1 ${file.id === activeFileId ? "text-primary-foreground" : "text-muted-foreground"}`} />
                {file.name}
              </Badge>
            ))}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClearFiles}
          className="flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>
      
      <KpiCards metrics={mockMetrics} />
      
      <Tabs defaultValue="equity" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="equity" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" /> Equity
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center">
            <TrendingDown className="h-4 w-4 mr-2" /> Risk
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center">
            <Calculator className="h-4 w-4 mr-2" /> Distribution
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calculator className="h-4 w-4 mr-2" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="narrative" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" /> Narrative
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="equity">
          <Card>
            <CardContent className="p-6">
              <EquityChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="risk">
          <Card>
            <CardContent className="p-6">
              <RiskMetrics />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution">
          <Card>
            <CardContent className="p-6">
              <DistributionCharts />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <CalendarView />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="narrative">
          <Card>
            <CardContent className="p-6">
              <NarrativePanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline">
          Export PDF Report
        </Button>
        <Button variant="outline">
          Download Charts
        </Button>
        <Button>
          Compare Strategies
        </Button>
      </div>
    </div>
  );
};

export default ReportDashboard;
