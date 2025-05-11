import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  priceId: string;
  courseId: string;
  amount: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentForm({ 
  priceId,
  courseId,
  amount,
  onSuccess,
  onError
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    if (error) {
      elements.getElement('card')?.focus();
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    setProcessing(true);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'An error occurred with your card');
        setProcessing(false);
        onError?.(paymentMethodError.message || 'Payment failed');
        return;
      }

      // Create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId,
          courseId,
          amount,
        }),
      });

      const paymentIntentResult = await response.json();

      if (paymentIntentResult.error) {
        setError(paymentIntentResult.error);
        setProcessing(false);
        onError?.(paymentIntentResult.error);
        return;
      }

      // Confirm the payment intent
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentResult.clientSecret
      );

      if (confirmError) {
        setError(confirmError.message || 'Payment confirmation failed');
        setProcessing(false);
        onError?.(confirmError.message || 'Payment confirmation failed');
        return;
      }

      // Payment successful
      setProcessing(false);
      onSuccess?.(paymentIntent.id);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setProcessing(false);
      onError?.(err.message || 'Payment failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-200">
          Card details
        </label>
        <div className="p-4 border border-gray-700 rounded-md bg-black/20">
          <CardElement
            id="card-element"
            onChange={e => {
              setError(e.error ? e.error.message : null);
              setCardComplete(e.complete);
            }}
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#FFFFFF',
                  '::placeholder': {
                    color: '#AAAAAA',
                  },
                },
                invalid: {
                  color: '#EF4444',
                  iconColor: '#EF4444',
                },
              },
            }}
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || processing || !cardComplete} 
        className="w-full py-6"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  );
} 