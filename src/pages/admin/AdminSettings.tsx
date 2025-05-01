
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Platform Settings</h1>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="users">User Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md bg-card" 
                    defaultValue="RoboQuant Academy"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Email</label>
                  <input 
                    type="email" 
                    className="w-full p-2 border rounded-md bg-card" 
                    defaultValue="support@roboquant.academy"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Zone</label>
                  <select className="w-full p-2 border rounded-md bg-card">
                    <option>UTC</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Allow new user registrations</span>
                  </div>
                </div>
                
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment Gateway</CardTitle>
                <CardDescription>Connect your Stripe account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4 mr-2" />
                  <AlertTitle>Not Connected</AlertTitle>
                  <AlertDescription>
                    Connect your Stripe account to enable payments and subscriptions.
                  </AlertDescription>
                </Alert>
                
                <Button>Connect Stripe</Button>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Email Provider</CardTitle>
                <CardDescription>Configure email delivery service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4 mr-2" />
                  <AlertTitle>Not Connected</AlertTitle>
                  <AlertDescription>
                    Connect an email service provider to send notifications and automated emails.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <select className="w-full p-2 border rounded-md bg-card">
                    <option>Select Provider</option>
                    <option>SendGrid</option>
                    <option>Mailgun</option>
                    <option>SES</option>
                  </select>
                  
                  <Button>Connect Email Provider</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize the look and feel of your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue="#0080FF" />
                    <span>#0080FF</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-card border rounded flex items-center justify-center">
                      Logo
                    </div>
                    <Button variant="outline">Upload Logo</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Favicon</label>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-card border rounded flex items-center justify-center text-xs">
                      Fav
                    </div>
                    <Button variant="outline">Upload Favicon</Button>
                  </div>
                </div>
                
                <Button>Save Appearance</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Account Settings</CardTitle>
                <CardDescription>Configure user account policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password Requirements</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Require minimum 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Require at least one number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Require at least one special character</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Timeout</label>
                  <select className="w-full p-2 border rounded-md bg-card">
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>8 hours</option>
                    <option>24 hours</option>
                    <option>7 days</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Verification</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Require email verification</span>
                  </div>
                </div>
                
                <Button>Save User Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
