
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?tab=reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold">Check Your Email</h3>
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            We've sent a password reset link to <strong>{email}</strong>. 
            Click the link in the email to reset your password.
            If you don't see it, check your spam folder.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={onBackToSignIn} 
          variant="outline" 
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          onClick={onBackToSignIn} 
          variant="ghost" 
          size="sm"
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Reset Password</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email Address</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Remember your password?{' '}
          <button 
            onClick={onBackToSignIn}
            className="text-primary hover:underline"
          >
            Sign in instead
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
