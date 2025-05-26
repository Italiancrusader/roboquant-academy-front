
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
  
  // Handle potential OAuth callback or email verification
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
    
    // Check for email verification token
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const redirectTo = searchParams.get('redirect_to');
    
    // Check specifically for code and state params (PKCE flow)
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // Handle email verification callback
    if (token && type === 'signup') {
      console.log("Detected email verification token - processing verification");
      setIsProcessingCallback(true);
      setCallbackStatus('processing');
      
      const processVerification = async () => {
        try {
          console.log("Attempting to verify email with token:", token.substring(0, 10) + "...");
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
          
          if (error) {
            console.error("Email verification failed:", error);
            setCallbackStatus('error');
            toast({
              title: "Email Verification Failed",
              description: error.message || "Failed to verify your email. Please try again.",
              variant: "destructive",
            });
          } else if (data.session) {
            console.log("Email verification successful");
            setCallbackStatus('success');
            
            toast({
              title: "Email Verified Successfully!",
              description: "Your account has been verified. You are now signed in.",
            });
            
            // Wait a moment before redirecting
            setTimeout(() => {
              const finalRedirect = redirectTo || '/dashboard';
              navigate(finalRedirect, { replace: true });
            }, 1500);
          } else {
            console.log("Email verification completed but no session");
            setCallbackStatus('success');
            
            toast({
              title: "Email Verified!",
              description: "Your email has been verified. You can now sign in.",
            });
            
            // Redirect to sign in form
            setTimeout(() => {
              navigate('/auth?signin=true', { replace: true });
            }, 1500);
          }
        } catch (error) {
          console.error("Error processing email verification:", error);
          setCallbackStatus('error');
          toast({
            title: "Verification Error",
            description: "An unexpected error occurred during verification. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessingCallback(false);
        }
      };
      
      processVerification();
      return;
    }
    
    // Handle OAuth callback if this looks like one
    const isCallback = 
      (window.location.pathname === '/auth' && 
       ((window.location.hash.includes('access_token') || 
         (code && state))));
    
    if (isCallback) {
      console.log("Detected potential OAuth callback - processing authentication");
      console.log("PKCE Code detected:", !!code);
      console.log("State detected:", !!state);
      setIsProcessingCallback(true);
      setCallbackStatus('processing');
      
      const processCallback = async () => {
        try {
          // First try the direct code exchange method if we have a code
          if (code && state) {
            console.log("Attempting direct code exchange with code:", code.substring(0, 10) + "...");
            
            try {
              // Clear any cached PKCE data that might be invalid
              localStorage.removeItem('supabase.auth.code_verifier');
              
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
              console.error("Error details:", err instanceof Error ? err.message : String(err));
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
