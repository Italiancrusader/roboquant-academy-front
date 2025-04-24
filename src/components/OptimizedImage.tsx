
import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  style = {},
  onLoad,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Reset states when src changes
    setLoaded(false);
    setError(false);
  }, [src]);
  
  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };
  
  const handleLoad = () => {
    console.log('Image loaded:', src);
    setLoaded(true);
    if (onLoad) onLoad();
  };
  
  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };
  
  // Check if the image is an SVG
  const isSvg = src.toLowerCase().endsWith('.svg') || src.includes('image/svg+xml');
  
  // Placeholder dimensions
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: '#1A1F2C',
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : style.height as string || 'auto',
    display: loaded ? 'none' : 'block',
  };
  
  return (
    <div className="relative inline-block" style={{ width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto' }}>
      {!loaded && !error && (
        <div className="absolute inset-0" style={placeholderStyle}></div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`${className} ${isSvg ? 'w-full h-full' : ''}`}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
        style={imageStyle}
      />
    </div>
  );
};

export default OptimizedImage;
