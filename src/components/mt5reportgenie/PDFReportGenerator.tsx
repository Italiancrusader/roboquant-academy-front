
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileDown, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ParsedMT5Report } from '@/types/mt5reportgenie';
import { toast } from '@/components/ui/use-toast';

interface PDFReportGeneratorProps {
  data: ParsedMT5Report | undefined;
  onClose: () => void;
}

const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({ data, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    overview: true,
    performance: true,
    risk: true,
    instruments: true,
    distribution: false,
    correlation: false
  });
  const [reportType, setReportType] = useState<'standard' | 'comprehensive' | 'executive'>('standard');

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const generatePDF = () => {
    setIsGenerating(true);
    
    // Simulate PDF generation (in a real app, this would create an actual PDF)
    setTimeout(() => {
      setIsGenerating(false);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your report has been downloaded to your device."
      });
      
      // In a real implementation, this would trigger the PDF download
      // For now we'll just close the dialog
      onClose();
    }, 2000);
  };

  if (!data) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => !isGenerating && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <FileDown className="mr-2 h-5 w-5" />
            Generate PDF Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Report Type</h3>
            <Tabs value={reportType} onValueChange={(value) => setReportType(value as any)} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
                <TabsTrigger value="executive">Executive Summary</TabsTrigger>
              </TabsList>
              <TabsContent value="standard" className="mt-2 text-xs text-muted-foreground">
                Standard report with key metrics and visualizations.
              </TabsContent>
              <TabsContent value="comprehensive" className="mt-2 text-xs text-muted-foreground">
                Full analysis with detailed metrics and all available charts.
              </TabsContent>
              <TabsContent value="executive" className="mt-2 text-xs text-muted-foreground">
                Concise one-page summary for quick review.
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Include Sections</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="section-overview" 
                  checked={selectedSections.overview} 
                  onCheckedChange={() => handleSectionToggle('overview')} 
                />
                <Label htmlFor="section-overview">Overview & Equity Chart</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="section-performance" 
                  checked={selectedSections.performance} 
                  onCheckedChange={() => handleSectionToggle('performance')} 
                />
                <Label htmlFor="section-performance">Performance Metrics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="section-risk" 
                  checked={selectedSections.risk} 
                  onCheckedChange={() => handleSectionToggle('risk')} 
                />
                <Label htmlFor="section-risk">Risk Analysis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="section-instruments" 
                  checked={selectedSections.instruments} 
                  onCheckedChange={() => handleSectionToggle('instruments')} 
                />
                <Label htmlFor="section-instruments">Instruments Breakdown</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="section-distribution" 
                  checked={selectedSections.distribution} 
                  onCheckedChange={() => handleSectionToggle('distribution')} 
                />
                <Label htmlFor="section-distribution">Trade Distribution</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="section-correlation" 
                  checked={selectedSections.correlation} 
                  onCheckedChange={() => handleSectionToggle('correlation')} 
                />
                <Label htmlFor="section-correlation">Correlation Analysis</Label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Report Preview</h3>
            <div className="border rounded-lg p-4 h-[180px] flex items-center justify-center bg-muted/30">
              <div className="text-center text-muted-foreground text-sm">
                <FileDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                {reportType === 'standard' && 'Standard report with selected sections'}
                {reportType === 'comprehensive' && 'Comprehensive report with all details'}
                {reportType === 'executive' && 'Executive summary of key metrics'}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFReportGenerator;
