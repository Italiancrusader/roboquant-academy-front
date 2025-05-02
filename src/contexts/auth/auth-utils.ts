
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
      window.history.replaceState(null, document.title, window.location.pathname);
    }
  } else {
    console.log("No auth errors detected in URL");
  }
};

/**
 * Handles OAuth tokens found in the URL hash
 * @returns Promise that resolves to a session if recovered, null otherwise
 */
export const handleHashTokens = async () => {
  console.log("=== HASH TOKEN PROCESSING ===");
  console.log("Checking for tokens in URL hash");
  
  // Check if URL has hash with tokens - this also works for OAuth response hash fragments
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
      
      // Clean up URL but preserve the error for debugging
      setTimeout(() => {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, document.title, 
            window.location.pathname + '?error=' + encodeURIComponent(errorDescription || error || ''));
        }
      }, 100);
      
      return null;
    }
    
    // Check if we have the necessary tokens for session recovery
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const providerToken = hashParams.get('provider_token');
    const providerRefreshToken = hashParams.get('provider_refresh_token');
    
    console.log("Access token present:", !!accessToken);
    console.log("Refresh token present:", !!refreshToken);
    console.log("Provider token present:", !!providerToken);
    console.log("Provider refresh token present:", !!providerRefreshToken);
    
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
  } else {
    console.log("No relevant tokens found in URL hash");
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
  
  // If in local dev, use the current origin, otherwise use the non-www production URL
  const baseUrl = isLocalDev ? window.location.origin : 'https://roboquant.ai'; // Changed from www.roboquant.ai
  
  // Always use /auth as the redirect path
  return `${baseUrl}/auth`;
};
