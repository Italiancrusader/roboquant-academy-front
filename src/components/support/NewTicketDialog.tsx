
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters' }).max(100),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }).max(3000),
});

interface NewTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated: (ticket: any) => void;
}

const NewTicketDialog = ({ open, onOpenChange, onTicketCreated }: NewTicketDialogProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be signed in to create a ticket",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Create the ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          subject: values.subject,
          status: 'open',
        })
        .select()
        .single();
      
      if (ticketError) throw ticketError;
      
      // 2. Add the first message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          user_id: user.id,
          message: values.message,
          is_admin: false,
        });
      
      if (messageError) throw messageError;
      
      toast({
        title: "Ticket created",
        description: "Your support ticket has been created successfully",
      });
      
      form.reset();
      onOpenChange(false);
      onTicketCreated(ticketData);
      
    } catch (error: any) {
      toast({
        title: "Error creating ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Support Ticket</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Briefly describe your issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide details about your issue or question" 
                      className="min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTicketDialog;
