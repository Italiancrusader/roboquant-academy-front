
/**
 * Utility functions for performance optimization
 */

/**
 * Preconnect to external domains to speed up resource fetching
 * @param domains Array of domains to preconnect to
 */
export const preconnectToDomains = (domains: string[]): (() => void) => {
  const preconnectLinks: HTMLLinkElement[] = [];
  
  domains.forEach(domain => {
    if (document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
      return; // Skip if already exists
    }
    
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
 * Preload critical resources
 * @param urls Array of URLs to preload
 * @param type Resource type (image, font, etc.)
 */
export const preloadResources = (urls: string[], type: 'image' | 'font' | 'style' | 'script'): (() => void) => {
  const preloadLinks: HTMLLinkElement[] = [];
  
  urls.forEach(url => {
    if (document.querySelector(`link[rel="preload"][href="${url}"]`)) {
      return; // Skip if already exists
    }
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.setAttribute('fetchpriority', 'high');
    
    if (type === 'image') {
      link.as = 'image';
    } else if (type === 'font') {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (type === 'style') {
      link.as = 'style';
    } else if (type === 'script') {
      link.as = 'script';
    }
    
    document.head.appendChild(link);
    preloadLinks.push(link);
  });
  
  // Return cleanup function
  return () => {
    preloadLinks.forEach(link => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
  };
};

/**
 * Load a script asynchronously
 * @param src Script source URL
 * @param id Optional ID for the script tag
 */
export const loadScriptAsync = (src: string, id?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (id) script.id = id;
    
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    
    document.body.appendChild(script);
  });
};
