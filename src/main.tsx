
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';
import { supabase } from '@/integrations/supabase/client';

// Initialize Supabase client before anything else
console.log("Initializing Supabase client:", !!supabase);

// Define dataLayer for Google Tag Manager if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Initialize Meta Pixel and Google Analytics (but don't track routes yet, that's handled by the components)
if (typeof window !== 'undefined') {
  // Initialize GA dataLayer
  window.dataLayer.push({ event: 'page_load' });
  
  // Initialize Meta Pixel if fbq exists
  if (window.fbq) {
    window.fbq('init', '1234567890'); // Replace with your actual Pixel ID
  }
}

// Cache busting timestamp: This forces browsers to reload the bundle when it changes
console.log(`App version: ${import.meta.env.VITE_BUILD_TIME || new Date().getTime()}`);

// Mount app with Suspense boundary
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingAnimation />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
