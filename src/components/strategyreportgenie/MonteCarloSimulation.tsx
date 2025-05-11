
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { StrategyTrade } from '@/types/strategyreportgenie';

interface MonteCarloSimulationProps {
  trades: StrategyTrade[];
  onClose: () => void;
}

const MonteCarloSimulation: React.FC<MonteCarloSimulationProps> = ({ trades, onClose }) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Monte Carlo Simulation</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            The Monte Carlo Simulation will be available in the next update.
          </p>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button disabled className="flex items-center">
              <Play className="h-4 w-4 mr-2" />
              Run Simulation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonteCarloSimulation;
