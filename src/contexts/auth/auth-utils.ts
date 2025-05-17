
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Processes authentication errors in URL hash or search params
 */
export const processUrlErrors = () => {
  console.log("=== AUTH ERROR PROCESSING ===");
  console.log("Processing URL for potential auth errors");
  console.log("Current full URL:", window.location.href);
  console.log("Current URL hash:", window.location.hash);
  console.log("Current URL search:", window.location.search);
  
  // Process hash fragment (common with OAuth redirects)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const error = hashParams.get('error');
  const errorDescription = hashParams.get('error_description');
  
  // Process search params
  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get('error');
  const urlErrorDescription = urlParams.get('error_description');
  
  // Check for hash fragment or URL errors
  if (error || errorDescription || urlError || urlErrorDescription) {
    const errorMsg = errorDescription || error || urlErrorDescription || urlError || "Authentication error";
    console.error("Auth error detected in URL:", errorMsg);
    
    toast({
      title: "Authentication Error",
      description: errorMsg,
      variant: "destructive",
    });
    
    // Clean up URL but preserve the error information in console
    console.log("Cleaning up URL, removing error params");
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, document.title, window.location.pathname + '?error=' + encodeURIComponent(errorMsg));
    }
  } else {
    console.log("No auth errors detected in URL");
  }
};

/**
 * Handles OAuth tokens found in the URL hash or query parameters
 * Enhanced to better handle PKCE flows with proper callback handling
 * @returns Promise that resolves to a session if recovered, null otherwise
 */
export const handleHashTokens = async () => {
  console.log("=== HASH TOKEN PROCESSING ===");
  console.log("Checking for tokens in URL hash or query params");
  
  // Get the current URL and log all its components for debugging
  const currentUrl = window.location.href;
  console.log("Full current URL:", currentUrl);
  console.log("URL pathname:", window.location.pathname);
  console.log("URL search:", window.location.search);
  console.log("URL hash:", window.location.hash);
  
  // Check if we're on the OAuth callback path or have callback parameters
  const isAuthCallbackPath = window.location.pathname.includes('/auth/v1/callback');
  
  // Check if this is a PKCE callback with code and state
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  // Special handling for '/auth/v1/callback' path
  if (isAuthCallbackPath) {
    console.log("Detected auth callback path, redirecting to /auth with params");
    
    // Preserve all query parameters and redirect to /auth
    if (window.history && window.history.replaceState) {
      const authPath = '/auth' + window.location.search;
      window.location.href = authPath;
      return null;
    }
  }
  
  if (code && state) {
    console.log("Found code and state in URL query params");
    
    // Check for code verifier in local storage before attempting code exchange
    const storageKey = 'sb-' + 'gqnzsnzolqvsalyzbhmq' + '-auth-code-verifier';
    const codeVerifier = localStorage.getItem(storageKey);
    
    if (!codeVerifier) {
      console.log("No code verifier found in local storage. Setting up a new one.");
      // Try to set up a general-purpose code verifier that might help
      localStorage.setItem(storageKey, state);
    }
    
    console.log("Code verifier available:", !!codeVerifier);
    
    try {
      console.log("Attempting to exchange code for session");
      
      // First attempt: direct code exchange
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error exchanging code for session:", error);
        } else if (data && data.session) {
          console.log("Successfully exchanged code for session");
          
          // Clean up the URL
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, document.title, '/auth');
          }
          
          toast({
            title: "Authentication Successful",
            description: `Welcome${data.session.user.user_metadata?.name ? `, ${data.session.user.user_metadata.name}` : ''}!`,
          });
          
          return data.session;
        }
      } catch (err) {
        console.error("Exception during code exchange:", err);
      }
      
      // Second attempt: try to extract tokens directly from the URL
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log("Found tokens in URL, setting session directly");
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error("Error setting session from URL tokens:", error);
          } else if (data.session) {
            console.log("Successfully set session from URL tokens");
            
            // Clean up the URL
            if (window.history && window.history.replaceState) {
              window.history.replaceState(null, document.title, '/auth');
            }
            
            return data.session;
          }
        } catch (err) {
          console.error("Exception setting session from URL:", err);
        }
      }
      
      // If we get here, try a fallback approach of signing in directly with provider
      console.log("Direct token exchange failed, attempting to sign in with OAuth again");
      
      // Clean up local storage items and try again
      localStorage.removeItem(storageKey);
      
      // Show a user-friendly error with recovery options
      toast({
        title: "Authentication Session Error",
        description: "Could not establish session. Please try signing in again.",
        variant: "destructive",
      });
    } catch (err) {
      console.error("Exception during authentication:", err);
    }
  } 
  
  // If we still don't have a session, try checking for direct tokens in the hash
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const access_token = hashParams.get('access_token');
  const refresh_token = hashParams.get('refresh_token');
  
  if (access_token && refresh_token) {
    console.log("Found direct tokens in hash fragment, attempting to use them");
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });
      
      if (error) {
        console.error("Error setting session from hash tokens:", error);
        return null;
      }
      
      if (data.session) {
        console.log("Successfully set session from hash tokens");
        
        // Clean up URL
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, document.title, window.location.pathname);
        }
        
        return data.session;
      }
    } catch (err) {
      console.error("Exception setting session from hash:", err);
    }
  }
  
  return null;
};

/**
 * Gets the appropriate redirect URL for OAuth authentication
 */
export const getOAuthRedirectUrl = () => {
  // Get the current URL information
  const currentDomain = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Base URL will be the current origin by default
  let baseUrl = window.location.origin;
  
  // For production on roboquant.ai, always use www
  if (currentDomain.includes('roboquant.ai')) {
    baseUrl = `${protocol}//www.roboquant.ai`;
  }
  
  // Always use /auth as the redirect path
  return `${baseUrl}/auth`;
};
