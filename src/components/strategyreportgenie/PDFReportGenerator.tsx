
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { ParsedStrategyReport } from '@/types/strategyreportgenie';

interface PDFReportGeneratorProps {
  data?: ParsedStrategyReport;
  onClose: () => void;
}

const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({ data, onClose }) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Report Generator</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            The PDF Report Generator will be available in the next update.
          </p>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button disabled className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFReportGenerator;
