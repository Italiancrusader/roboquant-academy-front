
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LeadForm from "@/components/LeadForm";
import { submitLead } from "@/services/leadService";

interface LeadCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadCaptureDialog: React.FC<LeadCaptureDialogProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (values: { name: string; email: string; phone: string }) => {
    setIsSubmitting(true);
    
    try {
      const result = await submitLead({
        name: values.name,
        email: values.email,
        phone: values.phone,
        source: "mt5_report_genie",
        leadMagnet: "mt5_report_analysis",
        metadata: {
          tool: "MT5 Report Genie",
          entry_point: "landing_page"
        }
      });

      if (result.success) {
        // Close the dialog on successful submission
        onClose();
      }
    } catch (error) {
      console.error("Error submitting lead form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Get Full Access to MT5 Report Genie</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Enter your details below to unlock advanced trading analytics and insights with our MT5 Report Analysis Tool.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-muted-foreground mb-6">
            Gain access to professional-grade performance analysis, Monte Carlo simulations, and strategy optimization to enhance your trading decisions.
          </p>
          
          <LeadForm
            onSubmit={handleSubmit}
            buttonText="Get Access Now"
            source="mt5_report_genie"
            leadMagnet="mt5_report_analysis"
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;
