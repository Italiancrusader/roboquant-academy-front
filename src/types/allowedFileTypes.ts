
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
  
  return ALLOWED_IMAGE_TYPES.includes(fileType) || ALLOWED_IMAGE_TYPES.includes(fileExtension);
};
