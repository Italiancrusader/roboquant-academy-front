
import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import './index.css';

// Use lazy loading for the main App component
const App = lazy(() => import('./App.tsx'));

// Simple loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-12 h-12 border-4 border-blue-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Mount app with Suspense boundary
createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<LoadingFallback />}>
    <App />
  </Suspense>
);
