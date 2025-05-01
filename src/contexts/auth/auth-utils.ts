
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Processes authentication errors in URL hash or search params
 */
export const processUrlErrors = () => {
  // Process hash fragment (common with OAuth redirects)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const error = hashParams.get('error');
  const errorDescription = hashParams.get('error_description');
  
  // Process search params
  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get('error');
  const urlErrorDescription = urlParams.get('error_description');
  
  // Current full URL for debugging
  console.log("Current URL during auth check:", window.location.href);
  
  // Check for hash fragment or URL errors
  if (error || errorDescription || urlError || urlErrorDescription) {
    const errorMsg = errorDescription || error || urlErrorDescription || urlError || "Authentication error";
    console.error("Auth error detected in URL:", errorMsg);
    
    toast({
      title: "Authentication Error",
      description: errorMsg,
      variant: "destructive",
    });
    
    // Clean up URL
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, document.title, window.location.pathname);
    }
  }
};

/**
 * Handles OAuth tokens found in the URL hash
 * @returns Promise that resolves to a session if recovered, null otherwise
 */
export const handleHashTokens = async () => {
  if (window.location.hash && window.location.hash.includes('access_token')) {
    console.log("Detected OAuth tokens in URL hash on initial page load");
    
    // Extract the hash without the leading #
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // Check if we have the necessary tokens for session recovery
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (accessToken) {
      console.log("Found access token in hash, attempting to recover session");
      
      try {
        // Try to set session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          console.error("Failed to recover session from URL tokens:", error);
          toast({
            title: "Authentication Error",
            description: "Failed to complete Google sign-in. Please try again.",
            variant: "destructive",
          });
          return null;
        }
        
        if (data.session) {
          console.log("Successfully recovered session from URL tokens");
          
          // Clear the hash to remove tokens from URL
          window.history.replaceState(null, document.title, window.location.pathname);
          
          return data.session;
        }
      } catch (err) {
        console.error("Error recovering session:", err);
      }
    }
  }
  
  return null;
};

/**
 * Gets the appropriate redirect URL for OAuth authentication
 */
export const getOAuthRedirectUrl = () => {
  // Get the current URL to determine environment
  const currentUrl = window.location.href;
  const isLocalDev = currentUrl.includes('localhost') || currentUrl.includes('lovableproject.com');
  
  // If in local dev, use the current origin, otherwise use the production URL
  const baseUrl = isLocalDev ? window.location.origin : 'https://www.roboquant.ai';
  
  // Always use /auth as the redirect path
  return `${baseUrl}/auth`;
};
