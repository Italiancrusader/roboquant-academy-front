
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';
import { trackPageView } from './utils/metaPixel';

// Track page view on initial load
trackPageView();

// Ensure the pixel is ready by explicitly checking if fbq exists
if (typeof window !== 'undefined' && !window.fbq) {
  console.error('Meta Pixel fbq object not found - this may indicate the pixel is not loading correctly');
} else {
  console.log('Meta Pixel initialized successfully');
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
