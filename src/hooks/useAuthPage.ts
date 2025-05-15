
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { handleHashTokens, processUrlErrors } from '@/contexts/auth/auth-utils';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const from = location.state?.from?.pathname || '/dashboard';
  const redirectPath = searchParams.get('redirect') || from;
  
  // If queryParam has 'signup=true', default to signup tab
  const defaultTab = location.search.includes('signup=true') ? 'signup' : 'signin';
  
  // Handle error message from URL parameters (e.g., after OAuth redirect)
  const errorMessage = searchParams.get('error_description') || searchParams.get('error');
  const isRedirectError = !!errorMessage;
  
  // Handle potential OAuth callback
  useEffect(() => {
    console.log("Auth page mounted, location pathname:", location.pathname);
    console.log("Current URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("Location state:", location.state);
    console.log("URL hash present:", !!window.location.hash);
    
    // Process URL for error messages first
    processUrlErrors();
    
    // Set URL error if present
    if (errorMessage) {
      console.error("Auth error from URL:", errorMessage);
      setAuthError(errorMessage);
    }
    
    // Check specifically for code and state params (PKCE flow)
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // Handle OAuth callback if this looks like one
    const isCallback = 
      (window.location.pathname === '/auth' && 
       ((window.location.hash.includes('access_token') || 
         (code && state))));
    
    if (isCallback) {
      console.log("Detected potential OAuth callback - processing authentication");
      setIsProcessingCallback(true);
      setCallbackStatus('processing');
      
      const processCallback = async () => {
        try {
          // First try the direct code exchange method if we have a code
          if (code && state) {
            console.log("Attempting direct code exchange with code:", code.substring(0, 10) + "...");
            
            try {
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              
              if (error) {
                console.error("Direct code exchange failed:", error);
                console.error("Error details:", JSON.stringify(error, null, 2));
                // We'll fall back to the general handleHashTokens method
              } else if (data.session) {
                console.log("Direct code exchange succeeded");
                setCallbackStatus('success');
                
                toast({
                  title: "Authentication Successful",
                  description: `Welcome${data.session.user.user_metadata?.name ? `, ${data.session.user.user_metadata.name}` : ''}!`,
                });
                
                setTimeout(() => {
                  navigate('/dashboard', { replace: true });
                }, 1000);
                
                setIsProcessingCallback(false);
                return;
              }
            } catch (err) {
              console.error("Exception during direct code exchange:", err);
            }
          }
          
          // If direct exchange failed or wasn't possible, try handleHashTokens
          console.log("Falling back to handleHashTokens method");
          const session = await handleHashTokens();
          
          if (session) {
            console.log("Successfully processed callback and restored session");
            setCallbackStatus('success');
            
            // Wait a moment before redirecting to allow toast to be shown
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1000);
          } else {
            console.log("Failed to process callback or no session available");
            setCallbackStatus('error');
            
            // If we have code but failed to exchange it
            if (code) {
              toast({
                title: "Authentication Error",
                description: "Failed to exchange authentication code for a session. Please try again.",
                variant: "destructive",
              });
            }
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

  return {
    user,
    authLoading,
    authError,
    setAuthError,
    isAuthLoading,
    setIsAuthLoading,
    isProcessingCallback,
    callbackStatus,
    defaultTab,
    errorMessage,
    isRedirectError
  };
};
