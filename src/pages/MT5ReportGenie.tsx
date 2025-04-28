
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import FileUploadZone from '@/components/mt5reportgenie/FileUploadZone';
import ReportDashboard from '@/components/mt5reportgenie/ReportDashboard';
import LoadingOverlay from '@/components/mt5reportgenie/LoadingOverlay';
import { toast } from '@/components/ui/use-toast';
import { FileType } from '@/types/mt5reportgenie';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const MT5ReportGenie = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string>('');

  const handleFilesUploaded = (newFiles: FileType[]) => {
    // isProcessing is already set to true when processing step is triggered
    console.log("Processing files:", newFiles);
    
    // Add a slight delay to simulate processing
    setTimeout(() => {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setIsProcessing(false);
      
      toast({
        title: "Files processed successfully",
        description: `${newFiles.length} ${newFiles.length === 1 ? 'file' : 'files'} have been processed.`
      });
      console.log("Files processed and added to state");
    }, 2000);
  };

  const handleProcessingStep = (step: string) => {
    console.log("Processing step:", step);
    // Set processing state to true as soon as any processing step is initiated
    setIsProcessing(true);
    setProcessingSteps(step);
  };

  const handleClearFiles = () => {
    setFiles([]);
    toast({
      title: "All files cleared",
      description: "Your workspace has been reset."
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-neulis">
      <Navbar />
      {isProcessing && <LoadingOverlay message={processingSteps} />}
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">MT5 Report Genie</h1>
            <p className="text-muted-foreground mt-2">
              Upload MetaTrader 5 Strategy Tester reports for professional-grade performance analysis
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
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
        
        <div className="mb-20">
          {files.length === 0 ? (
            <FileUploadZone 
              onFilesUploaded={handleFilesUploaded}
              isProcessing={isProcessing}
              onProcessingStep={handleProcessingStep}
            />
          ) : (
            <ReportDashboard files={files} onClearFiles={handleClearFiles} />
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t border-border bg-secondary mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RoboQuant Academy
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/mt5-report-genie" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                MT5 Report Genie
              </Link>
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MT5ReportGenie;
