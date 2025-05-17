
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import GoogleButton from './GoogleButton';
import { Separator } from '@/components/ui/separator';

export interface SignInFormProps {
  isLoading: boolean;
  setAuthError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ isLoading, setAuthError, setIsLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    try {
      await signIn(email, password);
      // Navigation will happen automatically via useEffect in parent
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // OAuth flow will redirect, no need to handle navigation here
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setAuthError(error.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

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
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          type="submit" 
          className="w-full cta-button" 
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
        
        <div className="flex items-center w-full my-2">
          <Separator className="flex-grow" />
          <span className="px-2 text-xs text-muted-foreground">OR</span>
          <Separator className="flex-grow" />
        </div>
        
        <GoogleButton 
          onClick={handleGoogleSignIn} 
          isLoading={isLoading} 
        />
      </CardFooter>
    </form>
  );
};

export default SignInForm;
