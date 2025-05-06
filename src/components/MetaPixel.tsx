
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView as trackMetaPixelPageView } from '../utils/metaPixel';

export const MetaPixel = () => {
  const location = useLocation();

  useEffect(() => {
    // Track Meta Pixel page view when the location changes
    trackMetaPixelPageView();
  }, [location]);

  // This component doesn't render anything - it just handles Meta Pixel tracking
  return null;
};
