import { React, forwardRef } from '@/utils/react-singleton';
import { FileType } from '@/types/strategyreportgenie';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Trash2, 
  SlidersHorizontal, 
  Target,
  RefreshCw,
} from 'lucide-react';

interface DashboardHeaderProps {
  files: FileType[];
  activeFileId: string;
  initialCapital: string;
  onFileChange: (fileId: string) => void;
  onCapitalChange: (value: string) => void;
  onRecalculate: () => void;
  onClearFiles: () => void;
  onGeneratePDF: () => void;
  onHtmlExport: () => void;
  onOptimizeStrategy: () => void;
}

const DashboardHeader = forwardRef<HTMLDivElement, DashboardHeaderProps>(({
  files,
  activeFileId,
  initialCapital,
  onFileChange,
  onCapitalChange,
  onRecalculate,
  onClearFiles,
  onGeneratePDF,
  onHtmlExport,
  onOptimizeStrategy
}, ref) => {
  // Function to get source badge for the file
  const getSourceBadge = (source: 'MT4' | 'MT5' | 'TradingView' | undefined) => {
    switch(source) {
      case 'MT4':
        return <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">MT4</Badge>;
      case 'MT5':
        return <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">MT5</Badge>;
      case 'TradingView':
        return <Badge variant="outline" className="ml-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">TradingView</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-4 border-border/40 shadow-sm" ref={ref}>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
          <div className="flex-1">
            <div className="flex flex-col space-y-2 w-full">
              <label className="text-sm font-medium">Select Report:</label>
              <div className="flex flex-wrap gap-2">
                {files.map(file => (
                  <Button
                    key={file.id}
                    variant={activeFileId === file.id ? "default" : "outline"}
                    size="sm"
                    className="overflow-hidden text-ellipsis"
                    onClick={() => onFileChange(file.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    {getSourceBadge(file.parsedData?.source)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onHtmlExport}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOptimizeStrategy}
              className="flex items-center"
            >
              <Target className="h-4 w-4 mr-2" />
              Optimize
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onClearFiles}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full mt-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Initial Capital:</span> Set the starting balance for all calculations
          </div>
          
          <div className="flex gap-2 flex-1 max-w-xs">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="initialCapital"
                className="pl-7"
                value={initialCapital}
                onChange={(e) => onCapitalChange(e.target.value)}
                placeholder="10000.00"
              />
            </div>
            <Button 
              variant="secondary" 
              className="flex items-center" 
              onClick={onRecalculate}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalculate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default DashboardHeader; 