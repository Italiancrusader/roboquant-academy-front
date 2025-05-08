
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { handleHashTokens, processUrlErrors } from '@/contexts/auth/auth-utils';

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
