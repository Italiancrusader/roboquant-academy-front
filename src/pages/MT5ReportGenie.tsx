
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FileUploadZone from '@/components/mt5reportgenie/FileUploadZone';
import ReportDashboard from '@/components/mt5reportgenie/ReportDashboard';
import LoadingOverlay from '@/components/mt5reportgenie/LoadingOverlay';
import { toast } from '@/components/ui/use-toast';
import { FileType } from '@/types/mt5reportgenie';
import { Link } from 'react-router-dom';
import PDFReportGenerator from '@/components/mt5reportgenie/PDFReportGenerator';
import MonteCarloSimulation from '@/components/mt5reportgenie/MonteCarloSimulation';
import StrategyOptimizer from '@/components/mt5reportgenie/StrategyOptimizer';
import LeadCaptureDialog from '@/components/mt5reportgenie/LeadCaptureDialog';

const MT5ReportGenie = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string>('');
  const [activeDialog, setActiveDialog] = useState<'pdf' | 'monteCarlo' | 'optimize' | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [hasCompletedLeadForm, setHasCompletedLeadForm] = useState(false);
  
  // Check if the user has already filled the lead form
  useEffect(() => {
    const hasCompleted = localStorage.getItem('mt5_lead_completed') === 'true';
    setHasCompletedLeadForm(hasCompleted);
    
    // If they haven't completed the lead form, show the dialog after a short delay
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        setShowLeadDialog(true);
      }, 3000); // Show after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleFilesUploaded = (newFiles: FileType[]) => {
    // If the user hasn't completed the lead form, show it before processing files
    if (!hasCompletedLeadForm) {
      setShowLeadDialog(true);
      return;
    }
    
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
    
    // Check if the user has completed the lead form
    if (!hasCompletedLeadForm) {
      setShowLeadDialog(true);
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
    
    // Check if the user has completed the lead form
    if (!hasCompletedLeadForm) {
      setShowLeadDialog(true);
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
    
    // Check if the user has completed the lead form
    if (!hasCompletedLeadForm) {
      setShowLeadDialog(true);
      return;
    }
    
    setActiveDialog('optimize');
  };
  
  const closeDialog = () => {
    setActiveDialog(null);
  };
  
  const handleLeadDialogClose = () => {
    setShowLeadDialog(false);
    // Mark that the user has completed the lead form
    localStorage.setItem('mt5_lead_completed', 'true');
    setHasCompletedLeadForm(true);
  };

  return <div className="flex flex-col min-h-screen bg-background text-foreground font-neulis">
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
      
      {/* Lead Capture Dialog */}
      <LeadCaptureDialog 
        isOpen={showLeadDialog} 
        onClose={handleLeadDialogClose} 
      />
      
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
    </div>;
};
export default MT5ReportGenie;
