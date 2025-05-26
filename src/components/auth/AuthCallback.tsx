
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AuthCallbackProps {
  callbackStatus: 'idle' | 'processing' | 'success' | 'error';
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ callbackStatus }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        <h1 className="text-3xl font-bold gradient-text">Processing Authentication</h1>
        
        {callbackStatus === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Verifying your email and signing you in...</p>
          </div>
        )}
        
        {callbackStatus === 'success' && (
          <Alert className="bg-green-950/30 border-green-600 mt-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-400">Verification successful</AlertTitle>
            <AlertDescription>
              Your email has been verified and you are now signed in. Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}
        
        {callbackStatus === 'error' && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification failed</AlertTitle>
            <AlertDescription>
              <div className="space-y-4">
                <p>There was a problem verifying your email or processing your sign in.</p>
                
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <strong>What to try:</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Make sure you clicked the latest verification link</li>
                      <li>Check if the link has expired (links expire after 24 hours)</li>
                      <li>Try signing up again to get a new verification email</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col space-y-4">
                  <Button 
                    onClick={() => navigate('/auth?signup=true')}
                    variant="outline"
                    className="w-full"
                  >
                    Try signing up again
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    className="w-full"
                  >
                    Return to login page
                  </Button>
                  
                  <Button 
                    asChild 
                    className="w-full"
                  >
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" /> Go to home page
                    </Link>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
