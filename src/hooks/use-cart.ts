import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserSession } from '@/lib/auth'
import { toast } from 'sonner'
import { TABLES } from '@/config/supabase'
import { MenuItem } from '@/types/menu'

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

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPrice, setTotalPrice] = useState(0)
  const [cartCount, setCartCount] = useState(0)

  const calculateTotalPrice = useCallback((items: CartItem[]): number => {
    return items.reduce(
      (total, item) => total + item.menu_item.menu_price * item.quantity,
      0
    )
  }, [])

  const updateCartState = useCallback((items: CartItem[]) => {
    console.log(items);

    setCartItems(items)
    setTotalPrice(calculateTotalPrice(items))
    const totalItems = items.reduce((total, item) => total + item.quantity, 0)
    setCartCount(totalItems)
  }, [calculateTotalPrice])

  const fetchCartItems = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)

      const userSession = getUserSession()
      if (!userSession) {
        updateCartState([])
        return
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
        .order('created_at', { ascending: false })

      if (error) throw error

      const typedData = data as unknown as CartItem[]
      updateCartState(typedData)
    } catch (error) {
      console.error('Error fetching cart items:', error)
      toast.error('Failed to load cart items')
    } finally {
      setLoading(false)
    }
  }, [updateCartState])

  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLES.CART)
        .update({ quantity })
        .eq('id', itemId)

      if (error) throw error

      await fetchCartItems()
      return true
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
      return false
    }
  }, [fetchCartItems])

  const addToCart = useCallback(async (menuItem: MenuItem, quantity: number = 1): Promise<boolean> => {
    try {
      const userSession = getUserSession()
      if (!userSession) {
        toast.error('Please sign in to add items to cart')
        return false
      }

      const existingItem = cartItems.find(item => item.menu_item_id === menuItem.id)

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        return await updateQuantity(existingItem.id, newQuantity)
      }

      const { error } = await supabase
        .from(TABLES.CART)
        .insert({
          user_id: userSession.id,
          menu_item_id: menuItem.id,
          quantity
        })

      if (error) throw error

      await fetchCartItems()
      return true
    } catch (error) {
      console.error('Error adding item to cart:', error)
      toast.error('Failed to add item to cart')
      return false
    }
  }, [cartItems, updateQuantity, fetchCartItems])

  const removeFromCart = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLES.CART)
        .delete()
        .eq('id', itemId)

      if (error) throw error

      await fetchCartItems() // Fetch updated cart items
      return true
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
      return false
    }
  }, [fetchCartItems])

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      const userSession = getUserSession()
      if (!userSession) return false

      const { error } = await supabase
        .from(TABLES.CART)
        .delete()
        .eq('user_id', userSession.id)

      if (error) throw error

      updateCartState([])
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
      return false
    }
  }, [updateCartState])

  useEffect(() => {
    fetchCartItems()

    const userSession = getUserSession()
    if (!userSession) return

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
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchCartItems, calculateTotalPrice, updateCartState])

  return {
    cartItems,
    loading,
    totalPrice,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCartItems
  }
}