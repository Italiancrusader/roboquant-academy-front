/**
 * This script directly patches React hooks in vendor bundles
 * It's loaded early in the page to ensure hooks are available before any vendor code runs
 */
(function() {
  console.log('Initializing vendor bundle React hook patch');
  
  // Store original React hooks implementations
  var hookImplementations = {};
  
  // Create emergency implementations of React hooks
  var createEmergencyHook = function(hookName) {
    return function() {
      console.warn('Emergency ' + hookName + ' called');
      // For useState, return a stateless state
      if (hookName === 'useState') {
        return [arguments[0], function() {}];
      }
      
      // For useEffect and useLayoutEffect, just execute the effect function
      if (hookName === 'useEffect' || hookName === 'useLayoutEffect') {
        var fn = arguments[0];
        if (typeof fn === 'function') {
          try {
            var cleanup = fn();
            // Execute cleanup immediately if it's a function
            if (typeof cleanup === 'function') {
              cleanup();
            }
          } catch (e) {
            console.error('Error in emergency ' + hookName, e);
          }
        }
        return undefined;
      }
      
      // For useRef, return a ref-like object
      if (hookName === 'useRef') {
        return { current: arguments[0] };
      }
      
      // For useCallback, just return the function
      if (hookName === 'useCallback') {
        return arguments[0];
      }
      
      // For useMemo, execute the function and return the result
      if (hookName === 'useMemo') {
        var memoFn = arguments[0];
        if (typeof memoFn === 'function') {
          try {
            return memoFn();
          } catch (e) {
            console.error('Error in emergency useMemo', e);
            return undefined;
          }
        }
        return undefined;
      }
      
      // Default fallback just returns the first argument
      return arguments[0];
    };
  };
  
  // Create emergency hooks
  var hooks = [
    'useState', 'useEffect', 'useLayoutEffect', 'useRef', 'useCallback', 
    'useMemo', 'useContext', 'useReducer', 'useImperativeHandle', 'useDebugValue'
  ];
  
  // Store emergency implementations
  hooks.forEach(function(hookName) {
    hookImplementations[hookName] = createEmergencyHook(hookName);
  });
  
  // Store these globally to be available to other scripts
  window.__REACT_HOOK_POLYFILLS__ = hookImplementations;
  
  // Function to patch a React instance
  var patchReact = function(React) {
    if (!React || typeof React !== 'object') return React;
    
    console.log('Patching React instance:', React);
    
    // Patch all hooks
    hooks.forEach(function(hookName) {
      if (!React[hookName]) {
        Object.defineProperty(React, hookName, {
          configurable: true, 
          writable: true,
          value: hookImplementations[hookName]
        });
        console.log('Patched missing ' + hookName);
      } else {
        // Store the real implementation if found
        hookImplementations[hookName] = React[hookName];
      }
    });
    
    return React;
  };
  
  // Store the patch function globally
  window.__PATCH_REACT_HOOKS__ = patchReact;
  
  // Try to find React in common global locations
  if (window.React) {
    patchReact(window.React);
  }
  
  // Custom handler for vendor-*.js bundles
  window.__HANDLE_VENDOR_BUNDLE__ = function(bundle) {
    console.log('Handling vendor bundle:', bundle);
    
    // Look for React-like objects in the bundle
    for (var key in bundle) {
      if (bundle.hasOwnProperty(key)) {
        var obj = bundle[key];
        
        // Check if this looks like React (has createElement)
        if (obj && typeof obj === 'object' && typeof obj.createElement === 'function') {
          console.log('Found React-like object in vendor bundle:', key);
          patchReact(obj);
        }
        
        // Also check for hooks directly
        if (obj && typeof obj === 'object' && typeof obj.useState === 'function') {
          console.log('Found hooks in vendor bundle:', key);
          hooks.forEach(function(hookName) {
            if (!obj[hookName] && hookImplementations[hookName]) {
              obj[hookName] = hookImplementations[hookName];
              console.log('Patched missing ' + hookName + ' in vendor object');
            }
          });
        }
      }
    }
  };
  
  console.log('React hook patch initialized');
})(); 