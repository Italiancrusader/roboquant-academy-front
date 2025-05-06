
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView as trackGAPageView } from '../utils/googleAnalytics';

export const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when the location changes
    trackGAPageView(location.pathname, document.title);
  }, [location]);

  // This component doesn't render anything - it just handles analytics
  return null;
};
