
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
          setCsvData(rows.slice(0, 100)); // Limit to first 100 rows for performance
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
          </TabsList>
          
          <TabsContent value="csv">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : csvData.length > 0 ? (
              <div className="max-h-64 overflow-auto">
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CsvViewer;
