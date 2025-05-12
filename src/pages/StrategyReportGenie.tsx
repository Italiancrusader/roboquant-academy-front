
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import FileUploadZone from '@/components/strategyreportgenie/FileUploadZone';
import ReportDashboard from '@/components/strategyreportgenie/ReportDashboard';
import LoadingOverlay from '@/components/strategyreportgenie/LoadingOverlay';
import { toast } from '@/components/ui/use-toast';
import { FileType } from '@/types/strategyreportgenie';
import { Link } from 'react-router-dom';
import PDFReportGenerator from '@/components/strategyreportgenie/PDFReportGenerator';
import MonteCarloSimulation from '@/components/strategyreportgenie/MonteCarloSimulation';
import StrategyOptimizer from '@/components/strategyreportgenie/StrategyOptimizer';
import Footer from '@/components/Footer';

const StrategyReportGenie = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string>('');
  const [activeDialog, setActiveDialog] = useState<'pdf' | 'monteCarlo' | 'optimize' | null>(null);
  
  const handleFilesUploaded = (newFiles: FileType[]) => {
    // isProcessing is already set to true when processing step is triggered
    console.log("Processing files:", newFiles);

    // Add a slight delay to simulate processing
    setTimeout(() => {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
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
  
  const handleGeneratePDF = () => {
    if (!files.length) {
      toast({
        title: "No data available",
        description: "Please upload at least one report file first.",
        variant: "destructive"
      });
      return;
    }
    
    setActiveDialog('pdf');
  };
  
  const handleMonteCarloSimulation = () => {
    if (!files.length) {
      toast({
        title: "No data available",
        description: "Please upload at least one report file first.",
        variant: "destructive"
      });
      return;
    }
    
    setActiveDialog('monteCarlo');
  };
  
  const handleOptimizeStrategy = () => {
    if (!files.length) {
      toast({
        title: "No data available",
        description: "Please upload at least one report file first.",
        variant: "destructive"
      });
      return;
    }
    
    setActiveDialog('optimize');
  };
  
  const closeDialog = () => {
    setActiveDialog(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-neulis">
      <Navbar />
      {isProcessing && <LoadingOverlay message={processingSteps} />}
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Strategy Report Genie</h1>
            <p className="text-muted-foreground mt-2">
              Upload MetaTrader 4/5 or TradingView strategy reports for professional-grade performance analysis
            </p>
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
            <ReportDashboard 
              files={files} 
              onClearFiles={handleClearFiles}
              onGeneratePDF={handleGeneratePDF}
              onMonteCarloSimulation={handleMonteCarloSimulation}
              onOptimizeStrategy={handleOptimizeStrategy}
            />
          )}
        </div>
      </main>
      
      {/* PDF Report Dialog */}
      {activeDialog === 'pdf' && (
        <PDFReportGenerator 
          data={files.find(f => f.id === files[0]?.id)?.parsedData} 
          onClose={closeDialog} 
        />
      )}
      
      {/* Monte Carlo Simulation Dialog */}
      {activeDialog === 'monteCarlo' && (
        <MonteCarloSimulation 
          trades={files.find(f => f.id === files[0]?.id)?.parsedData?.trades || []} 
          onClose={closeDialog}
        />
      )}
      
      {/* Strategy Optimizer Dialog */}
      {activeDialog === 'optimize' && (
        <StrategyOptimizer 
          data={files.find(f => f.id === files[0]?.id)?.parsedData} 
          onClose={closeDialog}
        />
      )}
      
      <Footer />
    </div>
  );
};
export default StrategyReportGenie;
