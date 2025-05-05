
/**
 * Facebook Pixel utility functions for tracking events
 */

import { supabase } from '@/integrations/supabase/client';

// Initialize Facebook Pixel
export const initFacebookPixel = (pixelId: string): void => {
  if (typeof window === 'undefined') return;
  
  // Add Facebook Pixel base code
  // This follows the official Meta Pixel implementation guide
  !function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  
  // Initialize with pixel ID
  fbq('init', pixelId);
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
  console.log('Tracking Purchase event', eventParams);
  
  // Track on client side
  window.fbq('track', 'Purchase', eventParams);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('Purchase', userData, { 
    currency, 
    value: value.toString() 
  });
};

// Track initiate checkout
export const trackInitiateCheckout = (value: number, currency: string = 'USD', userData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eventParams = { value, currency };
  console.log('Tracking InitiateCheckout event', eventParams);
  
  // Track on client side
  window.fbq('track', 'InitiateCheckout', eventParams);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('InitiateCheckout', userData, { 
    currency, 
    value: value.toString() 
  });
};

// Track Lead event 
export const trackLead = (value?: number, currency: string = 'USD', userData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eventParams = value ? { value, currency } : undefined;
  console.log('Tracking Lead event', eventParams);
  
  // Track on client side
  window.fbq('track', 'Lead', eventParams);
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('Lead', userData, value ? { 
    currency, 
    value: value.toString() 
  } : undefined);
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
  
  console.log('Tracking ViewContent event', customData);
  
  // Track on client side
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
  
  console.log('Tracking CompleteRegistration event', customData);
  
  // Track on client side
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
  
  console.log('Tracking Contact event', customData);
  
  // Track on client side
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
  
  console.log('Tracking AddPaymentInfo event', customData);
  
  // Track on client side
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
  
  console.log('Tracking SubmitApplication event', customData);
  
  // Track on client side
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
      clientIpAddress: null, // We'll get this server-side
      ...userData
    };
    
    // Only proceed if we have any user data to send
    if (Object.keys(baseUserData).length > 0) {
      console.log(`Sending ${eventName} event to server-side API`, { userData: baseUserData, customData });
      
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

// TypeScript declaration for fbq
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}
