
/**
 * Facebook Pixel utility functions for tracking events
 */

import { supabase } from '@/integrations/supabase/client';

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
export const trackPurchase = (value: number, currency: string = 'USD', userData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  // Track on client side
  window.fbq('track', 'Purchase', { value, currency });
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('Purchase', userData, { 
    currency, 
    value: value.toString() 
  });
};

// Track initiate checkout
export const trackInitiateCheckout = (value: number, currency: string = 'USD', userData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  // Track on client side
  window.fbq('track', 'InitiateCheckout', { value, currency });
  
  // Also track via server-side API for redundancy if we have userData
  trackServerEvent('InitiateCheckout', userData, { 
    currency, 
    value: value.toString() 
  });
};

// Track Lead event 
export const trackLead = (value?: number, currency: string = 'USD', userData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  // Track on client side
  window.fbq('track', 'Lead', value ? { value, currency } : undefined);
  
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
      ...userData
    };
    
    // Only proceed if we have any user data to send
    if (Object.keys(baseUserData).length > 0) {
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
