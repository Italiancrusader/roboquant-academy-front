
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the email types
const emailTypes = [
  { id: 'purchase', label: 'Purchase Confirmation' },
  { id: 'completion', label: 'Course Completion' },
  { id: 'cart', label: 'Abandoned Cart' },
  { id: 'reengagement', label: 'Re-Engagement' },
  { id: 'all', label: 'All Email Types' },
];

// Create the form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  type: z.enum(['purchase', 'completion', 'cart', 'reengagement', 'all']),
});

type FormValues = z.infer<typeof formSchema>;

const EmailTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      type: 'all',
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
          type: values.type,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResults(data.results);
      toast({
        title: 'Test Emails Sent',
        description: `Successfully sent ${values.type === 'all' ? 'all test emails' : `${values.type} test email`} to ${values.email}`,
      });
    } catch (error: any) {
      console.error('Error sending test emails:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to send test emails: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Email Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {emailTypes.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={type.id} id={type.id} />
                            <FormLabel htmlFor={type.id} className="font-normal cursor-pointer">
                              {type.label}
                            </FormLabel>
                          </div>
                        ))}
                      </RadioGroup>
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
                  'Send Test Email(s)'
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
