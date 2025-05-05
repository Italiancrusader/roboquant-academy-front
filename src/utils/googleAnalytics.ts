
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
 * Track custom event
 */
export const trackEvent = (
  eventAction: string, 
  eventParams: GtagEventParams = {}
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventAction, eventParams);
  }
};

/**
 * Track page view
 */
export const trackPageView = (
  pagePath: string,
  pageTitle: string = '',
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-VRVJC2YQ2G', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
};
