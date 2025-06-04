
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';
import { supabase } from '@/integrations/supabase/client';

// Initialize Supabase client before anything else
console.log("Starting application initialization");
console.log("Supabase client available:", !!supabase);

// Enable more verbose Supabase debugging
if (typeof window !== 'undefined') {
  console.log("Setting up Supabase debugging");
  
  // Check for auth params in URL early
  if (window.location.href.includes('code=') && window.location.href.includes('state=')) {
    console.log("AUTH PARAMS DETECTED IN URL:", window.location.href);
  }
}

// Define dataLayer for Google Tag Manager if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Initialize Meta Pixel and Google Analytics (but don't track routes yet, that's handled by the components)
if (typeof window !== 'undefined') {
  // Initialize GA dataLayer
  window.dataLayer.push({ event: 'page_load' });
  
  // Initialize Meta Pixel if fbq exists - but only once
  if (window.fbq && !window.fbPixelInitialized) {
    window.fbq('init', '1570199587006306');
    window.fbPixelInitialized = true;
  }
}

// Cache busting timestamp: This forces browsers to reload the bundle when it changes
console.log(`App version: ${import.meta.env.VITE_BUILD_TIME || new Date().getTime()}`);
console.log("App environment:", import.meta.env.MODE);
console.log("Current URL at initialization:", window.location.href);

// Mount app with Suspense boundary
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingAnimation />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
