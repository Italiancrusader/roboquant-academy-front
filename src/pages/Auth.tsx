
import React from 'react';
import AuthCallback from '@/components/auth/AuthCallback';
import AuthFormContainer from '@/components/auth/AuthFormContainer';
import { useAuthPage } from '@/hooks/useAuthPage';

const Auth = () => {
  const {
    authLoading,
    authError,
    setAuthError,
    isAuthLoading,
    setIsAuthLoading,
    isProcessingCallback,
    callbackStatus,
    defaultTab,
    errorMessage
  } = useAuthPage();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show special callback processing UI
  if (isProcessingCallback) {
    return <AuthCallback callbackStatus={callbackStatus} />;
  }

  return (
    <AuthFormContainer
      defaultTab={defaultTab}
      authError={authError}
      isRedirectError={!!errorMessage}
      isAuthLoading={isAuthLoading}
      setAuthError={setAuthError}
      setIsLoading={setIsAuthLoading}
    />
  );
};

export default Auth;
