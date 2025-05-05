
/**
 * Email utility functions for generating email content and formatting
 */

import { format } from 'date-fns';

/**
 * Format price from cents to dollars with currency symbol
 */
export const formatPrice = (priceInCents: number, currency: string = 'USD'): string => {
  const price = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM dd, yyyy');
};

/**
 * Format time to readable string
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
};

/**
 * Generate a random receipt/order number
 */
export const generateOrderNumber = (): string => {
  const prefix = 'RQA';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Convert course name to a URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};
