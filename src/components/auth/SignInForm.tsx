
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import ForgotPasswordForm from './ForgotPasswordForm';

export interface SignInFormProps {
  isLoading: boolean;
  setAuthError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ isLoading, setAuthError, setIsLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBackToSignIn={() => setShowForgotPassword(false)} />;
  }

  return (
    <form onSubmit={handleSignIn}>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input 
            id="signin-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <Input 
            id="signin-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          type="submit" 
          className="w-full cta-button" 
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </CardFooter>
    </form>
  );
};

export default SignInForm;
