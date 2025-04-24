
import { createRoot } from 'react-dom/client';
import { lazy, Suspense, StrictMode } from 'react';
import './index.css';
import LoadingAnimation from './components/LoadingAnimation';

// Preload critical image
const preloadHeroImage = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/lovable-uploads/fd0974dc-cbd8-4af8-b3c8-35c6a8182cf5.png';
  link.as = 'image';
  link.fetchPriority = 'high';
  document.head.appendChild(link);
};

// Execute preload immediately
preloadHeroImage();

// Use lazy loading for the main App component
const App = lazy(() => import('./App.tsx'));

// Mount app with Suspense boundary
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<LoadingAnimation />}>
      <App />
    </Suspense>
  </StrictMode>
);
