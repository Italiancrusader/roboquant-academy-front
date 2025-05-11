import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Upload, FileText } from 'lucide-react';
import { generateReportFromCSV } from '@/utils/csvReportGenerator';

interface CSVReportButtonProps {
  className?: string;
}

/**
 * A button component that allows users to upload CSV files and generate PDF reports
 */
const CSVReportButton: React.FC<CSVReportButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportTitle, setReportTitle] = useState('Trading Analysis');

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setFileName(file.name);
    
    // Auto-extract strategy name from filename if possible
    if (file.name.length > 0) {
      const strategyName = file.name.replace(/\.csv$/, '');
      setReportTitle(`${strategyName} - Analysis`);
    }
    
    // Read the CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setCsvContent(e.target.result);
      } else {
        toast({
          title: "Error",
          description: "Failed to read file contents",
          variant: "destructive"
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Error reading the file",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
  };

  // Generate PDF report from CSV
  const handleGenerate = async () => {
    if (!csvContent) {
      toast({
        title: "No data",
        description: "No CSV content to process",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate the report filename
      const reportFileName = fileName.replace('.csv', '') + '_report.pdf';
      
      // Generate the report
      const result = await generateReportFromCSV(
        csvContent, 
        reportFileName, 
        reportTitle
      );
      
      if (result) {
        toast({
          title: "Success",
          description: "PDF report generated successfully!",
        });
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate PDF report",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Error generating report: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline" 
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Upload className="h-4 w-4 mr-2" />
        CSV Report
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate CSV-based PDF Report</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing your trading data to generate a comprehensive PDF report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input 
                id="csv-file" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
              />
              {fileName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {fileName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input 
                id="report-title" 
                type="text" 
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Trading Analysis"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={!csvContent || isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-current"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CSVReportButton; 