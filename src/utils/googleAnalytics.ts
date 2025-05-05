
/**
 * Google Analytics utility functions for event tracking
 */

// Define types for Google Analytics events
export type GtagEventParams = {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
};

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
    dataLayer?: any[];
  }
}

/**
 * Track custom event - compatible with both gtag and dataLayer
 */
export const trackEvent = (
  eventAction: string, 
  eventParams: GtagEventParams = {}
): void => {
  // Use standard gtag if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventAction, eventParams);
  }
  
  // Also push to dataLayer for GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventAction,
      ...eventParams
    });
  }
};

/**
 * Track page view - compatible with both gtag and dataLayer
 */
export const trackPageView = (
  pagePath: string,
  pageTitle: string = '',
): void => {
  // Use standard gtag if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-VRVJC2YQ2G', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
  
  // Also push to dataLayer for GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle
    });
  }
};
