
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  '.jpg',
  '.jpeg',
  'image/png',
  '.png',
  'image/webp',
  '.webp',
  'image/svg+xml',
  '.svg'
];

// Function to check if a file is an allowed image type
export const isAllowedImageType = (file: File): boolean => {
  const fileType = file.type;
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  
  // Enhanced debug logging to help diagnose upload issues
  console.log('File type check:', { 
    name: file.name,
    type: fileType, 
    extension: fileExtension,
    isTypeAllowed: ALLOWED_IMAGE_TYPES.includes(fileType), 
    isExtensionAllowed: ALLOWED_IMAGE_TYPES.includes(fileExtension),
    allowedTypes: ALLOWED_IMAGE_TYPES
  });
  
  // Special handling for SVG files
  if (fileType === 'image/svg+xml' || fileExtension === '.svg') {
    console.log('SVG file detected:', file.name);
    return true;
  }
  
  return ALLOWED_IMAGE_TYPES.includes(fileType) || ALLOWED_IMAGE_TYPES.includes(fileExtension);
};
