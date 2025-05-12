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
  return;
};
export default Pricing;