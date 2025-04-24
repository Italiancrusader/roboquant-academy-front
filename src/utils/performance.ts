
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
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
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
