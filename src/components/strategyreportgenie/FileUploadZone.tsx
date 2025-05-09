
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, FileUp, AlertCircle, Loader2, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileType } from '@/types/strategyreportgenie';
import { toast } from '@/components/ui/use-toast';
import { parseMT5Excel, validateStrategyFile } from '@/utils/strategyparser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileUploadZoneProps {
  onFilesUploaded: (files: FileType[]) => void;
  isProcessing: boolean;
  onProcessingStep?: (step: string) => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  onFilesUploaded,
  isProcessing,
  onProcessingStep
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [initialBalance, setInitialBalance] = useState<string>("10000.00");
  const [hasTradingViewFile, setHasTradingViewFile] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for .xlsx files
    const validFiles = acceptedFiles.filter(validateStrategyFile);
    
    if (validFiles.length < acceptedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only Excel (.xlsx) report files are supported.",
        variant: "destructive"
      });
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      console.log("Files selected:", validFiles);
      
      // Check if any of the files might be TradingView files
      const possiblyTradingView = validFiles.some(file => 
        file.name.toLowerCase().includes('tradingview') || 
        file.name.toLowerCase().includes('tv') ||
        file.name.toLowerCase().includes('trading view') ||
        file.name.toLowerCase().includes('list of trades')
      );
      
      setHasTradingViewFile(possiblyTradingView);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  const processFile = async (file: File) => {
    try {
      onProcessingStep?.(`Parsing file: ${file.name}`);
      console.log(`Parsing file: ${file.name}`);
      
      // Check if this might be a TradingView file based on filename
      const isTradingView = file.name.toLowerCase().includes('tradingview') || 
                            file.name.toLowerCase().includes('tv') ||
                            file.name.toLowerCase().includes('trading view') ||
                            file.name.toLowerCase().includes('list of trades');
      
      // Parse with initial balance if it's a TradingView file
      const parsedBalance = isTradingView ? parseFloat(initialBalance.replace(/,/g, '')) : undefined;
      const parsedData = await parseMT5Excel(file, parsedBalance);
      console.log("Parsed data:", parsedData);
      
      // Determine source type based on parsed data
      let source: 'MT4' | 'MT5' | 'TradingView' = parsedData.source;
      
      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        dateUploaded: new Date(),
        parsedData,
        source
      };
    } catch (error) {
      console.error(`Error parsing file ${file.name}:`, error);
      toast({
        title: `Error parsing ${file.name}`,
        description: "The file format appears to be invalid. Please ensure it's a valid report file.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      // Immediately show loading state before any processing starts
      setLocalProcessing(true);
      // Signal to parent component to show loading overlay immediately
      onProcessingStep?.('Starting file processing');
      console.log("Starting file processing - showing loading overlay");
      
      // Small delay to ensure UI updates before heavy processing begins
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const processedFiles: FileType[] = [];
      
      // Process all files
      for (const file of selectedFiles) {
        const processed = await processFile(file);
        if (processed) {
          processedFiles.push(processed);
        }
      }
      
      if (processedFiles.length > 0) {
        onFilesUploaded(processedFiles);
        setSelectedFiles([]);
        setHasTradingViewFile(false);
      } else {
        toast({
          title: "No valid files found",
          description: "None of the selected files could be processed. Please try different files.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing failed",
        description: "There was an error processing the files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLocalProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 text-center cursor-pointer rounded-lg transition-colors ${
              isDragActive ? 'bg-muted/50' : 'hover:bg-muted/20'
            }`}
          >
            <input {...getInputProps()} />
            <div className="mb-6">
              {isDragActive ? (
                <FileUp className="h-16 w-16 text-primary animate-pulse" />
              ) : (
                <Upload className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              or click to browse your computer for MetaTrader 4/5 or TradingView .xlsx files
            </p>
            <Button variant="outline" disabled={isDragActive}>
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {hasTradingViewFile && (
        <div className="bg-blue-primary/10 border border-blue-primary/20 rounded-lg p-4">
          <div className="flex items-start">
            <CircleDollarSign className="h-5 w-5 text-blue-primary mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Initial Balance</h4>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Enter the initial balance for your TradingView report. 
                This value will be used for calculating performance metrics.
              </p>
              <div className="flex items-center max-w-xs">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    className="pl-7"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="10000.00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Selected Files</h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center">
                  <File className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const newFiles = selectedFiles.filter((_, i) => i !== index);
                    setSelectedFiles(newFiles);
                    // Update hasTradingViewFile flag if we remove a TradingView file
                    if (newFiles.length === 0 || !newFiles.some(f => 
                      f.name.toLowerCase().includes('tradingview') || 
                      f.name.toLowerCase().includes('tv') ||
                      f.name.toLowerCase().includes('trading view') ||
                      f.name.toLowerCase().includes('list of trades')
                    )) {
                      setHasTradingViewFile(false);
                    }
                    onProcessingStep?.(`Removed file: ${file.name}`);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleUpload} 
              disabled={isProcessing || localProcessing}
              className="px-6"
            >
              {isProcessing || localProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Analyze Files'
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className="bg-blue-primary/10 border border-blue-primary/20 rounded-lg p-4 mt-8">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-primary mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">Important</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Files are processed locally in your browser and are never stored on our servers.
              For optimal performance, we recommend files under 10MB in size.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;
