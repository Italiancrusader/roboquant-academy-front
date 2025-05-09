
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CircleDollarSign } from 'lucide-react';

interface InitialBalanceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (initialBalance: number) => void;
  fileName: string;
}

const InitialBalanceDialog: React.FC<InitialBalanceDialogProps> = ({ 
  open, 
  onClose, 
  onConfirm,
  fileName
}) => {
  const [balanceValue, setBalanceValue] = useState<string>("10000.00");
  const [error, setError] = useState<string | null>(null);
  
  const handleConfirm = () => {
    const parsedValue = parseFloat(balanceValue.replace(/,/g, ''));
    
    if (isNaN(parsedValue)) {
      setError("Please enter a valid number");
      return;
    }
    
    if (parsedValue < 0) {
      setError("Initial balance cannot be negative");
      return;
    }
    
    setError(null);
    onConfirm(parsedValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-primary" />
            Set Initial Balance
          </DialogTitle>
          <DialogDescription>
            Enter the initial balance for your TradingView report "{fileName}".
            This value will be used for calculating performance metrics.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right">
              Initial Balance:
            </Label>
            <div className="col-span-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="balance"
                  className="pl-7"
                  value={balanceValue}
                  onChange={(e) => {
                    setBalanceValue(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="10000.00"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InitialBalanceDialog;
