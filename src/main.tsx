
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';

// Preload critical assets in the background but don't block rendering
const preloadAssets = () => {
  // Preload hero image
  const img = new Image();
  img.src = '/lovable-uploads/fd0974dc-cbd8-4af8-b3c8-35c6a8182cf5.png';
  
  // Preload video
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'fetch';
  link.href = 'https://www.youtube.com/embed/f14SlGPD4gM?autoplay=0';
  document.head.appendChild(link);
  setTimeout(() => document.head.removeChild(link), 5000); // Clean up after load
};

// Start preloading assets in the background
preloadAssets();

// Mount app immediately - no need to wait for assets to load
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingAnimation />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
