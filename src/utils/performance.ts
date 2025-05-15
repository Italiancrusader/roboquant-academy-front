
/**
 * Creates preconnect links for specified domains to improve loading performance
 * 
 * @param domains Array of domains to preconnect to
 * @returns Cleanup function to remove the created link elements
 */
export function preconnectToDomains(domains: string[]): () => void {
  const createdLinks: HTMLLinkElement[] = [];

  domains.forEach(domain => {
    // Create preconnect link
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = domain;
    preconnectLink.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectLink);
    createdLinks.push(preconnectLink);

    // Create DNS-prefetch as fallback
    const dnsPrefetchLink = document.createElement('link');
    dnsPrefetchLink.rel = 'dns-prefetch';
    dnsPrefetchLink.href = domain;
    document.head.appendChild(dnsPrefetchLink);
    createdLinks.push(dnsPrefetchLink);
  });

  // Return cleanup function to remove all created links when done
  return () => {
    createdLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
  };
}

/**
 * Properly preloads images with correct 'as' attribute
 * 
 * @param imageUrls Array of image URLs to preload
 * @param highPriority Whether these images should be high priority
 * @returns Cleanup function to remove the created link elements
 */
export function preloadImages(imageUrls: string[], highPriority: boolean = false): () => void {
  const createdLinks: HTMLLinkElement[] = [];

  imageUrls.forEach(url => {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = url;
    preloadLink.as = 'image'; // Explicitly set as 'image' to avoid browser warnings
    
    if (highPriority) {
      preloadLink.setAttribute('fetchpriority', 'high');
    }
    
    document.head.appendChild(preloadLink);
    createdLinks.push(preloadLink);
  });

  // Return cleanup function
  return () => {
    createdLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
  };
}
