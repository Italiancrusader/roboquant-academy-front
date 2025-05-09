
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";
import { ParsedStrategyReport } from '@/types/strategyreportgenie';

interface StrategyOptimizerProps {
  data?: ParsedStrategyReport;
  onClose: () => void;
}

const StrategyOptimizer: React.FC<StrategyOptimizerProps> = ({ data, onClose }) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Strategy Optimizer</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            The Strategy Optimizer will be available in the next update.
          </p>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button disabled className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Optimize Strategy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrategyOptimizer;
