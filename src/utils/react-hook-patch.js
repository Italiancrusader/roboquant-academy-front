/**
 * This file creates a runtime patch to handle the "Cannot read properties of undefined (reading 'useLayoutEffect')" error
 * by directly patching React or third-party libraries at runtime.
 */

// Get the original React hooks from our ensured React singleton
import { React } from './ensure-react';

// This function safely patches any React-like object that might be missing hooks
export function patchReactHooks(target) {
  if (!target) return;

  // List of hooks to patch
  const hooksToEnsure = [
    'useState',
    'useEffect',
    'useLayoutEffect',
    'useRef',
    'useCallback',
    'useMemo',
    'useContext',
    'useReducer',
    'useImperativeHandle',
    'useDebugValue',
    'useDeferredValue',
    'useTransition',
    'useId',
    'useSyncExternalStore',
    'useInsertionEffect'
  ];

  // Apply each hook from our singleton React if the target is missing it
  hooksToEnsure.forEach(hook => {
    if (!target[hook] && React[hook]) {
      console.log(`Patching missing hook: ${hook}`);
      target[hook] = React[hook];
    }
  });

  return target;
}

// Patch window.React if it exists but is different from our singleton
if (window.React && window.React !== React) {
  console.log('Patching window.React with singleton hooks');
  patchReactHooks(window.React);
}

// Try to locate any other React instances in the global scope or modules
setTimeout(() => {
  // This runs after initial render to catch any late-loaded React instances
  if (window.React && window.React !== React) {
    console.log('Late patching window.React');
    patchReactHooks(window.React);
  }
  
  // Some libraries store React in their namespace
  if (window.__PREACT__ && window.__PREACT__ !== React) {
    patchReactHooks(window.__PREACT__);
  }
}, 0);

// Export the patching function for manual use
export default patchReactHooks; 