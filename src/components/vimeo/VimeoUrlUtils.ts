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
  
  // Try to extract hash from URLs like vimeo.com/123456789/abcdefgh
  const privateHashMatch = videoUrl.match(/\/(\d+)\/([a-zA-Z0-9]+)/);
  if (privateHashMatch && privateHashMatch[2]) {
    return privateHashMatch[2];
  }
  
  // Try to match the hash pattern in the URL
  const matchHash = videoUrl.match(/\/([a-zA-Z0-9]+)(?:[?#]|$)/);
  if (matchHash && matchHash[1] && !videoUrl.includes(`/${matchHash[1]}/`)) {
    return matchHash[1];
  }
  
  // If there's a direct hash in the URL
  const hashMatch = videoUrl.match(/\/video\/\d+\/([a-zA-Z0-9]+)/);
  if (hashMatch && hashMatch[1]) {
    return hashMatch[1];
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
  
  // Add the hash/private token if available
  if (vimeoHash) {
    src += `/${vimeoHash}`;
  }
  
  // Add query parameters - using the working configuration from VimeoDemo
  const params = new URLSearchParams();
  params.append('title', '0');
  params.append('byline', '0');
  params.append('portrait', '0');
  params.append('autoplay', autoplay ? '1' : '0');
  params.append('dnt', dnt ? '1' : '0');
  params.append('controls', controls ? '1' : '0');
  params.append('transparent', transparent ? '1' : '0');
  params.append('app_id', '58479');  // Match the app_id from working demo
  params.append('player_id', `player${vimeoId}`);
  params.append('badge', '0');
  params.append('autopause', '0'); // Added from working example
  
  // Add timestamp to bust cache on retries
  if (retryCount > 0) {
    params.append('_t', Date.now().toString());
  }
  
  // Add special parameters for admins to bypass privacy restrictions
  if (isAdmin) {
    // Force remove background restriction for admins
    params.append('background', '1'); 
    params.append('muted', '0');
  }
  
  return `${src}?${params.toString()}`;
};
