
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
    setLoaded(false);
    setError(false);
    
    if (priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setLoaded(true);
        if (onLoad) onLoad();
      };
      img.onerror = () => setError(true);
    }
  }, [src, priority, onLoad]);
  
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
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image: ${src}`, e);
    setError(true);
  };
  
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: '#1A1F2C',
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : style.height as string || 'auto',
    display: loaded ? 'none' : 'block',
  };
  
  return (
    <div className="relative inline-block w-full h-full flex items-center justify-center" style={{ maxWidth: width ? `${width}px` : 'auto' }}>
      {!loaded && !error && (
        <div className="absolute inset-0" style={placeholderStyle}></div>
      )}
      
      {error ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-800 rounded" style={{ minHeight: '100px' }}>
          <p className="text-sm text-gray-400">Image not available</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
          style={imageStyle}
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
