
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
 * Helper to ensure code verifier is available for PKCE flow
 * Used to fix common issues with missing code verifier
 */
export const ensureCodeVerifierForPKCE = (code: string, state: string) => {
  const storageKey = 'sb-gqnzsnzolqvsalyzbhmq-auth-code-verifier';
  let codeVerifier = localStorage.getItem(storageKey);
  
  console.log("Checking code verifier for PKCE flow");
  console.log("Code verifier present:", !!codeVerifier);
  console.log("State available:", !!state);
  
  // If no code verifier is found, create a new one based on state
  // This is a fallback mechanism when the code verifier is lost or not set properly
  if (!codeVerifier && state) {
    console.log("No code verifier found, creating fallback from state");
    // Create a fallback code verifier from state (must be at least 43 chars)
    const fallbackVerifier = state.padEnd(43, state);
    localStorage.setItem(storageKey, fallbackVerifier);
    console.log("Created fallback code verifier from state");
    return fallbackVerifier;
  }
  
  return codeVerifier;
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
    
    // Ensure we have a code verifier for the PKCE flow
    ensureCodeVerifierForPKCE(code, state);
    
    try {
      console.log("Attempting multiple methods to exchange code for session");
      
      // Method 1: Direct code exchange
      try {
        console.log("Method 1: Direct code exchange");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error in direct code exchange:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
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
        console.error("Exception during direct code exchange:", err);
      }
      
      // Method 2: Try to extract tokens from URL params
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log("Method 2: Using tokens from URL params");
        
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
      
      // Method 3: Try to sign in with provider directly
      console.log("Method 3: Attempting to get session through provider sign-in");
      // This is a last resort and will redirect the user again
      
      // Clean up the URL and show a toast to explain the situation
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, document.title, '/auth');
      }
      
      // Show a user-friendly error with recovery options
      toast({
        title: "Authentication Session Error",
        description: "Having trouble establishing your session. Please try signing in again.",
        variant: "destructive",
      });
      
      return null;
    } catch (err) {
      console.error("Exception during authentication:", err);
    }
  } 
  
  // Method 4: If we still don't have a session, try checking for direct tokens in the hash
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const access_token = hashParams.get('access_token');
  const refresh_token = hashParams.get('refresh_token');
  
  if (access_token && refresh_token) {
    console.log("Method 4: Found direct tokens in hash fragment");
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
