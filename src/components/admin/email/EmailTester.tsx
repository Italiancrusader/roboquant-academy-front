
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  FileText, 
  CalendarClock, 
  BookOpen,
  Tag,
  UserCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Create the form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  name: z.string().optional(),
});

const surveyEmailSchema = z.object({
  emailType: z.string(),
  recipientEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  recipientName: z.string().min(1, { message: 'Please enter a name.' }),
});

type FormValues = z.infer<typeof formSchema>;
type SurveyEmailFormValues = z.infer<typeof surveyEmailSchema>;

const EmailTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingResend, setIsTestingResend] = useState(false);
  const [isSendingSurveyEmail, setIsSendingSurveyEmail] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState('purchase');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: 'Test User',
    },
  });

  const surveyEmailForm = useForm<SurveyEmailFormValues>({
    resolver: zodResolver(surveyEmailSchema),
    defaultValues: {
      emailType: 'qualified',
      recipientEmail: '',
      recipientName: 'Test User',
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

  const handleSendSurveyEmail = async (data: SurveyEmailFormValues) => {
    setIsSendingSurveyEmail(true);
    setResults(null);
    
    try {
      // Add additional data based on email type
      let additionalData = {};
      
      if (data.emailType === 'educational') {
        additionalData = {
          lessonNumber: 1,
          lessonTitle: 'Getting Started with Algorithmic Trading',
          lessonContent: 'This is sample lesson content for a test email.'
        };
      } else if (data.emailType === 'special-offer') {
        additionalData = {
          offerDetails: {
            discount: '25%',
            originalPrice: '$2,000',
            discountedPrice: '$1,500'
          },
          expiryDate: 'May 30, 2025'
        };
      }
      
      // Call the edge function using supabase.functions.invoke
      const { data: responseData, error } = await supabase.functions.invoke('test-email-templates', {
        body: {
          emailType: data.emailType,
          recipientEmail: data.recipientEmail,
          recipientName: data.recipientName,
          additionalData
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResults([{
        type: data.emailType,
        success: true,
        email_id: responseData.emailId
      }]);
      
      toast({
        title: 'Survey Email Sent',
        description: `Successfully sent test ${data.emailType} email to ${data.recipientEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending survey test email:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to send test email: ${error.message}`,
      });
      
      setResults([{
        type: data.emailType,
        success: false,
        error: error.message
      }]);
    } finally {
      setIsSendingSurveyEmail(false);
    }
  };

  const getEmailTypeIcon = (type: string) => {
    switch(type) {
      case 'qualified':
        return <UserCheck className="h-5 w-5" />;
      case 'non-qualified':
        return <FileText className="h-5 w-5" />;
      case 'reminder':
        return <CalendarClock className="h-5 w-5" />;
      case 'educational':
        return <BookOpen className="h-5 w-5" />;
      case 'special-offer':
        return <Tag className="h-5 w-5" />;
      case 're-engagement':
        return <Mail className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
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

      <Tabs defaultValue="purchase" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchase">Purchase Emails</TabsTrigger>
          <TabsTrigger value="survey">Survey Emails</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="purchase">
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
          </TabsContent>

          <TabsContent value="survey">
            <Card>
              <CardHeader>
                <CardTitle>Survey Email Templates</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Form {...surveyEmailForm}>
                  <form onSubmit={surveyEmailForm.handleSubmit(handleSendSurveyEmail)} className="space-y-6">
                    <FormField
                      control={surveyEmailForm.control}
                      name="emailType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select email type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="qualified">Qualified Lead</SelectItem>
                              <SelectItem value="non-qualified">Non-qualified Lead</SelectItem>
                              <SelectItem value="reminder">Booking Reminder</SelectItem>
                              <SelectItem value="educational">Educational Content</SelectItem>
                              <SelectItem value="special-offer">Special Offer</SelectItem>
                              <SelectItem value="re-engagement">Re-engagement</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={surveyEmailForm.control}
                      name="recipientEmail"
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
                      control={surveyEmailForm.control}
                      name="recipientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSendingSurveyEmail}>
                      {isSendingSurveyEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Test Survey Email'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

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
                    <div className="flex items-center">
                      {activeTab === 'survey' && getEmailTypeIcon(result.type)}
                      <span className="ml-2 capitalize">{result.type}</span>
                    </div>
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
