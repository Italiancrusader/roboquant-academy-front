
import React from 'react';
import { Alert } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AlertDescription } from '@/components/ui/alert';

interface AuthErrorProps {
  error: string;
  isRedirectError: boolean;
}

const AuthError: React.FC<AuthErrorProps> = ({ error, isRedirectError }) => {
  if (!error) return null;

  // Check for various forms of the invalid path error
  const isInvalidPathError = 
    error.includes('requested path is invalid') || 
    error.includes('invalid_redirect') ||
    error.includes('redirect_uri_mismatch') ||
    error.includes('supabase.co/www');
  
  // Check if it's specifically a Google OAuth issue
  const isGoogleAuthError = 
    error.includes('google') || 
    error.includes('provider_token') ||
    error.includes('provider_refresh_token') ||
    window.location.hash.includes('provider_token');
  
  // Get the current environment 
  const currentUrl = window.location.href;
  const isDevelopment = currentUrl.includes('localhost') || currentUrl.includes('lovableproject.com');
  const siteUrl = isDevelopment ? window.location.origin : 'https://www.roboquant.ai';
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <div>
        <AlertDescription>{error}</AlertDescription>
        {(isRedirectError || isInvalidPathError || isGoogleAuthError) && (
          <div className="mt-2 text-sm flex flex-col space-y-1">
            <p><strong>To fix this issue:</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to Authentication &gt; URL Configuration</li>
              <li>Set your Site URL to: <code className="bg-muted px-1 rounded text-xs">{isDevelopment ? window.location.origin : 'https://www.roboquant.ai'}</code></li>
              <li>Add to Redirect URLs: <code className="bg-muted px-1 rounded text-xs">{siteUrl}/auth</code></li>
              
              {!isDevelopment && (
                <>
                  <li>Also add to Redirect URLs without trailing slashes: <code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai</code></li>
                  <li>And with /auth path: <code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai/auth</code></li>
                </>
              )}
            </ol>
            
            {(isGoogleAuthError || error.includes('redirect_uri_mismatch')) && (
              <div className="mt-2">
                <p><strong>For Google OAuth specifically:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to your Google Cloud Console</li>
                  <li>Add these JavaScript Origins:</li>
                  <ul className="list-disc pl-8 space-y-1">
                    <li><code className="bg-muted px-1 rounded text-xs">{window.location.origin}</code></li>
                    {!isDevelopment && (
                      <>
                        <li><code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai</code></li>
                        <li><code className="bg-muted px-1 rounded text-xs">https://roboquant.ai</code> (without www)</li>
                      </>
                    )}
                  </ul>
                  <li>Add these Authorized Redirect URIs:</li>
                  <ul className="list-disc pl-8 space-y-1">
                    <li><code className="bg-muted px-1 rounded text-xs">{window.location.origin}/auth</code></li>
                    {!isDevelopment && (
                      <>
                        <li><code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai</code></li>
                        <li><code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai/auth</code></li>
                      </>
                    )}
                    <li><code className="bg-muted px-1 rounded text-xs">https://gqnzsnzolqvsalyzbhmq.supabase.co/auth/v1/callback</code></li>
                  </ul>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
};

export default AuthError;
