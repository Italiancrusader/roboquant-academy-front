// Force React and ReactDOM to be true singletons in the application
// This injects the React singleton at runtime to ensure proper resolution
import * as ReactOriginal from 'react';
import * as ReactDOMOriginal from 'react-dom';

// Store the original React in global scope to ensure all module imports see the same instance
window.__REACT_INSTANCE__ = ReactOriginal;
window.__REACT_DOM_INSTANCE__ = ReactDOMOriginal;

// Create a hook polyfill that redirects to our singleton React
if (!window.__REACT_HOOKS_PATCHED__) {
  // Store all React hooks on the window object
  const hooks = {};
  
  // Capture all hook methods
  [
    'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 
    'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 
    'useDebugValue', 'useDeferredValue', 'useTransition', 'useId',
    'useSyncExternalStore', 'useInsertionEffect'
  ].forEach(hookName => {
    if (ReactOriginal[hookName]) {
      hooks[hookName] = ReactOriginal[hookName];
    }
  });
  
  // Expose all hooks on window for emergency access
  window.__REACT_HOOKS__ = hooks;
  
  // Create global helpers to assist libraries that might be using their own React
  window.__GET_ORIGINAL_REACT_HOOK__ = (hookName) => {
    return window.__REACT_HOOKS__[hookName];
  };
  
  // Patch React.createElement to ensure it always comes from our singleton
  if (typeof window.__REACT_INSTANCE__.createElement === 'function') {
    const originalCreateElement = window.__REACT_INSTANCE__.createElement;
    window.React = { 
      ...window.__REACT_INSTANCE__,
      createElement: originalCreateElement.bind(window.__REACT_INSTANCE__)
    };
  }
  
  window.__REACT_HOOKS_PATCHED__ = true;
  console.log('React hooks polyfilled and patched');
}

// Export the real React instances
export const React = window.__REACT_INSTANCE__;
export const ReactDOM = window.__REACT_DOM_INSTANCE__;

// Export as default and named
export default window.__REACT_INSTANCE__; 