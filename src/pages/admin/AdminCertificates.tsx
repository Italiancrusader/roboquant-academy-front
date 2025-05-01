
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminCertificates = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Certificate Management</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            Certificate creation and management features are under development. Soon you'll be able to design custom certificates for course completions and other achievements.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Templates</CardTitle>
              <CardDescription>Design and manage certificate layouts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="h-40 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                Template preview area
              </div>
              <Button disabled>Create New Template</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Certificate Settings</CardTitle>
              <CardDescription>Configure certificate behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Automatic Issuance</label>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" disabled /> 
                    <span>Auto-generate when course is completed</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Certificate Expiration</label>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" disabled /> 
                    <span>Certificates expire after</span>
                    <input type="number" className="w-16 bg-muted rounded p-1" disabled />
                    <span>months</span>
                  </div>
                </div>
                <Button disabled>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCertificates;
