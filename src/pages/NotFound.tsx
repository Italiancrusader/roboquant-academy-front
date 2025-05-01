
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-neulis">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl font-semibold text-white mt-4 mb-6">Oops! Page not found</h2>
          <p className="text-gray-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
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
