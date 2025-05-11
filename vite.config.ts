import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { OutputOptions } from 'rollup';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
      "scheduler": path.resolve(__dirname, "./node_modules/scheduler"),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'scheduler']
  },
  build: {
    // Inject virtual module to fix React hooks
    rollupOptions: {
      output: {
        // Force React and related packages into a single chunk to avoid duplication
        manualChunks: (id: string) => {
          // Force React and related packages into the same chunk
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules/@radix-ui/react') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/lucide')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'vendor-pdf';
          }
          if (id.includes('node_modules/xlsx')) {
            return 'vendor-spreadsheet';
          }
          if (id.includes('node_modules')) {
            // Group remaining node_modules into a separate vendor chunk
            return 'vendor';
          }
          return undefined;
        },
        inlineDynamicImports: false,
        // Add banner to all JS files to ensure React hooks are available
        // Use a different approach for the charts bundle
        banner: (chunk) => {
          // Special treatment for charts bundle to avoid initialization issues
          if (chunk.fileName.includes('vendor-charts')) {
            return `
// Charts bundle - avoiding ANY patching to prevent initialization errors
// Instead we rely on the global charts-bundle-fix.js script to handle this bundle
`;
          }
          
          // Standard React hook patching for other bundles
          return `
// Fix React hooks in bundled vendor files
(function() {
  if (window.__REACT_HOOKS__) {
    console.log('[VITE-BANNER] Patching bundle: ${chunk.fileName}');
    
    // Ensure React hooks are available
    window.forceHooksAvailable = function(React) {
      if (!React) return;
      if (!React.useLayoutEffect) React.useLayoutEffect = window.__REACT_HOOKS__.useLayoutEffect;
      if (!React.useState) React.useState = window.__REACT_HOOKS__.useState;
      if (!React.useEffect) React.useEffect = window.__REACT_HOOKS__.useEffect;
      return React;
    };
  }
})();
        `;
        }
      } as OutputOptions,
      // Do not treat React as external in production
      external: [],
    },
    commonjsOptions: {
      // Ensure CommonJS modules can see our React patches
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 1200,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    sourcemap: mode !== 'production',
  },
  css: {
    devSourcemap: false,
  },
  optimizeDeps: {
    // Force all deps to be pre-bundled
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime', 
      'scheduler',
      // Add commonly used React hooks libraries that might cause issues
      '@radix-ui/react-use-layout-effect'
    ],
    force: true,
    esbuildOptions: {
      jsx: 'automatic',
    }
  }
}));
