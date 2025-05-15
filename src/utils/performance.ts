
/**
 * Establishes early connections to domains for performance optimization
 * 
 * @param domains Array of domains to preconnect to
 * @returns Cleanup function to remove the preconnect links
 */
export const preconnectToDomains = (domains: string[]): () => void => {
  const addedLinks: HTMLLinkElement[] = [];

  domains.forEach(domain => {
    try {
      // Check if preconnect already exists
      const existingLink = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (existingLink) {
        return; // Skip if already exists
      }

      // Create preconnect link
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      addedLinks.push(link);
      
      // Add DNS-prefetch as fallback
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = domain;
      document.head.appendChild(dnsLink);
      addedLinks.push(dnsLink);
    } catch (error) {
      console.error(`Error adding preconnect for ${domain}:`, error);
    }
  });

  // Return cleanup function
  return () => {
    addedLinks.forEach(link => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
  };
};
