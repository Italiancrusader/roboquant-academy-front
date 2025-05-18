
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PreferencesSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>Manage your email notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-8 text-muted-foreground">
          Email preference settings coming soon.
        </p>
      </CardContent>
    </Card>
  );
};

export default PreferencesSection;
