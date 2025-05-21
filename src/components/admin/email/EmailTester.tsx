
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Create the form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type FormValues = z.infer<typeof formSchema>;

const EmailTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingResend, setIsTestingResend] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResults(null);
    
    try {
      // Call the edge function using supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke('send-test-emails', {
        body: {
          email: values.email,
          type: 'purchase',
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResults(data.results);
      toast({
        title: 'Test Email Sent',
        description: `Successfully sent purchase confirmation test email to ${values.email}`,
      });
    } catch (error: any) {
      console.error('Error sending test emails:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to send test email: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestResend = async () => {
    setIsTestingResend(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-resend');
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: 'Resend Test Successful',
        description: 'Simple test email sent successfully via Resend API.',
      });
      
      console.log('Resend test result:', data);
    } catch (error: any) {
      console.error('Error testing Resend:', error);
      toast({
        variant: 'destructive',
        title: 'Resend Test Failed',
        description: `Error: ${error.message}`,
      });
    } finally {
      setIsTestingResend(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Quick Resend API Test</h3>
            <p className="text-sm text-muted-foreground">
              Send a simple test email via Resend API to verify your configuration.
            </p>
            <Button 
              onClick={handleTestResend}
              disabled={isTestingResend}
              variant="outline"
              className="w-fit"
            >
              {isTestingResend ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Simple Resend Test'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="recipient@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Test Purchase Confirmation'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Results</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-4 border rounded-md flex items-center justify-between ${
                    result.success ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="capitalize">{result.type}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.success ? (
                      <span>Email ID: {result.email_id}</span>
                    ) : (
                      <span>Error: {result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="text-sm text-muted-foreground mt-8">
        <p>
          <strong>Note:</strong> All test emails are marked with "[TEST]" in the subject line.
          If you don't see the emails, please check your spam folder.
        </p>
      </div>
    </div>
  );
};

export default EmailTester;
