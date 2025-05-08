"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserSession } from '@/lib/auth';
import { toast } from 'sonner';
import { TABLES } from '@/config/supabase';
import { MenuItem } from '@/types/menu';

export interface CartItem {
  id: string
  user_id: string
  menu_item_id: string
  quantity: number
  menu_item: {
    id: string
    menu_name: string
    menu_price: number
    menu_image: string
    available: boolean
  }
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  totalPrice: number;
  cartCount: number;
  addToCart: (menuItem: MenuItem, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  fetchCartItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const calculateTotalPrice = useCallback((items: CartItem[]): number => {
    return items.reduce(
      (total, item) => total + item.menu_item.menu_price * item.quantity,
      0
    );
  }, []);

  const updateCartState = useCallback((items: CartItem[]) => {
    setCartItems(items);
    setTotalPrice(calculateTotalPrice(items));
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    setCartCount(totalItems);
  }, [calculateTotalPrice]);

  const fetchCartItems = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const userSession = getUserSession();
      if (!userSession) {
        updateCartState([]);
        return;
      }

      const { data, error } = await supabase
        .from(TABLES.CART)
        .select(`
          id,
          user_id,
          menu_item_id,
          quantity,
          menu_item:menu(
            id,
            menu_name,
            menu_price,
            menu_image,
            available
          )
        `)
        .eq('user_id', userSession.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = data as unknown as CartItem[];
      updateCartState(typedData);
    } catch (error) {
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  }, [updateCartState]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return false;

      const quantityDifference = quantity - item.quantity;
      
      setCartCount(prevCount => prevCount + quantityDifference);
      
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      
      setTotalPrice(prevPrice => 
        prevPrice + (item.menu_item.menu_price * quantityDifference)
      );

      const { error } = await supabase
        .from(TABLES.CART)
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      return true;
    } catch (error) {
      toast.error('Failed to update quantity');
      await fetchCartItems();
      return false;
    }
  }, [cartItems, fetchCartItems]);

  const addToCart = useCallback(async (menuItem: MenuItem, quantity: number = 1): Promise<boolean> => {
    try {
      const userSession = getUserSession();
      if (!userSession) {
        toast.error('Please sign in to add items to cart');
        return false;
      }

      const existingItem = cartItems.find(item => item.menu_item_id === menuItem.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // Update cart count immediately for better UX
        setCartCount(prevCount => {
          const newCount = prevCount + quantity;
          return newCount;
        });
        
        // Also update the cartItems state immediately
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: newQuantity } 
              : item
          )
        );
        
        // Update total price immediately
        setTotalPrice(prevPrice => 
          prevPrice + (menuItem.menu_price * quantity)
        );

        const { error } = await supabase
          .from(TABLES.CART)
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;
        
        return true;
      }

      // For new items, create a temporary optimistic item
      const optimisticItem: CartItem = {
        id: `temp-${Date.now()}`,
        user_id: userSession.id,
        menu_item_id: menuItem.id,
        quantity,
        menu_item: {
          id: menuItem.id,
          menu_name: menuItem.menu_name,
          menu_price: menuItem.menu_price,
          menu_image: menuItem.menu_image || '',
          available: menuItem.available
        }
      };

      // Update cart count immediately
      setCartCount(prevCount => {
        const newCount = prevCount + quantity;
        return newCount;
      });
      
      // Update cart items immediately with the optimistic item
      setCartItems(prevItems => [...prevItems, optimisticItem]);
      
      // Update total price immediately
      setTotalPrice(prevPrice => 
        prevPrice + (menuItem.menu_price * quantity)
      );

      const { error } = await supabase
        .from(TABLES.CART)
        .insert({
          user_id: userSession.id,
          menu_item_id: menuItem.id,
          quantity
        });

      if (error) throw error;
      
      await fetchCartItems();
      return true;
    } catch (error) {
      toast.error('Failed to add item to cart');
      await fetchCartItems();
      return false;
    }
  }, [cartItems, fetchCartItems]);

  const removeFromCart = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const itemToRemove = cartItems.find(item => item.id === itemId);
      if (!itemToRemove) return false;

      setCartCount(prevCount => prevCount - itemToRemove.quantity);
      
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      setTotalPrice(prevPrice => 
        prevPrice - (itemToRemove.menu_item.menu_price * itemToRemove.quantity)
      );

      const { error } = await supabase
        .from(TABLES.CART)
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      return true;
    } catch (error) {
      toast.error('Failed to remove item');
      await fetchCartItems();
      return false;
    }
  }, [cartItems, fetchCartItems]);

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      const userSession = getUserSession();
      if (!userSession) return false;

      // Update cart state immediately
      setCartCount(0);
      setCartItems([]);
      setTotalPrice(0);

      const { error } = await supabase
        .from(TABLES.CART)
        .delete()
        .eq('user_id', userSession.id);

      if (error) throw error;

      return true;
    } catch (error) {
      toast.error('Failed to clear cart');
      await fetchCartItems();
      return false;
    }
  }, [fetchCartItems]);

  useEffect(() => {
    fetchCartItems();

    const userSession = getUserSession();
    if (!userSession) return;

    const subscription = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.CART,
          filter: `user_id=eq.${userSession.id}`
        },
        async () => {
          await fetchCartItems();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.CART,
          filter: `user_id=eq.${userSession.id}`
        },
        async () => {
          await fetchCartItems();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: TABLES.CART,
          filter: `user_id=eq.${userSession.id}`
        },
        async () => {
          await fetchCartItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchCartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        totalPrice,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};