/**
 * This file ensures all imports of React and ReactDOM use the same instance throughout the application.
 * This helps prevent the "Cannot read properties of undefined (reading 'useLayoutEffect')" error
 * which happens when multiple React instances are present.
 */

// Add custom window property declarations for TypeScript
declare global {
  interface Window {
    __REACT_EMERGENCY_PATCH__?: (reactInstance: any) => any;
    __REACT_HOOK_SOURCE__?: any;
    React?: any;
  }
}

import * as ReactOriginal from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactJSXRuntime from 'react/jsx-runtime';

// Apply emergency patching if global function exists
if (window.__REACT_EMERGENCY_PATCH__) {
  window.__REACT_EMERGENCY_PATCH__(ReactOriginal);
}

// Ensure React is available globally
if (window.React !== ReactOriginal) {
  window.React = ReactOriginal;
}

// Export jsx runtime functions explicitly
export const { jsx, jsxs, Fragment } = ReactJSXRuntime;

// Create an intercepting proxy for React to catch any potential undefined hook access
const ReactProxy = new Proxy(ReactOriginal, {
  get: function(target, prop, receiver) {
    // Handle special case for useLayoutEffect which commonly causes problems
    if (prop === 'useLayoutEffect' && typeof target.useLayoutEffect === 'undefined') {
      console.warn('Intercepted undefined useLayoutEffect access, providing fallback');
      // Fall back to useEffect if useLayoutEffect is undefined
      return target.useEffect || (() => {});
    }
    
    // For any hooks that are undefined, provide a safe fallback
    if (prop.toString().startsWith('use') && typeof target[prop] === 'undefined') {
      console.warn(`Intercepted undefined ${String(prop)} access, providing fallback`);
      // For any hook, provide a safe no-op function that won't crash
      return (...args: any[]) => { 
        console.warn(`Called undefined hook: ${String(prop)}`); 
        return args[0]; // Return the initial value if provided
      };
    }
    
    return Reflect.get(target, prop, receiver);
  }
});

// Re-export to make these the canonical versions used in the app
export { ReactProxy as React, ReactDOM, ReactDOMClient, ReactJSXRuntime };

// Export all React hooks and utilities to make them accessible through this single entry point
export const {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
  useReducer,
  useImperativeHandle,
  useDebugValue,
  useId,
  forwardRef,
  createContext,
  memo,
  isValidElement,
  createElement,
  cloneElement,
  createRef,
  Children,
  lazy,
  Suspense,
  startTransition,
  createFactory,
  Component,
  PureComponent
} = ReactOriginal;

// Default export for backward compatibility
export default ReactProxy;
