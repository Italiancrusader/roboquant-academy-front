
/**
 * Meta Pixel utility functions for event tracking
 */

// Define types for Meta Pixel events
export type PixelEventParams = {
  value?: number;
  currency?: string;
  content_category?: string;
  content_name?: string;
  content_type?: string;
  content_ids?: string[];
  contents?: Array<{id: string, quantity: number}>;
  num_items?: number;
  [key: string]: any;
};

declare global {
  interface Window {
    fbq?: (eventType: string, eventName: string, params?: PixelEventParams) => void;
  }
}

/**
 * Track page view event
 */
export const trackPageView = (): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track ViewContent event
 */
export const trackViewContent = (params: PixelEventParams): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', params);
  }
};

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (params: PixelEventParams): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', params);
  }
};

/**
 * Track Purchase event
 */
export const trackPurchase = (params: PixelEventParams): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', params);
  }
};

/**
 * Track Lead event
 */
export const trackLead = (params: PixelEventParams = {}): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', params);
  }
};

/**
 * Track CompleteRegistration event
 */
export const trackCompleteRegistration = (params: PixelEventParams = {}): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', params);
  }
};

/**
 * Track custom event
 */
export const trackCustomEvent = (eventName: string, params: PixelEventParams = {}): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
};
