
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { handleHashTokens } from '@/contexts/auth/auth-utils';

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
        console.log("Detected OAuth callback on 404 page - attempting session recovery");
        
        try {
          // Extract the code and state from the URL if present
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          const state = params.get('state');
          const accessToken = params.get('access_token');
          
          if ((code && state) || accessToken) {
            console.log("OAuth parameters detected, attempting to exchange for session");
            
            // Try to recover the session from the URL
            const session = await handleHashTokens();
            
            if (session) {
              console.log("Successfully recovered session from OAuth callback");
              toast({
                title: "Authentication successful",
                description: "You have been successfully signed in.",
              });
              navigate('/dashboard', { replace: true });
              return;
            } 
            
            // If no session, try to manually handle the callback using the code exchange
            if (code && state) {
              try {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                
                if (error) {
                  throw error;
                }
                
                if (data.session) {
                  console.log("Successfully exchanged code for session");
                  toast({
                    title: "Authentication successful",
                    description: "You have been successfully signed in.",
                  });
                  navigate('/dashboard', { replace: true });
                  return;
                }
              } catch (err) {
                console.error("Failed to exchange code for session:", err);
              }
            }
          }
        } catch (error) {
          console.error("Error recovering from OAuth callback:", error);
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
                <p className="mb-2">Try these steps to resolve the issue:</p>
                <ol className="list-decimal pl-5 space-y-1 mb-4">
                  <li>Make sure your application is deployed to the domain configured in Supabase</li>
                  <li>Visit the homepage directly at <a href="/" className="underline">https://{currentDomain}/</a></li>
                  <li>Try signing in again after confirming the site is properly deployed</li>
                </ol>
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
