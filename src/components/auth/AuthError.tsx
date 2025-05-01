
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

  // Check specifically for the "requested path is invalid" error
  const isInvalidPathError = error.includes('requested path is invalid');
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <div>
        <AlertDescription>{error}</AlertDescription>
        {(isRedirectError || isInvalidPathError) && (
          <div className="mt-2 text-sm flex flex-col space-y-1">
            <p>To fix this issue:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to Authentication &gt; URL Configuration</li>
              <li>Set your Site URL to: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}</code></li>
              <li>Add to Redirect URLs: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}/auth</code></li>
              {window.location.hostname === 'www.roboquant.ai' && (
                <li>Also add to Redirect URLs: <code className="bg-muted px-1 rounded text-xs">https://www.roboquant.ai/auth</code></li>
              )}
            </ol>
          </div>
        )}
      </div>
    </Alert>
  );
};

export default AuthError;
