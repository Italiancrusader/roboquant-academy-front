
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackEvent } from "@/utils/googleAnalytics";

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone number is required")
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  onSubmit: (values: LeadFormValues) => Promise<void>;
  buttonText?: string;
  source: string;
  leadMagnet?: string;
  onCancel?: () => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ 
  onSubmit, 
  buttonText = "Submit", 
  source,
  leadMagnet,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });
  
  const handleSubmit = async (values: LeadFormValues) => {
    setIsLoading(true);
    
    try {
      // Track lead capture event with Google Analytics and GTM
      trackEvent("lead_capture", {
        event_category: "Conversion",
        event_label: source,
        source: source,
        lead_type: leadMagnet || "enrollment"
      });
      
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting lead form:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : buttonText}
          </Button>
          
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="flex-shrink-0"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default LeadForm;
