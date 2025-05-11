/**
 * This script directly patches React hooks in vendor bundles
 * It's loaded early in the page to ensure hooks are available before any vendor code runs
 */
(function() {
  console.log('[DEBUG] Starting React hook patching process');
  
  // Store original React hooks implementations
  var hookImplementations = {};
  
  // Enable verbose debugging
  var DEBUG = true;
  
  function debug(message, obj) {
    if (DEBUG) {
      if (obj) {
        console.log('[React-Hook-Fix] ' + message, obj);
      } else {
        console.log('[React-Hook-Fix] ' + message);
      }
    }
  }
  
  // Create emergency implementations of React hooks
  var createEmergencyHook = function(hookName) {
    return function() {
      debug('🚨 Emergency ' + hookName + ' called with args:', Array.from(arguments));
      // For useState, return a stateless state
      if (hookName === 'useState') {
        return [arguments[0], function() { 
          debug('setState from emergency useState called with:', Array.from(arguments));
        }];
      }
      
      // For useEffect and useLayoutEffect, just execute the effect function
      if (hookName === 'useEffect' || hookName === 'useLayoutEffect') {
        var fn = arguments[0];
        debug('Emergency ' + hookName + ' effect function:', fn);
        if (typeof fn === 'function') {
          try {
            debug('Executing emergency effect for ' + hookName);
            var cleanup = fn();
            // Execute cleanup immediately if it's a function
            if (typeof cleanup === 'function') {
              debug('Running cleanup for emergency ' + hookName);
              cleanup();
            }
          } catch (e) {
            console.error('[React-Hook-Fix] Error in emergency ' + hookName, e);
          }
        }
        return undefined;
      }
      
      // For useRef, return a ref-like object
      if (hookName === 'useRef') {
        debug('Creating emergency ref with initial value:', arguments[0]);
        return { current: arguments[0] };
      }
      
      // For useCallback, just return the function
      if (hookName === 'useCallback') {
        debug('Emergency useCallback wrapping function');
        return arguments[0];
      }
      
      // For useMemo, execute the function and return the result
      if (hookName === 'useMemo') {
        var memoFn = arguments[0];
        debug('Emergency useMemo with function:', memoFn);
        if (typeof memoFn === 'function') {
          try {
            var result = memoFn();
            debug('Emergency useMemo result:', result);
            return result;
          } catch (e) {
            console.error('[React-Hook-Fix] Error in emergency useMemo', e);
            return undefined;
          }
        }
        return undefined;
      }
      
      // Default fallback just returns the first argument
      debug('Default emergency hook implementation for ' + hookName);
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
    debug('Created emergency implementation for ' + hookName);
  });
  
  // Store these globally to be available to other scripts
  window.__REACT_HOOK_POLYFILLS__ = hookImplementations;
  debug('Stored emergency hook implementations in global scope');
  
  // Function to patch a React instance
  var patchReact = function(React) {
    if (!React || typeof React !== 'object') return React;
    
    debug('Patching React instance:', React);
    
    // Check if this React instance already has hooks
    var hasHooks = hooks.some(function(hookName) {
      return typeof React[hookName] === 'function';
    });
    
    debug('Does React have existing hooks?', hasHooks);
    
    // Patch all hooks
    hooks.forEach(function(hookName) {
      if (!React[hookName]) {
        try {
          debug('Attempting to patch missing ' + hookName);
          Object.defineProperty(React, hookName, {
            configurable: true, 
            writable: true,
            value: hookImplementations[hookName]
          });
          debug('Successfully patched ' + hookName);
        } catch (e) {
          console.error('[React-Hook-Fix] Failed to patch ' + hookName, e);
        }
      } else {
        // Store the real implementation if found
        debug('Found and storing real implementation of ' + hookName);
        hookImplementations[hookName] = React[hookName];
      }
    });
    
    return React;
  };
  
  // Store the patch function globally
  window.__PATCH_REACT_HOOKS__ = patchReact;
  debug('Registered global patch function');
  
  // Safety wrapper for bundle handling to prevent initialization errors
  var safelyHandleBundle = function(bundle, bundleName) {
    debug('Safely examining bundle ' + bundleName);
    // If this is the charts bundle, be extra careful not to break it
    var isChartsBundle = bundleName && bundleName.includes('charts');
    
    if (isChartsBundle) {
      debug('⚠️ Charts bundle detected - using extra caution');
      // For charts bundle, don't attempt to iterate keys - it can cause initialization errors
      // Instead, only patch if we see a direct React property
      if (bundle && bundle.React) {
        debug('Found direct React property in charts bundle');
        patchReact(bundle.React);
      }
      return;
    }
    
    // For other bundles, inspect more thoroughly
    try {
      debug('Examining bundle for React-like objects');
      // Look for React-like objects in the bundle
      for (var key in bundle) {
        if (bundle.hasOwnProperty(key)) {
          var obj = bundle[key];
          
          // Check if this looks like React (has createElement)
          if (obj && typeof obj === 'object' && typeof obj.createElement === 'function') {
            debug('Found React-like object in bundle at key: ' + key);
            patchReact(obj);
          }
          
          // Also check for hooks directly
          if (obj && typeof obj === 'object' && typeof obj.useState === 'function') {
            debug('Found hooks in bundle at key: ' + key);
            hooks.forEach(function(hookName) {
              if (!obj[hookName] && hookImplementations[hookName]) {
                obj[hookName] = hookImplementations[hookName];
                debug('Patched missing ' + hookName + ' in vendor object at key ' + key);
              }
            });
          }
        }
      }
    } catch (e) {
      console.error('[React-Hook-Fix] Error examining bundle:', e);
    }
  };
  
  // Try to find React in common global locations
  if (window.React) {
    debug('Found window.React, patching it');
    patchReact(window.React);
  }
  
  // Custom handler for vendor-*.js bundles
  window.__HANDLE_VENDOR_BUNDLE__ = function(bundle, name) {
    debug('Handling vendor bundle:', name || 'unnamed');
    safelyHandleBundle(bundle, name);
  };
  
  // Add a function to handle specific file inspection
  window.__DEBUG_FILE__ = function(filename) {
    debug('Debugging file: ' + filename);
    
    // Setup script error tracking
    window.addEventListener('error', function(e) {
      if (e && e.filename && e.filename.includes(filename)) {
        console.error('[React-Hook-Fix] Error in tracked file ' + filename + ':', e.message);
        console.error('Error details:', e);
      }
    });
    
    // Return a debugging helper object
    return {
      logHooks: function(React) {
        if (!React) return 'No React object provided';
        
        var hookStatus = {};
        hooks.forEach(function(hook) {
          hookStatus[hook] = {
            exists: typeof React[hook] === 'function',
            type: typeof React[hook]
          };
        });
        console.table(hookStatus);
        return hookStatus;
      }
    };
  };
  
  // Track the problematic vendor file specifically
  window.__DEBUG_FILE__('vendor-J2TkRXmV.js');
  
  debug('React hook patch initialization complete');
})(); 