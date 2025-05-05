
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';
import { initFacebookPixel, trackPageView } from './utils/metaPixel';

// Initialize Facebook Pixel immediately
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';
if (META_PIXEL_ID) {
  console.log('Initializing Meta Pixel with ID:', META_PIXEL_ID);
  initFacebookPixel(META_PIXEL_ID);
  // Track page view on initial load
  trackPageView();
} else {
  console.warn('Meta Pixel ID is not configured. Pixel tracking will not work.');
}

// Add Meta Pixel tracking noscript tag for browsers with JavaScript disabled
if (typeof document !== 'undefined') {
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.head.appendChild(noscript);
}

// Preload critical assets
const preloadAssets = async () => {
  // Preload hero image
  const imagePromise = new Promise((resolve) => {
    const img = new Image();
    img.src = '/lovable-uploads/fd0974dc-cbd8-4af8-b3c8-35c6a8182cf5.png';
    img.onload = resolve;
  });

  // Preload video by creating a hidden iframe
  const videoPromise = new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://www.youtube.com/embed/f14SlGPD4gM?autoplay=0';
    iframe.onload = resolve;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 5000); // Clean up after load
  });

  await Promise.all([imagePromise, videoPromise]);
};

// Mount app with Suspense boundary
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingAnimation />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);

// Preload assets in the background
preloadAssets();
