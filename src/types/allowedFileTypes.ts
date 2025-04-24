
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
    isExtensionAllowed: ALLOWED_IMAGE_TYPES.includes(fileExtension)
  });
  
  return ALLOWED_IMAGE_TYPES.includes(fileType) || ALLOWED_IMAGE_TYPES.includes(fileExtension);
};
