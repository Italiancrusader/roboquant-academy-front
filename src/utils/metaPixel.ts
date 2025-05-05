
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
export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) {
    console.error('Meta Pixel fbq function not found');
    return;
  }
  
  console.log(`Tracking custom event: ${eventName}`, params);
  window.fbq('track', eventName, params);
};

// Track purchase event
export const trackPurchase = (value: number, currency: string = 'USD'): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eventParams = { value, currency };
  console.log('Tracking Purchase event', eventParams);
  window.fbq('track', 'Purchase', eventParams);
};

// Track initiate checkout
export const trackInitiateCheckout = (value: number, currency: string = 'USD'): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eventParams = { value, currency };
  console.log('Tracking InitiateCheckout event', eventParams);
  window.fbq('track', 'InitiateCheckout', eventParams);
};

// Track Lead event 
export const trackLead = (value?: number, currency: string = 'USD'): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eventParams = value ? { value, currency } : undefined;
  console.log('Tracking Lead event', eventParams || {});
  window.fbq('track', 'Lead', eventParams);
};

// Track ViewContent event
export const trackViewContent = (
  contentName: string, 
  contentCategory?: string, 
  value?: number
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const customData = {
    content_name: contentName,
    content_category: contentCategory,
    value: value
  };
  
  console.log('Tracking ViewContent event', customData);
  window.fbq('track', 'ViewContent', customData);
};

// Track Complete Registration event
export const trackCompleteRegistration = (
  customData?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking CompleteRegistration event', customData || {});
  window.fbq('track', 'CompleteRegistration', customData);
};

// Track Contact event
export const trackContact = (
  customData?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking Contact event', customData || {});
  window.fbq('track', 'Contact', customData);
};
