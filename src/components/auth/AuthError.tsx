
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
    error.includes('OAuth') ||
    error.includes('oauth') ||
    window.location.hash.includes('provider_token');
  
  // Get the current environment 
  const currentUrl = window.location.href;
  const isDevelopment = currentUrl.includes('localhost') || currentUrl.includes('lovableproject.com');
  const siteUrl = isDevelopment ? window.location.origin : 'https://www.roboquant.ai';
  
  // Check for the specific Google OAuth "request is not valid" error
  const isGoogleInvalidRequest = error.includes('app non valida') || error.includes('non valida') || 
                                error.includes('invalid') || error.includes('not valid');
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <div>
        <AlertDescription>{error}</AlertDescription>
        
        {(isRedirectError || isInvalidPathError || isGoogleAuthError || isGoogleInvalidRequest) && (
          <div className="mt-2 text-sm flex flex-col space-y-1">
            <p><strong>To fix this issue:</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to Authentication &gt; URL Configuration</li>
              <li>Set your Site URL to: <code className="bg-muted px-1 rounded text-xs">{isDevelopment ? window.location.origin : 'https://www.roboquant.ai'}</code></li>
              <li>Add these to Additional Redirect URLs:</li>
              <ul className="list-disc pl-8 space-y-1">
                <li><code className="bg-muted px-1 rounded text-xs">{siteUrl}/auth</code></li>
                <li><code className="bg-muted px-1 rounded text-xs">{siteUrl}</code> (without trailing slashes)</li>
                <li><code className="bg-muted px-1 rounded text-xs">https://gqnzsnzolqvsalyzbhmq.supabase.co/auth/v1/callback</code></li>
              </ul>
            </ol>
            
            {(isGoogleAuthError || isGoogleInvalidRequest || error.includes('redirect_uri_mismatch')) && (
              <div className="mt-3">
                <p><strong>For Google OAuth specifically:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to your Google Cloud Console</li>
                  <li>Add these JavaScript Origins:</li>
                  <ul className="list-disc pl-8 space-y-1">
                    <li><code className="bg-muted px-1 rounded text-xs">{window.location.origin}</code></li>
                    <li><code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai</code></li>
                    <li><code className="bg-muted px-1 rounded text-xs">https://roboquant.ai</code> (without www)</li>
                  </ul>
                  <li>Add these Authorized Redirect URIs:</li>
                  <ul className="list-disc pl-8 space-y-1">
                    <li><code className="bg-muted px-1 rounded text-xs">{window.location.origin}/auth</code></li>
                    <li><code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai/auth</code></li>
                    <li><code className="bg-muted px-1 rounded text-xs">https://roboquant.ai/auth</code></li>
                    <li><code className="bg-muted px-1 rounded text-xs">https://gqnzsnzolqvsalyzbhmq.supabase.co/auth/v1/callback</code></li>
                  </ul>
                </ol>
              </div>
            )}
            
            {isGoogleInvalidRequest && (
              <div className="mt-3 p-3 border border-yellow-500 rounded bg-yellow-50 dark:bg-yellow-900/20">
                <p className="font-bold text-yellow-700 dark:text-yellow-400">Important Note about Google OAuth:</p>
                <p className="mt-1">The error message "richiesta non valida" (invalid request) typically indicates that:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>The Authorized JavaScript Origins in Google Cloud Console don't match the sites you're coming from.</li>
                  <li>The Authorized Redirect URIs in Google Cloud Console don't include the URL that Supabase is trying to redirect to.</li>
                  <li>There might be a delay in Google's systems applying your changes (can take up to 5-10 minutes).</li>
                </ol>
                <p className="mt-2">Try clearing your browser cookies and cache, then attempt to sign in again after a few minutes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
};

export default AuthError;
