
import { createRoot } from 'react-dom/client';
import { lazy, Suspense, StrictMode } from 'react';
import './index.css';

// Use lazy loading for the main App component
const App = lazy(() => import('./App.tsx'));

// Simple loading component with LCP considered
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background">
    <div className="w-full max-w-5xl px-4 mb-8 text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
        Build & launch profitable trading bots — <span className="gradient-text">without writing code</span>.
      </h1>
    </div>
    <div className="w-12 h-12 border-4 border-blue-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Mount app with Suspense boundary
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>
);
