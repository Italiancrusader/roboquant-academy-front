
/**
 * Performance utility functions
 */

/**
 * Preconnect to specified domains to improve loading performance
 * @param domains Array of domains to preconnect to
 * @returns Cleanup function to remove preconnect links
 */
export const preconnectToDomains = (domains: string[]): (() => void) => {
  const links = domains.map(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    return link;
  });
  
  return () => {
    links.forEach(link => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
  };
};

/**
 * Prefetch specified resources
 * @param resources Array of URLs to prefetch
 * @returns Cleanup function to remove prefetch links
 */
export const prefetchResources = (resources: Array<{url: string, as: string}>): (() => void) => {
  const links = resources.map(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource.url;
    if (resource.as) {
      link.setAttribute('as', resource.as);
    }
    document.head.appendChild(link);
    return link;
  });
  
  return () => {
    links.forEach(link => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
  };
};
