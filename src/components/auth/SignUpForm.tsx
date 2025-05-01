
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import GoogleButton from './GoogleButton';

interface SignUpFormProps {
  isLoading: boolean;
  setAuthError: (error: string | null) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ isLoading, setAuthError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { signUp, signInWithGoogle } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await signUp(email, password, firstName, lastName);
      // Don't navigate immediately after signup as the user may need to verify email
    } catch (error: any) {
      console.error("Sign up error:", error);
      setAuthError(error.message || 'Failed to create account');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
      // The redirect will happen automatically - we'll be taken to Google auth
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setAuthError(error.message || 'Google sign in failed');
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">First Name</Label>
            <Input 
              id="firstname"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Last Name</Label>
            <Input 
              id="lastname"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input 
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input 
            id="signup-password"
            type="password"
            placeholder="Create a password"
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
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
        
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <GoogleButton 
          onClick={handleGoogleSignIn} 
          isLoading={isLoading} 
          buttonText="Sign up with Google"
        />
      </CardFooter>
    </form>
  );
};

export default SignUpForm;
