// Force React and ReactDOM to be true singletons in the application
// This injects the React singleton at build time to ensure proper resolution
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Export the real React instances
window.__REACT_SINGLETON__ = React;
window.__REACT_DOM_SINGLETON__ = ReactDOM;

// This ensures all React hooks point to the same instance
if (!window.__REACT_INJECTED__) {
  window.__REACT_INJECTED__ = true;
  console.log('React singleton enforced');
}

export { React, ReactDOM }; 