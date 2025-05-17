
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { handleHashTokens, ensureCodeVerifierForPKCE } from '@/contexts/auth/auth-utils';

const NotFound = () => {
  // Get the current domain and path
  const currentDomain = window.location.hostname;
  const currentPath = window.location.pathname;
  const navigate = useNavigate();
  
  // Check if this looks like an OAuth callback
  const isOAuthCallback = currentPath.includes('/auth/v1/callback') || 
                          (currentPath.includes('/auth') && window.location.search.includes('error')) ||
                          (window.location.search.includes('code=') && window.location.search.includes('state='));

  useEffect(() => {
    // Attempt to recover the session if this is an OAuth callback
    const attemptSessionRecovery = async () => {
      if (isOAuthCallback) {
        console.log("Detected OAuth callback on 404 page - attempting session recovery and redirect");
        
        try {
          // Extract the code and state from the URL if present
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          const state = params.get('state');
          
          if (code && state) {
            console.log("OAuth parameters detected, redirecting to /auth with parameters");
            
            // Ensure the code verifier is available before redirecting
            ensureCodeVerifierForPKCE(code, state);
            
            // Special handling for callback URLs - redirect to /auth with the same params
            const authUrl = `/auth${window.location.search}`;
            navigate(authUrl, { replace: true });
            return;
          }
          
          // If no code/state or other issue, try to handle hash tokens
          const session = await handleHashTokens();
          if (session) {
            console.log("Successfully recovered session from hash tokens");
            navigate('/dashboard', { replace: true });
          } else {
            console.log("Could not recover session, redirecting to /auth");
            navigate('/auth', { replace: true });
          }
        } catch (error) {
          console.error("Error recovering from OAuth callback:", error);
          toast({
            title: "Authentication Error",
            description: "Failed to process authentication. Please try signing in again.",
            variant: "destructive",
          });
          navigate('/auth', { replace: true });
        }
      }
    };
    
    attemptSessionRecovery();
  }, [isOAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-neulis">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl font-semibold text-white mt-4 mb-6">Oops! Page not found</h2>
          <p className="text-gray-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>

          {isOAuthCallback && (
            <Alert variant="destructive" className="mb-8 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Redirect Issue</AlertTitle>
              <AlertDescription>
                <p className="mb-2">This appears to be an OAuth callback after Google sign-in.</p>
                <p className="mb-2">Redirecting you to the authentication page...</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="space-y-4">
          <Button 
            asChild 
            className="cta-button text-white py-5 px-8 w-full"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" /> Return to Home
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline"
            className="w-full"
          >
            <Link to="/auth">
              Sign In / Sign Up
            </Link>
          </Button>
        </div>
        
        <div className="mt-16">
          <img 
            src="/lovable-uploads/56e1912c-6199-4933-a4e9-409fbe7e9311.png"
            alt="RoboQuant Academy"
            className="h-12 mx-auto opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
