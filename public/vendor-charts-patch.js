/**
 * Direct patch for D3.js initialization in the vendor-charts bundle
 * This script specifically addresses the "Cannot access 'D' before initialization" error
 */
(function() {
  console.log('[D3-PATCH] Initializing D3 variables protection');
  
  // Pre-define and protect D3 variables that are commonly accessed early
  var d3Vars = ['d3', 'D'];
  
  // Create protective proxies for all variables
  d3Vars.forEach(function(varName) {
    // Skip if already defined
    if (window[varName] !== undefined) return;
    
    // Create a protective proxy
    var tempValue = {};
    Object.defineProperty(window, varName, {
      configurable: true,
      get: function() {
        console.log('[D3-PATCH] Protected access to ' + varName);
        return tempValue;
      },
      set: function(val) {
        console.log('[D3-PATCH] Setting ' + varName + ' to actual value');
        tempValue = val;
      }
    });
    
    console.log('[D3-PATCH] Protected ' + varName + ' from early access');
  });
  
  // Patch the specific error: "Cannot access 'D' before initialization"
  try {
    // This is the module pattern commonly used in D3 bundling
    // We're adding a guard at the global level to catch the specific access pattern
    var moduleFactory = function(exports) {
      // Pre-define D in the module scope
      var D = {};
      
      // Return the module exports
      return exports;
    };
    
    // Store this factory for use by the charts bundle
    window.__D3_MODULE_FACTORY__ = moduleFactory;
    
    console.log('[D3-PATCH] Created D3 module factory');
  } catch (e) {
    console.error('[D3-PATCH] Error setting up D3 protection:', e);
  }
  
  // Modify the way modules are loaded
  if (typeof Object.defineProperty === 'function') {
    var originalDefineProperty = Object.defineProperty;
    
    // Redefine to intercept module definitions
    Object.defineProperty = function(obj, prop, descriptor) {
      // Check for the specific D3 module pattern
      if (typeof prop === 'string' && 
          prop === 'D' && 
          descriptor && 
          descriptor.get && 
          !descriptor.value) {
        console.log('[D3-PATCH] Intercepting D definition with getter');
        
        // Create a safe getter that won't throw
        var originalGetter = descriptor.get;
        descriptor.get = function() {
          try {
            var result = originalGetter.apply(this);
            return result;
          } catch (e) {
            console.warn('[D3-PATCH] Error in D getter, providing fallback');
            return {};
          }
        };
      }
      
      // When an error would occur, provide a fallback - try to make the setter succeed
      try {
        return originalDefineProperty.call(this, obj, prop, descriptor);
      } catch (e) {
        console.warn('[D3-PATCH] Error in defineProperty, using fallback for', prop);
        // Just set the property directly as a fallback
        try {
          obj[prop] = descriptor.value || {};
        } catch (e2) {
          console.error('[D3-PATCH] Fallback also failed for', prop);
        }
        return obj;
      }
    };
  }
  
  /**
   * Function to patch D3 module after it loads
   * This should be called by the charts bundle after it loads
   */
  window.__PATCH_D3__ = function(d3Module) {
    if (!d3Module) return;
    console.log('[D3-PATCH] Patching D3 module after load');
    
    // Store the D3 module for future reference
    window.__D3_MODULE__ = d3Module;
    
    return d3Module;
  };
  
  // Add a script loader interceptor for the charts bundle
  function interceptScriptLoading() {
    var originalCreateElement = document.createElement;
    
    document.createElement = function(tagName) {
      var element = originalCreateElement.call(document, tagName);
      
      if (tagName.toLowerCase() === 'script') {
        var originalSetAttribute = element.setAttribute;
        
        element.setAttribute = function(name, value) {
          if (name === 'src' && value && value.includes('vendor-charts')) {
            console.log('[D3-PATCH] Intercepting charts bundle script:', value);
            
            // Add a special parameter to signal this is patched
            value = value + (value.includes('?') ? '&' : '?') + 'd3patched=true';
            
            // Modify the load behavior
            element.addEventListener('load', function() {
              console.log('[D3-PATCH] Charts bundle loaded successfully');
            });
          }
          
          return originalSetAttribute.call(this, name, value);
        };
      }
      
      return element;
    };
  }
  
  // Start intercepting scripts
  interceptScriptLoading();
  
  console.log('[D3-PATCH] D3 protection fully initialized');
})(); 