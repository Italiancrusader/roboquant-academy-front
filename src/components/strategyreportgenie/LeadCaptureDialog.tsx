
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface LeadCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadCaptureDialog: React.FC<LeadCaptureDialogProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Missing information",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreeToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to our terms of service and privacy policy.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would normally send this data to your backend API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success!",
        description: "You now have access to the Strategy Report Genie.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Strategy Report Genie</DialogTitle>
          <DialogDescription>
            Enter your details to access the full strategy analysis features.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              placeholder="Your Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="your@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreeToTerms} 
              onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="terms" className="text-xs text-muted-foreground">
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Unlock Access'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;
