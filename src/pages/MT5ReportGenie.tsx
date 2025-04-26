
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import FileUploadZone from '@/components/mt5reportgenie/FileUploadZone';
import ReportDashboard from '@/components/mt5reportgenie/ReportDashboard';
import { toast } from '@/components/ui/use-toast';
import { FileType } from '@/types/mt5reportgenie';
import { Link } from 'react-router-dom';
import { Github, Code } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const MT5ReportGenie = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const addProcessingStep = (step: string) => {
    setProcessingSteps(prev => [...prev, `${new Date().toISOString()} - ${step}`]);
  };

  const handleFilesUploaded = (newFiles: FileType[]) => {
    setIsProcessing(true);
    addProcessingStep(`Starting to process ${newFiles.length} files`);
    
    setTimeout(() => {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setIsProcessing(false);
      addProcessingStep(`Processed ${newFiles.length} files successfully`);
      
      toast({
        title: "Files processed successfully",
        description: `${newFiles.length} ${newFiles.length === 1 ? 'file' : 'files'} have been processed.`
      });
    }, 2000);
  };

  const handleClearFiles = () => {
    setFiles([]);
    setProcessingSteps([]);
    addProcessingStep('Cleared all files and processing history');
    toast({
      title: "All files cleared",
      description: "Your workspace has been reset."
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-neulis">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">MT5 Report Genie</h1>
            <p className="text-muted-foreground mt-2">
              Upload MetaTrader 5 Strategy Tester reports for professional-grade performance analysis
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <Switch
                id="debug-mode"
                checked={showDebug}
                onCheckedChange={setShowDebug}
              />
              <Label htmlFor="debug-mode" className="flex items-center">
                <Code className="h-4 w-4 mr-1" />
                Debug Mode
              </Label>
            </div>
            <Link 
              to="https://github.com/roboquant/mt5-report-genie" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="mr-2 h-5 w-5" />
              <span>GitHub</span>
            </Link>
          </div>
        </div>
        
        {showDebug && (
          <Card className="p-4 mb-8 bg-muted/20 border-dashed">
            <h3 className="text-sm font-semibold mb-2 text-primary">Processing Steps</h3>
            <div className="space-y-1 text-xs font-mono max-h-40 overflow-auto">
              {processingSteps.length === 0 ? (
                <p className="text-muted-foreground">No processing steps recorded yet.</p>
              ) : (
                processingSteps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-primary mr-2">→</span>
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
        
        {files.length === 0 ? (
          <FileUploadZone 
            onFilesUploaded={handleFilesUploaded} 
            isProcessing={isProcessing} 
            onProcessingStep={addProcessingStep}
          />
        ) : (
          <ReportDashboard files={files} onClearFiles={handleClearFiles} />
        )}
      </div>
      
      <footer className="py-6 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} RoboQuant Academy MT5 Report Genie - 
            <Link to="/" className="ml-1 text-blue-primary hover:text-teal-primary transition-colors">
              Back to Home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MT5ReportGenie;
