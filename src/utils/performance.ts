
/**
 * Utility functions for performance optimization
 */

/**
 * Preconnect to external domains to speed up resource fetching
 * @param domains Array of domains to preconnect to
 */
export const preconnectToDomains = (domains: string[]): (() => void) => {
  // Skip if no domains are provided
  if (!domains || domains.length === 0) return () => {};
  
  const preconnectLinks: HTMLLinkElement[] = [];
  
  domains.forEach(domain => {
    if (!domain) return; // Skip empty domains
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    preconnectLinks.push(link);
  });
  
  // Return cleanup function
  return () => {
    preconnectLinks.forEach(link => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
  };
};

/**
 * Preload critical resources - only use for resources that will definitely be used immediately
 * @param urls Array of URLs to preload
 * @param type Resource type (image, font, etc.)
 * @param timeoutMs Time in ms to automatically clean up preload links if unused (default: 10000ms)
 */
export const preloadResources = (
  urls: string[], 
  type: 'image' | 'font' | 'style' | 'script',
  timeoutMs: number = 10000
): (() => void) => {
  // Skip preloading if no URLs are provided to avoid warnings
  if (!urls || urls.length === 0) return () => {};
  
  // Filter out empty URLs
  const validUrls = urls.filter(url => url && url.trim() !== '');
  if (validUrls.length === 0) return () => {};
  
  const preloadLinks: HTMLLinkElement[] = [];
  
  validUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    // Set appropriate 'as' attribute based on type
    switch(type) {
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'script':
        link.as = 'script';
        break;
    }
    
    document.head.appendChild(link);
    preloadLinks.push(link);
  });
  
  // Set a timeout to automatically clean up preload links if they haven't been used
  const timeoutId = setTimeout(() => {
    preloadLinks.forEach(link => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
  }, timeoutMs);
  
  // Return cleanup function that removes preload links when they're no longer needed
  return () => {
    clearTimeout(timeoutId);
    preloadLinks.forEach(link => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
  };
};
