
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const NotFound = () => {
  // Get the current domain
  const currentDomain = window.location.hostname;
  const isDomainSetup = currentDomain.includes('roboquant.ai');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-neulis">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl font-semibold text-white mt-4 mb-6">Oops! Page not found</h2>
          <p className="text-gray-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>

          {isDomainSetup && (
            <Alert variant="destructive" className="mb-8 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Domain Configuration Issue</AlertTitle>
              <AlertDescription>
                <p className="mb-2">It appears that {currentDomain} may not be properly configured with your hosting provider.</p>
                <p className="mb-2">Please ensure:</p>
                <ol className="list-decimal pl-5 space-y-1 mb-2">
                  <li>Your domain is properly connected to your hosting service</li>
                  <li>DNS settings are properly configured</li>
                  <li>The build has been deployed to the correct environment</li>
                </ol>
                <p>If you're using a custom domain, make sure it's properly set up in your hosting provider.</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <Button 
          asChild 
          className="cta-button text-white py-5 px-8"
        >
          <Link to="/">
            <Home className="mr-2 h-5 w-5" /> Return to Home
          </Link>
        </Button>
        
        <div className="mt-16">
          <img 
            src="/lovable-uploads/56e1912c-6199-4933-a4e9-409fbe7e9311.png"
            alt="RoboQuant Academy"
            className="h-12 mx-auto opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
