
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import AuthError from '@/components/auth/AuthError';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import AuthDebugInfo from '@/components/auth/AuthDebugInfo';

interface AuthFormContainerProps {
  defaultTab: string;
  authError: string | null;
  isRedirectError: boolean;
  isAuthLoading: boolean;
  setAuthError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({
  defaultTab,
  authError,
  isRedirectError,
  isAuthLoading,
  setAuthError,
  setIsLoading
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">Welcome to RoboQuant</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account or create a new one</p>
          
          <AuthDebugInfo />
        </div>
        
        {authError && <AuthError error={authError} isRedirectError={isRedirectError} />}
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm 
                isLoading={isAuthLoading} 
                setAuthError={setAuthError} 
                setIsLoading={setIsLoading} 
              />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm 
                isLoading={isAuthLoading} 
                setAuthError={setAuthError} 
                setIsLoading={setIsLoading} 
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <Button 
            asChild 
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthFormContainer;
