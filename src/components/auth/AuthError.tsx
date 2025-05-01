
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
    error.includes('supabase.co/www');
  
  // Check if it's specifically a Google OAuth issue
  const isGoogleAuthError = 
    error.includes('google') || 
    error.includes('provider_token') ||
    error.includes('provider_refresh_token');
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <div>
        <AlertDescription>{error}</AlertDescription>
        {(isRedirectError || isInvalidPathError) && (
          <div className="mt-2 text-sm flex flex-col space-y-1">
            <p><strong>To fix this issue:</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to Authentication &gt; URL Configuration</li>
              <li>Set your Site URL to: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}</code></li>
              <li>Add to Redirect URLs: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}/auth</code></li>
              
              {window.location.hostname === 'www.roboquant.ai' && (
                <>
                  <li>Also add to Redirect URLs without trailing slashes: <code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai</code></li>
                  <li>And with /auth path: <code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai/auth</code></li>
                </>
              )}
            </ol>
            
            {isGoogleAuthError && (
              <div className="mt-2">
                <p><strong>For Google OAuth specifically:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to your Google Cloud Console</li>
                  <li>Ensure the OAuth consent screen has the correct domain</li>
                  <li>Check your OAuth credentials have these authorized redirect URIs:</li>
                  <ul className="list-disc pl-8 space-y-1">
                    <li><code className="bg-muted px-1 rounded text-xs">{window.location.origin}/auth</code></li>
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
