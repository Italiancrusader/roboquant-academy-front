
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthFormContainer from '@/components/auth/AuthFormContainer';
import { trackViewContent } from '@/utils/metaPixel';

const Auth = () => {
  useEffect(() => {
    // Track ViewContent event for auth/registration page
    trackViewContent({
      content_name: 'Registration Page',
      content_category: 'account',
      content_type: 'registration_page'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 pt-20 pb-20">
        <AuthFormContainer />
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
