
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

// This component is deprecated - mt5reportgenie was removed
const ReportDashboard: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          <p>This feature has been removed.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportDashboard;
