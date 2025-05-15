
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
 * Enhanced to better handle PKCE flows
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
  
  // Check if we're on the auth page with a code parameter (PKCE flow)
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  if (code && state) {
    console.log("Found code and state in URL query params");
    console.log("Code present (first 10 chars):", code.substring(0, 10) + "...");
    console.log("State present (first 10 chars):", state.substring(0, 10) + "...");
    
    try {
      console.log("Attempting to exchange code for session via official Supabase method");
      
      // Let the Supabase client handle the code exchange directly
      // This should work with the detectSessionInUrl option
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Error exchanging code for session:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to complete authentication",
          variant: "destructive",
        });
        
        return null;
      }
      
      if (data && data.session) {
        console.log("Successfully exchanged code for session");
        console.log("User authenticated:", data.session.user.email);
        
        // Clear the URL of the code and state params
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, document.title, window.location.pathname);
        }
        
        toast({
          title: "Authentication Successful",
          description: `Welcome${data.session.user.user_metadata?.name ? `, ${data.session.user.user_metadata.name}` : ''}!`,
        });
        
        return data.session;
      } else {
        console.log("No session data returned after code exchange");
      }
    } catch (err) {
      console.error("Exception during code exchange:", err);
    }
  } 
  
  // Check if URL has hash with tokens - this handles non-PKCE OAuth flows
  if (window.location.hash && (
    window.location.hash.includes('access_token') || 
    window.location.hash.includes('error'))) {
    
    console.log("Detected hash with potential tokens:", window.location.hash.substring(0, 20) + "...");
    
    // Extract the hash without the leading #
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // Check for errors first
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error || errorDescription) {
      console.error("Error in OAuth callback:", errorDescription || error);
      toast({
        title: "Authentication Error",
        description: errorDescription || error || "Failed to authenticate",
        variant: "destructive",
      });
      
      return null;
    }
    
    // Check if we have the necessary tokens for session recovery
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    console.log("Access token present:", !!accessToken);
    console.log("Refresh token present:", !!refreshToken);
    
    if (accessToken) {
      console.log("Found access token, attempting to recover session");
      
      try {
        // Try to set session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          console.error("Failed to recover session:", error);
          toast({
            title: "Authentication Error",
            description: "Failed to complete authentication. Please try again.",
            variant: "destructive",
          });
          return null;
        }
        
        if (data.session) {
          console.log("Successfully recovered session from URL tokens");
          console.log("User authenticated:", data.session.user.email);
          
          // Clear the hash to remove tokens from URL
          window.history.replaceState(null, document.title, window.location.pathname);
          
          toast({
            title: "Authentication Successful",
            description: `Welcome${data.session.user.user_metadata?.name ? `, ${data.session.user.user_metadata.name}` : ''}!`,
          });
          
          return data.session;
        }
      } catch (err) {
        console.error("Error recovering session:", err);
      }
    } else {
      console.log("No access token found in hash");
    }
  } 
  
  // If we got here, no successful authentication occurred
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
