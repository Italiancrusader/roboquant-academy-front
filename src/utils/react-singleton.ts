
/**
 * This file ensures all imports of React and ReactDOM use the same instance throughout the application.
 * This helps prevent the "Cannot read properties of undefined (reading 'useLayoutEffect')" error
 * which happens when multiple React instances are present.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactJSXRuntime from 'react/jsx-runtime';

// Export jsx runtime functions explicitly
export const { jsx, jsxs, Fragment } = ReactJSXRuntime;

// Re-export to make these the canonical versions used in the app
export { React, ReactDOM, ReactDOMClient };

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
} = React;

// Default export for backward compatibility
export default React;
