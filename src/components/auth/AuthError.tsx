
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

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <div>
        <AlertDescription>{error}</AlertDescription>
        {isRedirectError && (
          <div className="mt-2 text-sm flex flex-col space-y-1">
            <p>To fix this issue:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to Authentication &gt; URL Configuration</li>
              <li>Set your Site URL to: <code className="bg-muted px-1 rounded">{window.location.origin}</code></li>
              <li>Add to Redirect URLs: <code className="bg-muted px-1 rounded">{window.location.origin}/auth</code></li>
            </ol>
          </div>
        )}
      </div>
    </Alert>
  );
};

export default AuthError;
