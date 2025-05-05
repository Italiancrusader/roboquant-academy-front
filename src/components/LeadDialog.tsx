
import React from "react";
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
  const handleSubmit = async (values: LeadFormValues) => {
    try {
      const leadData: LeadData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        source: source,
        leadMagnet: leadMagnet
      };
      
      const success = await submitLead(leadData);

      if (!success) throw new Error("Failed to submit lead");

      toast({
        title: "Success!",
        description: leadMagnet 
          ? "Your free MT5 bot source code is on its way to your email!" 
          : "Thank you for your interest! We'll be in touch soon.",
      });

      // Close the dialog
      onOpenChange(false);
      
      // Call the optional callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting lead form:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        />
      </DialogContent>
    </Dialog>
  );
};

export default LeadDialog;
