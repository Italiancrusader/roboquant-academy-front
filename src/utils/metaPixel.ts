
/**
 * Facebook Pixel utility functions for tracking events
 */

// Initialize Facebook Pixel
export const initFacebookPixel = (pixelId: string): void => {
  if (typeof window === 'undefined') return;
  
  // Check if script already exists
  if (!window.fbq) {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    window.fbq = function() {
      // @ts-ignore
      window._fbq.push(arguments);
    };
    // @ts-ignore
    window._fbq = window._fbq || [];

    window.fbq('init', pixelId);
  }
};

// Track a page view event
export const trackPageView = (): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'PageView');
};

// Track a custom event
export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', eventName, params);
};

// Track purchase event
export const trackPurchase = (value: number, currency: string = 'USD'): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'Purchase', { value, currency });
};

// Track initiate checkout
export const trackInitiateCheckout = (value: number, currency: string = 'USD'): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'InitiateCheckout', { value, currency });
};

// Track Lead event 
export const trackLead = (value?: number, currency: string = 'USD'): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'Lead', value ? { value, currency } : undefined);
};

// Track ViewContent event
export const trackViewContent = (contentName: string, contentCategory?: string, value?: number): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
    value: value
  });
};
