import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserSession } from '@/lib/auth'
import { toast } from 'sonner'
import { TABLES } from '@/config/supabase'
import { Order, OrderStatus } from '@/types/order'
import { useCart } from '@/contexts/CartContext'

export function useOrder() {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { cartItems, totalPrice, clearCart } = useCart()

  const fetchOrders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
  
      const userSession = getUserSession();
      if (!userSession) {
        setOrders([]);
        return;
      }
      
      const enrichOrders = (
        orders: Order[], 
        menuItems: { id: string; menu_name: string; menu_image: string; }[]
      ): Order[] => {
        const menuItemsMap = new Map(
          menuItems.map(item => [item.id, item])
        );
      
        return orders.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            menu_item: {
              id: item.menu_item_id,
              menu_name: menuItemsMap.get(item.menu_item_id)?.menu_name || '',
              menu_image: menuItemsMap.get(item.menu_item_id)?.menu_image || ''
            }
          }))
        }));
      };
      
      const { data, error } = await supabase
        .from(TABLES.ORDERS)
        .select(`
          id,
          user_id,
          status,
          total,
          created_at,
          items
        `)
        .eq('user_id', userSession.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      

      const orders = data as unknown as Order[];
      const allItemIds = orders.flatMap(order => 
        order.items?.map(item => item.menu_item_id) || []
      );
      const uniqueItemIds = [...new Set(allItemIds)];

      const { data: menuItems, error: menuError } = await supabase
        .from('menu')
        .select('id, menu_name, menu_image')
        .in('id', uniqueItemIds);

      if (menuError) throw menuError;

      const enrichedOrders = enrichOrders(orders, menuItems);
      setOrders(enrichedOrders);
  
      if (orders.length > 0) {
        setCurrentOrder(orders[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [])

  const createOrder = useCallback(async (): Promise<string | null> => {
    try {
      const userSession = getUserSession()
      if (!userSession) {
        toast.error('Please sign in to create an order')
        return null
      }

      if (cartItems.length === 0) {
        toast.error('Your cart is empty')
        return null
      }

      const { data: orderData, error: orderError } = await supabase
        .from(TABLES.ORDERS)
        .insert({
          user_id: userSession.id,
          status: 'pending' as OrderStatus,
          total: totalPrice
        })
        .select('id')
        .single()

      console.log("Order Data:", orderData);

      if (orderError) throw orderError

      const orderId = orderData.id

      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.menu_item.menu_price
      }))

      const { error: itemsError } = await supabase
        .from(TABLES.ORDERS)
        .update({
          items: orderItems
        })
        .eq('id', orderId)

      if (itemsError) throw itemsError

      await clearCart()
      
      await fetchOrders()
      
      toast.success('Order created successfully!')
      return orderId
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order')
      return null
    }
  }, [cartItems, totalPrice, clearCart, fetchOrders])

  const getOrderProgress = useCallback((status: OrderStatus) => {
    const statusMap: Record<OrderStatus, { step: number, totalSteps: number, isComplete: boolean }> = {
      'pending': { step: 1, totalSteps: 4, isComplete: false },
      'processing': { step: 2, totalSteps: 4, isComplete: false },
      'brewing': { step: 3, totalSteps: 4, isComplete: false },
      'completed': { step: 4, totalSteps: 4, isComplete: true },
      'cancelled': { step: 0, totalSteps: 4, isComplete: false }
    }

    return {
      ...statusMap[status],
      currentStatus: status
    }
  }, [])

  const fetchOrderById = useCallback(async (orderId: string): Promise<void> => {
    try {
      setLoading(true)

      const { data: order, error } = await supabase
        .from(TABLES.ORDERS)
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error

      const menuItemIds = order.items.map((item: { menu_item_id: any }) => item.menu_item_id);

      const { data: menuItems, error: menuError } = await supabase
        .from('menu')
        .select('id, menu_name, menu_image')
        .in('id', menuItemIds);

      if (menuError) throw menuError

      const menuItemsMap = new Map(
        menuItems.map(item => [item.id, item])
      );

      const enrichedOrder = {
        ...order,
        items: order.items.map((item: { menu_item_id: any }) => ({
          ...item,
          menu_item: {
            id: item.menu_item_id,
            menu_name: menuItemsMap.get(item.menu_item_id)?.menu_name || '',
            menu_image: menuItemsMap.get(item.menu_item_id)?.menu_image || ''
          }
        }))
      };

      setCurrentOrder(enrichedOrder)
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()

    const userSession = getUserSession()
    if (!userSession) return

    const subscription = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.ORDERS,
          filter: `user_id=eq.${userSession.id}`
        },
        async () => {
          await fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchOrders])

  return {
    orders,
    currentOrder,
    loading,
    createOrder,
    fetchOrders,
    fetchOrderById,
    getOrderProgress
  }
}