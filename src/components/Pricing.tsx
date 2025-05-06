
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/utils/googleAnalytics';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleApply = async () => {
    setIsLoading(true);
    
    try {
      // Track event
      trackEvent('pricing_apply_clicked', {
        event_category: 'Pricing',
        event_label: 'Apply Button'
      });
      
      // Navigate to quiz
      navigate('/quiz');
    } catch (error) {
      console.error("Error navigating to quiz:", error);
      toast({
        title: "Error",
        description: "There was an error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center px-4 sm:px-6">
      <Card className="w-full max-w-md border-primary">
        <CardHeader>
          <div className="bg-primary text-primary-foreground px-3 py-1 text-xs rounded-full w-fit">Premium</div>
          <CardTitle className="mt-2">RoboQuant Academy</CardTitle>
          <CardDescription>Full access to all trading strategies and bots</CardDescription>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold">$1,500</span>
            <span className="ml-2 text-sm text-muted-foreground line-through">$1,875</span>
            <span className="ml-2 text-xs bg-primary/20 text-primary py-0.5 px-2 rounded-full">20% off</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Full access to all trading algorithms</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Step-by-step bot creation tutorials</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>All future updates included</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Lifetime access</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full cta-button py-6" 
            onClick={handleApply}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Pricing;
