import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackEvent } from "@/utils/googleAnalytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const phonePrefixes = [
  { value: "+1", label: "US (+1)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+61", label: "AU (+61)" },
  { value: "+64", label: "NZ (+64)" },
  { value: "+91", label: "IN (+91)" },
  { value: "+86", label: "CN (+86)" },
  { value: "+49", label: "DE (+49)" },
  { value: "+33", label: "FR (+33)" },
  { value: "+39", label: "IT (+39)" },
  { value: "+34", label: "ES (+34)" },
  { value: "+81", label: "JP (+81)" },
  { value: "+82", label: "KR (+82)" },
  { value: "+65", label: "SG (+65)" },
  { value: "+971", label: "AE (+971)" },
];

// Create two different schemas based on whether we need split name fields
const createLeadFormSchema = (splitName: boolean) => {
  const baseSchema = {
    email: z.string().email("Please enter a valid email"),
    phonePrefix: z.string().min(1, "Country code is required"),
    phoneNumber: z.string().min(1, "Phone number is required")
  };

  if (splitName) {
    return z.object({
      ...baseSchema,
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
    });
  } else {
    return z.object({
      ...baseSchema,
      name: z.string().min(1, "Name is required"),
    });
  }
};

interface LeadFormProps {
  onSubmit: (values: { name?: string, firstName?: string, lastName?: string, email: string, phone: string }) => Promise<void>;
  buttonText?: string;
  source: string;
  leadMagnet?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  splitName?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ 
  onSubmit, 
  buttonText = "Submit", 
  source,
  leadMagnet,
  onCancel,
  isSubmitting = false,
  splitName = false
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = isSubmitting || localLoading;
  
  const leadFormSchema = createLeadFormSchema(splitName);
  
  const form = useForm({
    resolver: zodResolver(leadFormSchema),
    defaultValues: splitName ? {
      firstName: "",
      lastName: "",
      email: "",
      phonePrefix: "+1",
      phoneNumber: ""
    } : {
      name: "",
      email: "",
      phonePrefix: "+1",
      phoneNumber: ""
    }
  });
  
  const handleSubmit = async (values: any) => {
    if (isLoading) return; // Prevent double submissions
    
    console.log('LeadForm submission started', values);
    setLocalLoading(true);
    
    try {
      // Combine prefix and phone number
      const fullPhoneNumber = `${values.phonePrefix}${values.phoneNumber}`;
      
      // Track lead capture event with Google Analytics and GTM
      trackEvent("lead_capture", {
        event_category: "Conversion",
        event_label: source,
        source: source,
        lead_type: leadMagnet || "enrollment"
      });
      
      // Set a timeout to ensure the loading state doesn't get stuck
      const submitPromise = onSubmit({
        ...(splitName ? { 
          firstName: values.firstName, 
          lastName: values.lastName 
        } : { 
          name: values.name 
        }),
        email: values.email,
        phone: fullPhoneNumber
      });
      
      const timeoutPromise = new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error("Form submission timed out")), 10000);
      });
      
      await Promise.race([submitPromise, timeoutPromise]).catch(error => {
        console.error("Form submission error or timeout:", error);
        // We don't throw here, just log the error
      });
      
      console.log('LeadForm submission completed successfully');
    } catch (error) {
      console.error("Error submitting lead form:", error);
    } finally {
      // Ensure loading state is reset after a delay
      setTimeout(() => {
        setLocalLoading(false);
        console.log('LeadForm loading state reset');
      }, 500);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {splitName ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-12 gap-2">
          <FormField
            control={form.control}
            name="phonePrefix"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Code</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {phonePrefixes.map((prefix) => (
                      <SelectItem key={prefix.value} value={prefix.value}>
                        {prefix.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="col-span-8">
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="123456789" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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
              disabled={isLoading}
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
