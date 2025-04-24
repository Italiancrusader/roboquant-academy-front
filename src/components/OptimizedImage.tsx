
import React, { useState } from 'react';

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
  const [loaded, setLoaded] = useState(priority); // Start as loaded if priority
  const [error, setError] = useState(false);
  
  const handleLoad = () => {
    console.log('Image loaded:', src);
    setLoaded(true);
    if (onLoad) onLoad();
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image: ${src}`, e);
    setError(true);
  };
  
  // Only show placeholder if not priority and not loaded yet
  const showPlaceholder = !priority && !loaded && !error;
  
  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: loaded || priority ? 1 : 0, // Show immediately if priority
  };
  
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: '#1A1F2C',
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : style.height as string || 'auto',
    display: showPlaceholder ? 'block' : 'none',
  };
  
  return (
    <div className="relative inline-block w-full h-full flex items-center justify-center" style={{ maxWidth: width ? `${width}px` : 'auto' }}>
      {showPlaceholder && (
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
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
