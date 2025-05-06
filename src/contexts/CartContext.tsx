
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the cart item structure
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Define the context structure
interface CartContextProps {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Create the context with default values
const CartContext = createContext<CartContextProps>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
});

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((currentItems) => {
      // Check if item already exists
      const itemIndex = currentItems.findIndex((i) => i.id === item.id);
      
      if (itemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...currentItems];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity + item.quantity,
        };
        return updatedItems;
      } else {
        // Add new item
        return [...currentItems, item];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for easy context consumption
export const useCart = () => useContext(CartContext);
