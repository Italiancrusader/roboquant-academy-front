
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, FileUp, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileType } from '@/types/strategyreportgenie';
import { toast } from '@/components/ui/use-toast';
import { parseMT5Excel, validateStrategyFile } from '@/utils/strategyparser';

interface FileUploadZoneProps {
  onFilesUploaded: (files: FileType[]) => void;
  isProcessing: boolean;
  onProcessingStep?: (step: string) => void;
  initialBalance?: number;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  onFilesUploaded,
  isProcessing,
  onProcessingStep,
  initialBalance
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localProcessing, setLocalProcessing] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for .xlsx files
    const validFiles = acceptedFiles.filter(validateStrategyFile);
    
    if (validFiles.length < acceptedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only Strategy Tester Excel (.xlsx) files are supported.",
        variant: "destructive"
      });
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      console.log("Files selected:", validFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

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
      
      for (const file of selectedFiles) {
        try {
          onProcessingStep?.(`Parsing file: ${file.name}`);
          console.log(`Parsing file: ${file.name}`);
          
          const parsedData = await parseMT5Excel(file, initialBalance);
          console.log("Parsed data:", parsedData);
          
          processedFiles.push({
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            dateUploaded: new Date(),
            parsedData,
            source: parsedData.source // Add the source property from parsedData
          });
        } catch (error) {
          console.error(`Error parsing file ${file.name}:`, error);
          toast({
            title: `Error parsing ${file.name}`,
            description: "The file format appears to be invalid. Please ensure it's a Strategy Tester report.",
            variant: "destructive"
          });
        }
      }

      if (processedFiles.length > 0) {
        console.log("Files processed successfully:", processedFiles);
        onFilesUploaded(processedFiles);
        setSelectedFiles([]);
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
              or click to browse your computer for Strategy Tester .xlsx files
            </p>
            <Button variant="outline" disabled={isDragActive}>
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>
      
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
                    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
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
