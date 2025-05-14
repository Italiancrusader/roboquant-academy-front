/**
 * Utility functions for handling Vimeo video URLs and IDs
 */

/**
 * Resolves a Vimeo video ID from either a direct ID or a URL
 * @param videoId Optional direct video ID
 * @param videoUrl Optional Vimeo video URL
 * @returns The resolved Vimeo ID or null if neither is valid
 */
export const resolveVimeoId = (videoId?: string, videoUrl?: string): string | null => {
  // If videoId is directly provided, use it
  if (videoId) return videoId;
  
  // Otherwise try to extract from URL
  if (videoUrl) {
    // Handle URLs with hash parameters
    const urlWithoutQuery = videoUrl.split('?')[0];
    const urlWithoutHash = urlWithoutQuery.split('#')[0];
    
    // Match different Vimeo URL patterns
    const patterns = [
      /vimeo\.com\/(\d+)/, // Standard URL
      /vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/, // Private URL with hash
      /player\.vimeo\.com\/video\/(\d+)/ // Player embed URL
    ];
    
    for (const pattern of patterns) {
      const match = urlWithoutHash.match(pattern);
      if (match) return match[1];
    }
  }
  
  return null;
};

/**
 * Extracts the hash (private video token) from a Vimeo URL if present
 * @param videoUrl The Vimeo video URL
 * @returns The hash/token or null if not found
 */
export const getVimeoHash = (videoUrl?: string): string | null => {
  if (!videoUrl) return null;
  
  // Check for hash in format like vimeo.com/123456789/abcdef123
  const privateHashMatch = videoUrl.match(/\/(\d+)\/([a-zA-Z0-9]+)/);
  if (privateHashMatch && privateHashMatch[2]) {
    return privateHashMatch[2];
  }
  
  // Check for h=abcdef123 parameter in the URL
  const hParamMatch = videoUrl.match(/[?&]h=([a-zA-Z0-9]+)/);
  if (hParamMatch && hParamMatch[1]) {
    return hParamMatch[1];
  }
  
  return null;
};

/**
 * Builds the complete Vimeo player embed URL with all necessary parameters
 */
export const buildVimeoSrcUrl = ({
  vimeoId,
  vimeoHash,
  autoplay = false,
  dnt = true,
  controls = true,
  transparent = true,
  retryCount = 0,
  isAdmin = false
}: {
  vimeoId: string;
  vimeoHash: string | null;
  autoplay?: boolean;
  dnt?: boolean;
  controls?: boolean;
  transparent?: boolean;
  retryCount?: number;
  isAdmin?: boolean;
}): string => {
  let src = `https://player.vimeo.com/video/${vimeoId}`;
  
  // Add the hash parameter either as part of the path or as h= query parameter
  if (vimeoHash) {
    if (vimeoHash !== vimeoId) {
      // According to the embed code format, use h= parameter
      const params = new URLSearchParams();
      params.append('h', vimeoHash);
      params.append('title', '0');
      params.append('byline', '0');
      params.append('portrait', '0');
      params.append('badge', '0');
      params.append('autopause', '0');
      params.append('player_id', '0');
      params.append('app_id', '58479');
      
      // Add timestamp to bust cache on retries
      if (retryCount > 0) {
        params.append('_t', Date.now().toString());
      }
      
      // Add special parameters for admins to bypass privacy restrictions
      if (isAdmin) {
        params.append('background', '1');
        params.append('muted', '0');
      }
      
      return `${src}?${params.toString()}`;
    }
  }
  
  // Fallback to standard parameters without hash
  const params = new URLSearchParams();
  params.append('title', '0');
  params.append('byline', '0');
  params.append('portrait', '0');
  params.append('badge', '0');
  params.append('autopause', '0');
  params.append('player_id', '0');
  params.append('app_id', '58479');
  
  // Add timestamp to bust cache on retries
  if (retryCount > 0) {
    params.append('_t', Date.now().toString());
  }
  
  // Add special parameters for admins to bypass privacy restrictions
  if (isAdmin) {
    params.append('background', '1');
    params.append('muted', '0');
  }
  
  return `${src}?${params.toString()}`;
};
