
/**
 * Facebook Pixel utility functions for tracking events
 */

// Define the fbq function type for TypeScript
declare global {
  interface Window {
    fbq: (command: string, eventName: string, params?: any) => void;
    _fbq: any;
  }
}

type PixelEventParams = Record<string, any>;

// Track a page view event
export const trackPageView = (): void => {
  if (typeof window === 'undefined') return;
  
  if (!window.fbq) {
    console.error('Meta Pixel fbq function not found');
    return;
  }
  
  console.log('Tracking PageView event');
  window.fbq('track', 'PageView');
};

// Track a custom event
export const trackEvent = (eventName: string, params?: PixelEventParams): void => {
  if (typeof window === 'undefined' || !window.fbq) {
    console.error('Meta Pixel fbq function not found');
    return;
  }
  
  console.log(`Tracking custom event: ${eventName}`, params);
  window.fbq('track', eventName, params);
};

// Track purchase event
export const trackPurchase = (params: PixelEventParams): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking Purchase event', params);
  window.fbq('track', 'Purchase', params);
};

// Track initiate checkout
export const trackInitiateCheckout = (params: PixelEventParams): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking InitiateCheckout event', params);
  window.fbq('track', 'InitiateCheckout', params);
};

// Track Lead event 
export const trackLead = (params?: PixelEventParams): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking Lead event', params || {});
  window.fbq('track', 'Lead', params);
};

// Track ViewContent event
export const trackViewContent = (params: PixelEventParams): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking ViewContent event', params);
  window.fbq('track', 'ViewContent', params);
};

// Track Complete Registration event
export const trackCompleteRegistration = (params?: PixelEventParams): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking CompleteRegistration event', params || {});
  window.fbq('track', 'CompleteRegistration', params);
};

// Track Contact event
export const trackContact = (params?: PixelEventParams): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking Contact event', params || {});
  window.fbq('track', 'Contact', params);
};
