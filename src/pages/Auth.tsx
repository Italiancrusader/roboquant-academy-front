
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import AuthError from '@/components/auth/AuthError';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Auth = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const from = location.state?.from?.pathname || '/dashboard';
  const redirectPath = searchParams.get('redirect') || from;
  
  // If queryParam has 'signup=true', default to signup tab
  const defaultTab = location.search.includes('signup=true') ? 'signup' : 'signin';
  
  // Handle error message from URL parameters (e.g., after OAuth redirect)
  const errorMessage = searchParams.get('error_description') || searchParams.get('error');
  
  useEffect(() => {
    console.log("Auth page mounted");
    console.log("Current URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("Location state:", location.state);
    
    // Set URL error if present
    if (errorMessage) {
      console.error("Auth error from URL:", errorMessage);
      setAuthError(errorMessage);
    }
  }, [errorMessage, searchParams]);
  
  useEffect(() => {
    // If user is already logged in, redirect to the intended destination
    if (user && !isLoading) {
      console.log("User is logged in, redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, navigate, redirectPath]);

  const toggleDebugInfo = () => {
    setShowDebugInfo(prev => !prev);
  };

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
          
          <button 
            onClick={toggleDebugInfo} 
            className="text-xs mt-2 text-gray-500 hover:text-gray-400"
          >
            {showDebugInfo ? "Hide" : "Show"} debug info
          </button>
          
          {showDebugInfo && (
            <Alert className="mt-4 text-left text-xs bg-black/50 border border-gray-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <div className="font-mono overflow-x-auto whitespace-pre-wrap">
                  <p><strong>Current URL:</strong> {window.location.href}</p>
                  <p><strong>Domain:</strong> {window.location.hostname}</p>
                  <p><strong>Origin:</strong> {window.location.origin}</p>
                  <p><strong>Path:</strong> {window.location.pathname}</p>
                  <p><strong>Search:</strong> {window.location.search}</p>
                  <p><strong>Hash:</strong> {window.location.hash}</p>
                  <p><strong>From:</strong> {from}</p>
                  <p><strong>Redirect path:</strong> {redirectPath}</p>
                  <p><strong>Error:</strong> {errorMessage || "None"}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {authError && <AuthError error={authError} isRedirectError={!!errorMessage} />}
        
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
                setIsLoading={setIsAuthLoading} 
              />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm 
                isLoading={isAuthLoading} 
                setAuthError={setAuthError} 
                setIsLoading={setIsAuthLoading} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
