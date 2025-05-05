
/**
 * Facebook Pixel utility functions for tracking events
 */

import { supabase } from '@/integrations/supabase/client';

// Define the fbq function type for TypeScript
declare global {
  interface Window {
    fbq: (command: string, eventName: string, params?: any) => void;
    _fbq: any;
  }
}

// Initialize Facebook Pixel
export const initFacebookPixel = (pixelId: string): void => {
  if (typeof window === 'undefined') return;
  
  // No need to add script as it's already in index.html
  console.log(`Meta Pixel initialized with ID: ${pixelId}`);
};

// Track a page view event
export const trackPageView = (): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log('Tracking PageView event');
  window.fbq('track', 'PageView');
};

// Track a custom event
export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  console.log(`Tracking custom event: ${eventName}`, params);
  window.fbq('track', eventName, params);
};

// Track purchase event
export const trackPurchase = (value: number, currency: string = 'USD', userData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eventParams = { value, currency };
  
  // Track on client side
  console.log('Tracking Purchase event', eventParams);
  window.fbq('track', 'Purchase', eventParams);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('Purchase', userData, eventParams);
};

// Track initiate checkout
export const trackInitiateCheckout = (value: number, currency: string = 'USD', userData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eventParams = { value, currency };
  
  // Track on client side
  console.log('Tracking InitiateCheckout event', eventParams);
  window.fbq('track', 'InitiateCheckout', eventParams);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('InitiateCheckout', userData, eventParams);
};

// Track Lead event 
export const trackLead = (value?: number, currency: string = 'USD', userData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eventParams = value ? { value, currency } : undefined;
  
  // Track on client side
  console.log('Tracking Lead event', eventParams || {});
  window.fbq('track', 'Lead', eventParams);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('Lead', userData, eventParams);
};

// Track ViewContent event
export const trackViewContent = (
  contentName: string, 
  contentCategory?: string, 
  value?: number,
  userData?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const customData = {
    content_name: contentName,
    content_category: contentCategory,
    value: value
  };
  
  // Track on client side
  console.log('Tracking ViewContent event', customData);
  window.fbq('track', 'ViewContent', customData);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('ViewContent', userData, customData);
};

// Track Complete Registration event
export const trackCompleteRegistration = (
  userData?: Record<string, any>,
  customData?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  // Track on client side
  console.log('Tracking CompleteRegistration event', customData || {});
  window.fbq('track', 'CompleteRegistration', customData);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('CompleteRegistration', userData, customData);
};

// Track Contact event
export const trackContact = (
  userData?: Record<string, any>,
  customData?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  // Track on client side
  console.log('Tracking Contact event', customData || {});
  window.fbq('track', 'Contact', customData);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('Contact', userData, customData);
};

// Track Add Payment Info event
export const trackAddPaymentInfo = (
  userData?: Record<string, any>,
  customData?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  // Track on client side
  console.log('Tracking AddPaymentInfo event', customData || {});
  window.fbq('track', 'AddPaymentInfo', customData);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('AddPaymentInfo', userData, customData);
};

// Track Submit Application event
export const trackSubmitApplication = (
  userData?: Record<string, any>,
  customData?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  // Track on client side
  console.log('Tracking SubmitApplication event', customData || {});
  window.fbq('track', 'SubmitApplication', customData);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('SubmitApplication', userData, customData);
};

// Helper function to track events via the server-side Conversion API
export const trackServerEvent = async (
  eventName: string,
  userData?: Record<string, any>,
  customData?: Record<string, any>
): Promise<void> => {
  try {
    // Collect basic browser information
    const baseUserData = {
      clientUserAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ...userData
    };
    
    // Only proceed if we have any user data to send
    if (Object.keys(baseUserData).length > 0) {
      console.log(`Sending ${eventName} event to Meta Conversion API via Edge Function`);
      
      const { error } = await supabase.functions.invoke('meta-conversion-track', {
        body: {
          eventName,
          userData: baseUserData,
          customData,
          eventSourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          eventTime: Math.floor(Date.now() / 1000)
        },
      });
      
      if (error) {
        console.error('Error tracking server event:', error);
      }
    }
  } catch (error) {
    console.error('Failed to track server event:', error);
  }
};
