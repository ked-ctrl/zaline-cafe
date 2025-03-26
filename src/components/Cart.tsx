"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Image from "next/image"

interface CartItem {
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

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCartItems = async () => {
    try {
      setLoading(true)

      // Get user session from cookies
      const userSession = document.cookie
        .split('; ')
        .find(row => row.startsWith('user-session='))
        ?.split('=')[1]

      if (!userSession) {
        toast.error('Please sign in to view your cart')
        return
      }

      const user = JSON.parse(userSession)
      const userId = user.id

      const { data, error } = await supabase
        .from('cart')
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCartItems(data as unknown as CartItem[])
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching cart items:', {
          message: error.message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint
        })
      }
      toast.error('Failed to load cart items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartItems()

    // Set up real-time subscription
    const channel = supabase
      .channel('cart-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart' },
        (payload) => {
          console.log('Real-time update:', payload); // Debugging
          fetchCartItems()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Update quantity
  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) return

      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', itemId)

      if (error) throw error

      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ))
    } catch (error) {
      toast.error('Failed to update quantity')
      console.error('Error:', error)
    }
  }

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setCartItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error('Failed to remove item')
      console.error('Error:', error)
    }
  }

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.menu_item.menu_price * item.quantity,
    0
  )

  return (
<div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>
  
  {loading ? (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
    </div>
  ) : cartItems.length === 0 ? (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">Your cart is empty</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-6">
        {cartItems.map((item) => (
          <motion.div
            key={item.id}
            className="flex items-center gap-6 p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={
                  item.menu_item.menu_image
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/${item.menu_item.menu_image}`
                    : "/images/placeholder-food.png"
                }
                alt={item.menu_item.menu_name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{item.menu_item.menu_name}</h3>
              <p className="text-sm text-gray-500">${item.menu_item.menu_price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="p-2"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                className="w-16 text-center"
                min={1}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                className="p-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveItem(item.id)}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between">
              <p className="text-gray-600">{item.menu_item.menu_name}</p>
              <p className="text-gray-900 font-medium">
                ${(item.menu_item.menu_price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex justify-between">
            <p className="text-gray-600">Total</p>
            <p className="text-xl font-bold text-gray-900">${totalPrice.toFixed(2)}</p>
          </div>
        </div>
        <Button
          className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg"
          onClick={() => toast.success('Checkout functionality coming soon!')}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  )}
</div>
  )
}