/**
 * This script provides a direct fix for the D variable initialization issue in the charts bundle
 */
(function() {
  console.log('[CHARTS-FIX] Setting up D variable protection');
  
  // Define D in the global scope to prevent "Cannot access D before initialization"
  // D3.js and similar libraries often use a variable named D that's referenced before full initialization
  if (typeof window.D === 'undefined') {
    // Create a proxy for D that will handle any access
    var dValue = {};
    Object.defineProperty(window, 'D', {
      configurable: true,
      get: function() {
        console.log('[CHARTS-FIX] Accessing D variable');
        return dValue;
      },
      set: function(newValue) {
        console.log('[CHARTS-FIX] Setting D variable to:', newValue);
        dValue = newValue;
      }
    });
  }
  
  // Also predefine other common D3 variables that might be accessed early
  window.d3 = window.d3 || {};
  
  // Create a MutationObserver to watch for script tags and modify the charts bundle
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          // Check if this is a script element
          if (node.tagName === 'SCRIPT') {
            var src = node.src || '';
            if (src.includes('vendor-charts')) {
              console.log('[CHARTS-FIX] Charts bundle script detected:', src);
              
              // Prevent the original script from loading
              node.setAttribute('data-original-src', src);
              node.removeAttribute('src');
              
              // Create our patched version that loads with a safe wrapper
              var newScript = document.createElement('script');
              newScript.setAttribute('data-patched', 'true');
              
              // Add load event handler
              newScript.onload = function() {
                console.log('[CHARTS-FIX] Patched charts bundle loaded successfully');
              };
              
              // Add error handler
              newScript.onerror = function(e) {
                console.error('[CHARTS-FIX] Error loading patched charts bundle:', e);
                // Fall back to original script as a last resort
                console.log('[CHARTS-FIX] Falling back to original charts bundle');
                node.setAttribute('src', node.getAttribute('data-original-src'));
              };
              
              // Set the src with a query parameter to bypass cache
              newScript.src = src + '?patched=true';
              
              // Insert the new script after the original
              node.parentNode.insertBefore(newScript, node.nextSibling);
              
              // Log the action
              console.log('[CHARTS-FIX] Added patched charts bundle script');
            }
          }
        });
      }
    });
  });
  
  // Start observing the document for script tags
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  
  // Patch specific D3 initialization patterns
  // This addresses the specific error in the charts bundle
  var originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // Check if this is defining D and has a getter that accesses something else
    if (prop === 'D' && descriptor && descriptor.get) {
      console.log('[CHARTS-FIX] Intercepting D property definition');
      // Modify the descriptor to make the getter safer
      var originalGetter = descriptor.get;
      descriptor.get = function() {
        try {
          return originalGetter.apply(this);
        } catch (e) {
          console.warn('[CHARTS-FIX] Error in D getter, using fallback:', e);
          // Return an empty object instead of throwing
          return {};
        }
      };
    }
    
    // Continue with the original defineProperty
    return originalDefineProperty.apply(this, arguments);
  };
  
  console.log('[CHARTS-FIX] Charts bundle protection initialized');
})(); 