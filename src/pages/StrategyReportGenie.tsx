
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const StrategyReportGeniePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Feature Removed</h1>
        <p className="text-muted-foreground">
          The Strategy Report Genie feature has been removed from this application.
        </p>
        <Button onClick={() => navigate('/')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};

export default StrategyReportGeniePage;
