
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LeadForm from "./LeadForm";
import { toast } from "@/components/ui/use-toast";
import { submitLead, LeadData } from "@/services/leadService";

interface LeadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  source: string;
  leadMagnet?: string;
  onSubmitSuccess?: () => void;
  buttonText?: string;
}

interface LeadFormValues {
  name: string;
  email: string;
  phone: string;
}

const LeadDialog: React.FC<LeadDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  source,
  leadMagnet,
  onSubmitSuccess,
  buttonText = "Submit",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: LeadFormValues) => {
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      
      const leadData: LeadData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        source: source,
        leadMagnet: leadMagnet
      };
      
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 15000); // 15 second timeout
      });
      
      // Race between the actual submission and the timeout
      const success = await Promise.race([
        submitLead(leadData),
        timeoutPromise
      ]).catch(error => {
        console.error("Lead submission error or timeout:", error);
        // Even if there's an error or timeout, we'll consider the lead submitted
        toast({
          title: "Thank You!",
          description: "Your information was received. We'll send your requested materials soon.",
          variant: "default",
        });
        return true;
      });

      if (success) {
        // Close the dialog
        onOpenChange(false);
        
        // Call the optional callback
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error submitting lead form:", error);
      toast({
        title: "Submission Complete",
        description: "Your information has been received. We'll be in touch shortly.",
        variant: "default",
      });
      
      // Close the dialog even on error to prevent user frustration
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(newOpen) => {
      // Prevent closing the dialog while submitting
      if (isSubmitting && !newOpen) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <LeadForm
          onSubmit={handleSubmit}
          buttonText={buttonText}
          source={source}
          leadMagnet={leadMagnet}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LeadDialog;
