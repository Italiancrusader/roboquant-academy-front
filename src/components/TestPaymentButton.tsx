
import React from 'react';
import { Button } from '@/components/ui/button';
import { handleStripeCheckout } from '@/services/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const TestPaymentButton: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleTestPayment = async () => {
    if (!user) {
      navigate('/auth', { state: { from: '/' } });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await handleStripeCheckout({
        courseId: 'test-payment', // Changed from 'premium-test' to 'test-payment'
        courseTitle: 'RoboQuant Test Payment',
        price: 1, // $1.00 test payment
        userId: user.id,
        isTestMode: true
      });
      
      toast({
        title: "Test payment initiated",
        description: "You will be redirected to Stripe's checkout page for a $1.00 test payment.",
      });
    } catch (error) {
      console.error('Test payment error:', error);
      toast({
        title: "Test payment error",
        description: "Failed to initiate test payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      onClick={handleTestPayment} 
      disabled={isLoading}
      className="text-blue-primary border-blue-primary hover:bg-blue-primary/10"
    >
      {isLoading ? "Processing..." : "Test Payment ($1.00)"}
    </Button>
  );
};

export default TestPaymentButton;
