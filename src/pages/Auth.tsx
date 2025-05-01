
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

// Import our components
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import AuthError from '@/components/auth/AuthError';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRedirectError, setIsRedirectError] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse and handle URL parameters for auth errors
  useEffect(() => {
    const handleUrlErrors = () => {
      // Check URL query parameters for errors
      const url = new URL(window.location.href);
      const errorDescription = url.searchParams.get('error_description');
      const error = url.searchParams.get('error');
      const errorCode = url.searchParams.get('error_code');
      
      // Also check for hash fragment errors (used in OAuth redirects)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get('error');
      const hashErrorDescription = hashParams.get('error_description');
      
      // Check for OAuth tokens in hash (indicates partial OAuth success but redirect issues)
      const accessToken = hashParams.get('access_token');
      const providerToken = hashParams.get('provider_token');
      const providerRefreshToken = hashParams.get('provider_refresh_token');
      
      // Check if the current URL contains supabase.co/www which indicates a common misconfiguration
      const currentUrl = window.location.href;
      const hasSubapaseUrlError = currentUrl.includes('supabase.co/www');
      
      // Special check for Google OAuth redirect issues
      const hasGoogleOAuthData = accessToken && (providerToken || providerRefreshToken);
      const hasGoogleOAuthError = hasGoogleOAuthData && (hasSubapaseUrlError || window.location.pathname !== '/auth');
      
      if (errorDescription || error || errorCode || hashError || hashErrorDescription || hasSubapaseUrlError || hasGoogleOAuthError) {
        let errorMessage = errorDescription || error || hashErrorDescription || hashError || 'Authentication error occurred';
        let isInvalidPath = false;
        
        if (hasGoogleOAuthError) {
          console.error("Google OAuth redirect error detected. URL:", currentUrl);
          errorMessage = 'Google authentication redirect failed. Your Supabase URL Configuration needs to be updated.';
          isInvalidPath = true;
        } else if (errorCode === '401') {
          errorMessage = 'Authentication failed. Please check your credentials and try again.';
        } else if (errorCode === '400' && errorDescription?.includes('validation_failed')) {
          errorMessage = 'Google authentication is not properly configured. Please contact support.';
        } else if (errorMessage.includes('refused to connect')) {
          errorMessage = 'Connection to authentication server was refused. Please check your network settings or try again later.';
        } else if (
          errorMessage.includes('requested path is invalid') || 
          error === 'invalid_redirect' || 
          hasSubapaseUrlError
        ) {
          errorMessage = 'Authentication redirect URL is not properly configured in Supabase. Please add your domain to the allowed redirect URLs.';
          isInvalidPath = true;
        }
        
        setAuthError(errorMessage);
        setIsRedirectError(isInvalidPath);
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Clean up the URL only if we're not dealing with OAuth tokens
        // This preserves tokens for potential manual handling if needed
        if (!hasGoogleOAuthData) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    handleUrlErrors();
  }, [location]);
  
  // If user is already logged in, redirect to home or the page they were trying to access
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">RoboQuant Academy</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        
        <div className="px-6">
          {authError && (
            <AuthError error={authError} isRedirectError={isRedirectError} />
          )}
          
          {isLoading && (
            <Alert className="mb-4">
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>
                Please wait... Processing authentication request.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          {/* Sign In Tab */}
          <TabsContent value="signin">
            <SignInForm 
              isLoading={isLoading}
              setAuthError={setAuthError}
              setIsLoading={setIsLoading}
            />
          </TabsContent>
          
          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <SignUpForm 
              isLoading={isLoading}
              setAuthError={setAuthError}
              setIsLoading={setIsLoading}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
