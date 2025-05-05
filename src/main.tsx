
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';
import { trackPageView as trackMetaPixelPageView } from './utils/metaPixel';
import { trackPageView as trackGAPageView } from './utils/googleAnalytics';

// Define dataLayer for Google Tag Manager if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Track page view
trackMetaPixelPageView();
trackGAPageView(window.location.pathname);

// Mount app with Suspense boundary
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingAnimation />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
