
import React from 'react';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AuthErrorProps {
  error: string;
  isRedirectError: boolean;
}

const AuthError: React.FC<AuthErrorProps> = ({ error, isRedirectError }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
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
  
  // Check for specific PKCE errors
  const isPkceError = 
    error.includes('pkce') || 
    error.includes('code_verifier') || 
    error.includes('code_challenge') || 
    error.includes('Bad Request');
  
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
      <div className="w-full">
        <AlertDescription className="font-medium text-base">{error}</AlertDescription>
        
        {(isRedirectError || isInvalidPathError || isGoogleAuthError || isGoogleInvalidRequest || isPkceError) && (
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
                    <li><code className="bg-muted px-1 rounded text-xs">https://gqnzsnzolqvsalyzbhmq.supabase.co</code></li>
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
            
            {isPkceError && (
              <div className="mt-3 p-3 border border-yellow-500 rounded bg-yellow-50 dark:bg-yellow-900/20">
                <p className="font-bold text-yellow-700 dark:text-yellow-400">PKCE Authentication Issue:</p>
                <p className="mt-1">This error may be related to PKCE authentication flow issues, which generally involve:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Missing or incorrect code verifier/challenge parameters</li>
                  <li>Third-party cookie restrictions in your browser</li>
                  <li>Local storage access issues for storing authentication state</li>
                </ol>
                <p className="mt-2">Try the following:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Clear your browser cache and cookies</li>
                  <li>Disable ad blockers or privacy extensions temporarily</li>
                  <li>Try a different browser</li>
                  <li>Check that your cookies are enabled for this site</li>
                </ul>
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

        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        >
          {showTechnicalDetails ? "Hide" : "Show"} Technical Details
          {showTechnicalDetails ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
        
        {showTechnicalDetails && (
          <div className="mt-3 p-3 border border-gray-200 rounded bg-gray-50 dark:bg-gray-900/20 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-2">Technical Information:</h4>
            <div className="space-y-1 text-xs font-mono overflow-auto max-h-60">
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Cookies Enabled:</strong> {navigator.cookieEnabled.toString()}</p>
              <p><strong>Local Storage Available:</strong> {(typeof localStorage !== 'undefined').toString()}</p>
              <p><strong>Error Type:</strong> {
                isInvalidPathError ? "Invalid Path Error" : 
                isGoogleAuthError ? "Google OAuth Error" : 
                isGoogleInvalidRequest ? "Google Invalid Request Error" :
                isPkceError ? "PKCE Authentication Error" : 
                "General Authentication Error"
              }</p>
              <p><strong>Hash Fragment:</strong> {window.location.hash ? window.location.hash.substring(0, 50) + "..." : "None"}</p>
              <p><strong>Query Parameters:</strong> {window.location.search ? window.location.search.substring(0, 50) + "..." : "None"}</p>
            </div>
          </div>
        )}
        
      </div>
    </Alert>
  );
};

export default AuthError;
