
import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';

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

// Use lazy loading for the main App component
const App = lazy(() => 
  // Wait for assets to load before showing the app
  Promise.all([
    import('./App.tsx'),
    preloadAssets()
  ]).then(([moduleExports]) => moduleExports)
);

// Mount app with Suspense boundary
createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<LoadingAnimation />}>
    <App />
  </Suspense>
);
