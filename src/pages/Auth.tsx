
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import { AuthError } from '@/components/auth/AuthError';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const from = location.state?.from?.pathname || '/dashboard';
  const redirectPath = searchParams.get('redirect') || from;
  
  // If queryParam has 'signup=true', default to signup tab
  const defaultTab = location.search.includes('signup=true') ? 'signup' : 'signin';
  
  // Handle error message from URL parameters (e.g., after OAuth redirect)
  const errorMessage = searchParams.get('error_description') || searchParams.get('error');
  
  useEffect(() => {
    // If user is already logged in, redirect to the intended destination
    if (user && !isLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, navigate, redirectPath]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">Welcome to RoboQuant</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account or create a new one</p>
        </div>
        
        {errorMessage && <AuthError message={errorMessage} />}
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm redirectPath={redirectPath} />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm redirectPath={redirectPath} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
