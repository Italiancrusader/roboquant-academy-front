
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParsedMT5Report } from '@/types/mt5reportgenie';

interface CsvViewerProps {
  csvUrl: string | null;
  fileName: string;
  parsedData?: ParsedMT5Report;
}

const CsvViewer: React.FC<CsvViewerProps> = ({ csvUrl, fileName, parsedData }) => {
  const [csvData, setCsvData] = React.useState<string[][]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (csvUrl) {
      setIsLoading(true);
      fetch(csvUrl)
        .then(response => response.text())
        .then(text => {
          const rows = text.split('\n').map(row => row.split(','));
          setCsvData(rows.filter(row => row.length > 1).slice(0, 100)); // Limit to first 100 rows for performance
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error loading CSV:', error);
          setIsLoading(false);
        });
    }
  }, [csvUrl]);

  const handleDownload = () => {
    if (csvUrl) {
      const link = document.createElement('a');
      link.href = csvUrl;
      link.download = `${fileName.replace('.xlsx', '')}_processed.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Function to get table statistics
  const getTableStats = () => {
    if (!parsedData?.trades || parsedData.trades.length === 0) return null;
    
    const trades = parsedData.trades;
    const inDeals = trades.filter(t => t.state === 'in').length;
    const outDeals = trades.filter(t => t.state === 'out').length;
    const profitableDeals = trades.filter(t => t.profit && t.profit > 0).length;
    const lossDeals = trades.filter(t => t.profit && t.profit < 0).length;
    
    // Calculate profit metrics
    const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const avgProfit = profitableDeals ? trades
      .filter(t => t.profit && t.profit > 0)
      .reduce((sum, t) => sum + (t.profit || 0), 0) / profitableDeals : 0;
    
    const avgLoss = lossDeals ? trades
      .filter(t => t.profit && t.profit < 0)
      .reduce((sum, t) => sum + (t.profit || 0), 0) / lossDeals : 0;

    return {
      totalDeals: trades.length,
      inDeals,
      outDeals,
      profitableDeals,
      lossDeals,
      winRate: outDeals ? ((profitableDeals / outDeals) * 100).toFixed(2) : '0.00',
      totalProfit: totalProfit.toFixed(2),
      avgProfit: avgProfit.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      profitFactor: avgLoss !== 0 ? (Math.abs(avgProfit / avgLoss)).toFixed(2) : '∞',
      initialBalance: parsedData.summary['Initial Balance'] || '0.00',
      finalBalance: parsedData.summary['Final Balance'] || '0.00'
    };
  };

  const tableStats = getTableStats();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            MT5 Report Data
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center" 
            onClick={handleDownload}
            disabled={!csvUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="w-full border-b rounded-none justify-start">
            <TabsTrigger value="csv">CSV Data</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="trades">Trades Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : csvData.length > 0 ? (
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {csvData[0]?.map((header, index) => (
                        <TableHead key={index} className="whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(1, 21).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex} className="font-mono text-xs">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {csvData.length > 21 && (
                  <div className="text-center py-2 text-sm text-muted-foreground border-t">
                    Showing 20 of {csvData.length - 1} rows
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground">No CSV data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="summary">
            {parsedData?.summary ? (
              <div className="p-4">
                <h3 className="font-semibold mb-3">Report Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(parsedData.summary).map(([key, value]) => (
                    <div key={key} className="bg-muted/20 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">{key}</div>
                      <div className="font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground">No summary data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trades">
            {tableStats ? (
              <div className="p-4">
                <h3 className="font-semibold mb-3">Trades Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Deals</div>
                    <div className="font-medium">{tableStats.totalDeals}</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">In Deals</div>
                    <div className="font-medium">{tableStats.inDeals}</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Out Deals</div>
                    <div className="font-medium">{tableStats.outDeals}</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                    <div className="font-medium">{tableStats.winRate}%</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Initial Balance</div>
                    <div className="font-medium">{tableStats.initialBalance}</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Final Balance</div>
                    <div className="font-medium">{tableStats.finalBalance}</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Net Profit</div>
                    <div className="font-medium">{tableStats.totalProfit}</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Profit Factor</div>
                    <div className="font-medium">{tableStats.profitFactor}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Trade Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted/10 rounded">
                        <span>Profitable Deals</span>
                        <span className="text-green-500 font-medium">{tableStats.profitableDeals}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/10 rounded">
                        <span>Loss Deals</span>
                        <span className="text-red-500 font-medium">{tableStats.lossDeals}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/10 rounded">
                        <span>Average Profit</span>
                        <span className="text-green-500 font-medium">{tableStats.avgProfit}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/10 rounded">
                        <span>Average Loss</span>
                        <span className="text-red-500 font-medium">{tableStats.avgLoss}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Trade Distribution</h4>
                    <div className="relative h-40">
                      {/* Simple trade distribution visualization */}
                      <div className="absolute inset-0 flex items-end">
                        <div 
                          className="bg-green-500/60 rounded-t"
                          style={{ 
                            height: `${(tableStats.profitableDeals / tableStats.totalDeals) * 100}%`, 
                            width: '40%' 
                          }}
                        ></div>
                        <div className="mx-2"></div>
                        <div 
                          className="bg-red-500/60 rounded-t"
                          style={{ 
                            height: `${(tableStats.lossDeals / tableStats.totalDeals) * 100}%`, 
                            width: '40%' 
                          }}
                        ></div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                        <span className="text-xs">Win</span>
                        <span className="text-xs">Loss</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground">No trade data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CsvViewer;
