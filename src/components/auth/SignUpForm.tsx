
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface SignUpFormProps {
  isLoading: boolean;
  setAuthError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ isLoading, setAuthError, setIsLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    setSignupSuccess(false);
    
    try {
      await signUp(email, password, firstName, lastName);
      setSignupSuccess(true);
      console.log("Signup successful, showing confirmation message");
    } catch (error: any) {
      console.error("Sign up error:", error);
      setAuthError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="text-center space-y-4 p-6">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold">Account Created Successfully!</h3>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please check your email for a verification link to complete your account setup.
            If you don't see it, check your spam folder.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => setSignupSuccess(false)} 
          variant="outline"
          className="w-full"
        >
          Back to Sign Up
        </Button>
      </div>
    );
  }

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
            placeholder="Create a password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
      </CardFooter>
    </form>
  );
};

export default SignUpForm;
