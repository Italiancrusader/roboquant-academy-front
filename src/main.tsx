// First, ensure React is a singleton
import './utils/ensure-react';

// Use the singleton React instance to prevent multiple React instances
import { React, ReactDOMClient } from './utils/react-singleton';
import App from './App';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';

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

// Mount app with Suspense boundary
ReactDOMClient.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingAnimation />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
