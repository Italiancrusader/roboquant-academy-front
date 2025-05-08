
import React, { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const AuthDebugInfo: React.FC = () => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const toggleDebugInfo = () => {
    setShowDebugInfo(prev => !prev);
  };

  // Extract the redirect path from either search params or location state
  const redirectPath = searchParams.get('redirect') || 
                      (location.state?.from?.pathname) || 
                      '/dashboard';

  return (
    <>
      <button 
        onClick={toggleDebugInfo} 
        className="text-xs mt-2 text-gray-500 hover:text-gray-400"
      >
        {showDebugInfo ? "Hide" : "Show"} debug info
      </button>
      
      {showDebugInfo && (
        <Alert className="mt-4 text-left text-xs bg-black/50 border border-gray-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <div className="font-mono overflow-x-auto whitespace-pre-wrap">
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>Domain:</strong> {window.location.hostname}</p>
              <p><strong>Origin:</strong> {window.location.origin}</p>
              <p><strong>Path:</strong> {window.location.pathname}</p>
              <p><strong>Search:</strong> {window.location.search}</p>
              <p><strong>Hash:</strong> {window.location.hash}</p>
              <p><strong>From:</strong> {location.state?.from?.pathname || '/dashboard'}</p>
              <p><strong>Redirect path:</strong> {redirectPath}</p>
              <p><strong>Error:</strong> {searchParams.get('error_description') || searchParams.get('error') || "None"}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AuthDebugInfo;
