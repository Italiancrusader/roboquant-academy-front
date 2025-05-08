
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import AuthError from '@/components/auth/AuthError';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Home } from 'lucide-react';
import { handleHashTokens, processUrlErrors } from '@/contexts/auth/auth-utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Auth = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const from = location.state?.from?.pathname || '/dashboard';
  const redirectPath = searchParams.get('redirect') || from;
  
  // If queryParam has 'signup=true', default to signup tab
  const defaultTab = location.search.includes('signup=true') ? 'signup' : 'signin';
  
  // Handle error message from URL parameters (e.g., after OAuth redirect)
  const errorMessage = searchParams.get('error_description') || searchParams.get('error');
  
  // Handle potential OAuth callback
  useEffect(() => {
    console.log("Auth page mounted");
    console.log("Current URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("Location state:", location.state);
    console.log("Location pathname:", location.pathname);
    console.log("URL hash present:", !!window.location.hash);
    
    // Process URL for error messages first
    processUrlErrors();
    
    // Set URL error if present
    if (errorMessage) {
      console.error("Auth error from URL:", errorMessage);
      setAuthError(errorMessage);
    }
    
    // Handle OAuth callback if this looks like one
    const isCallback = 
      window.location.pathname === '/auth' && 
      (window.location.hash.includes('access_token') || 
       window.location.search.includes('code='));
    
    if (isCallback) {
      console.log("Detected potential OAuth callback - processing tokens");
      setIsProcessingCallback(true);
      setCallbackStatus('processing');
      
      const processCallback = async () => {
        try {
          const session = await handleHashTokens();
          if (session) {
            console.log("Successfully processed callback and restored session");
            setCallbackStatus('success');
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1000);
          } else {
            console.log("Failed to process callback or no session available");
            setCallbackStatus('error');
          }
        } catch (error) {
          console.error("Error processing callback:", error);
          setCallbackStatus('error');
        } finally {
          setIsProcessingCallback(false);
        }
      };
      
      processCallback();
    }
  }, [errorMessage, searchParams, navigate, location.pathname, location.state]);
  
  // Handle redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading && !isProcessingCallback) {
      console.log("User is logged in, redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, isProcessingCallback, navigate, redirectPath]);

  const toggleDebugInfo = () => {
    setShowDebugInfo(prev => !prev);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show special callback processing UI
  if (isProcessingCallback) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 px-4 text-center">
          <h1 className="text-3xl font-bold gradient-text">Authentication in progress</h1>
          
          {callbackStatus === 'processing' && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Processing your Google sign-in...</p>
            </div>
          )}
          
          {callbackStatus === 'success' && (
            <Alert className="bg-green-950/30 border-green-600 mt-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-400">Authentication successful</AlertTitle>
              <AlertDescription>
                You have successfully signed in. Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}
          
          {callbackStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication failed</AlertTitle>
              <AlertDescription>
                <div className="space-y-4">
                  <p>There was a problem processing your sign in.</p>
                  
                  <div className="flex flex-col space-y-4">
                    <Button 
                      onClick={() => navigate('/auth')}
                      variant="outline"
                      className="w-full"
                    >
                      Return to login page
                    </Button>
                    
                    <Button 
                      asChild 
                      className="w-full"
                    >
                      <Link to="/">
                        <Home className="mr-2 h-4 w-4" /> Go to home page
                      </Link>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
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

export default Auth;
