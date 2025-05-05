
/**
 * Utility functions for tracking user cart activity and abandoned carts
 */

import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  courseId: string;
  timestamp: number;
}

/**
 * Save cart data to local storage and optionally to the database
 */
export const saveCartData = async (userId: string | undefined, courseId: string): Promise<void> => {
  const timestamp = Date.now();
  const cartId = `cart_${timestamp}`;
  
  // Save to local storage regardless of login status
  localStorage.setItem('rqa_cart', JSON.stringify({
    cartId,
    courseId,
    timestamp,
    userId
  }));
  
  // If user is logged in, save to database for abandoned cart tracking
  if (userId) {
    try {
      // Store cart info in user metadata for abandoned cart processing
      const { error } = await supabase.functions.invoke('track-cart', {
        body: { 
          userId, 
          courseId, 
          cartId, 
          timestamp 
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving cart data:', error);
    }
  }
};

/**
 * Clear cart data from local storage and optionally from database
 */
export const clearCartData = async (userId: string | undefined): Promise<void> => {
  // Remove from local storage
  localStorage.removeItem('rqa_cart');
  
  // If user is logged in, mark cart as completed in database
  if (userId) {
    try {
      const { error } = await supabase.functions.invoke('clear-cart', {
        body: { userId }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error clearing cart data:', error);
    }
  }
};

/**
 * Get saved cart data from local storage
 */
export const getCartData = (): { cartId: string; courseId: string; timestamp: number; userId?: string } | null => {
  const cartData = localStorage.getItem('rqa_cart');
  return cartData ? JSON.parse(cartData) : null;
};
