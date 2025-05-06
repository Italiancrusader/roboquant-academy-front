
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Define the window type to include the Crisp property
declare global {
  interface Window {
    $crisp?: any;
    CRISP_WEBSITE_ID?: string;
  }
}

export const CrispChat = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize Crisp chat
    if (!window.CRISP_WEBSITE_ID) {
      window.CRISP_WEBSITE_ID = "89a05112-8521-4a7c-9e15-a866b781ff8e"; // Replace with your actual Crisp website ID
    }

    // Add the Crisp script to the document
    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);

    // Set up user when available
    if (user) {
      window.$crisp?.push(['set', 'user:email', user.email]);
      if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
        window.$crisp?.push([
          'set', 
          'user:nickname', 
          `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        ]);
      }
    }

    return () => {
      // Clean up
      document.head.removeChild(script);
    };
  }, [user]);

  // This component doesn't render anything - it just initializes and manages Crisp chat
  return null;
};
