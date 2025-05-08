/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { JSX, Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import CustomerNavbar from "@/components/CustomerNavbar"
import Footer from "../../components/footer"
import { useOrder } from "@/hooks/use-order"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, Coffee, ShoppingBag } from "lucide-react"
import { ROUTES } from "@/config/constants"
import { OrderStatus } from "@/types/order"
import Image from "next/image"
import { SUPABASE_CONFIG } from "@/config/supabase"
import { STORAGE } from "@/config/constants"
import { motion } from "framer-motion"

export default function CheckoutPage()
{
   return (
     <Suspense>
        <Checkout />
     </Suspense>
   )
} 

function Checkout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const { cartItems, totalPrice, loading: cartLoading } = useCart()
  const { createOrder, currentOrder, fetchOrderById, getOrderProgress, loading: orderLoading } = useOrder()
  
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  useEffect(() => {
    // If we have an orderId in the URL, fetch that order
    if (orderId) {
      fetchOrderById(orderId)
    }
  }, [orderId, fetchOrderById])

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true)
    try {
      const newOrderId = await createOrder()
      if (newOrderId) {
        router.push(`${ROUTES.ORDER_CONFIRMATION}?orderId=${newOrderId}`)
      }
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <ShoppingBag className="h-6 w-6 text-amber-600" />
      case 'processing':
        return <Clock className="h-6 w-6 text-blue-600" />
      case 'brewing':
        return <Coffee className="h-6 w-6 text-amber-600" />
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />
      case 'cancelled':
        return <div className="h-6 w-6 text-red-600">✕</div>
      default:
        return <ShoppingBag className="h-6 w-6 text-amber-600" />
    }
  }

  const getStatusDescription = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return "Your order has been received and is waiting to be processed."
      case 'processing':
        return "We're preparing your order now."
      case 'brewing':
        return "Your coffee is brewing to perfection!"
      case 'completed':
        return "Your order is ready for pickup. Enjoy!"
      case 'cancelled':
        return "This order has been cancelled."
      default:
        return "Order status unknown."
    }
  }

  const loading = cartLoading || orderLoading || isCreatingOrder

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : orderId && currentOrder ? (
          <OrderDetails order={currentOrder} getOrderProgress={getOrderProgress} getStatusIcon={getStatusIcon} getStatusDescription={getStatusDescription} />
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Button 
              onClick={() => router.push(ROUTES.CUSTOMER_MENU)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review your items before placing your order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={
                              item.menu_item.menu_image
                                ? `${SUPABASE_CONFIG.URL}/storage/v1/object/public/${STORAGE.BUCKETS.MENU_IMAGES}/${item.menu_item.menu_image}`
                                : "/images/placeholder-food.png"
                            }
                            alt={item.menu_item.menu_name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.menu_item.menu_name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₱{(item.menu_item.menu_price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <p className="font-semibold">Total</p>
                  <p className="font-bold text-xl">₱{totalPrice.toFixed(2)}</p>
                </CardFooter>
              </Card>
            </div>
            
            {/* Place Order */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Place Your Order</CardTitle>
                  <CardDescription>Confirm and submit your order</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    By placing your order, you agree to our terms and conditions. Your order will be prepared once confirmed.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

interface OrderDetailsProps {
  order: any;
  getOrderProgress: (status: OrderStatus) => any;
  getStatusIcon: (status: OrderStatus) => JSX.Element;
  getStatusDescription: (status: OrderStatus) => string;
}

function OrderDetails({ order, getOrderProgress, getStatusIcon, getStatusDescription }: OrderDetailsProps) {
  const progress = getOrderProgress(order.status as OrderStatus)
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
              <CardDescription>
                Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                order.status === 'brewing' ? 'bg-amber-100 text-amber-800' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Order Progress */}
            <div>
              <h3 className="text-lg font-medium mb-4">Order Progress</h3>
              <div className="relative">
                {/* Progress bar */}
                <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
                  <motion.div 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      order.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.step / progress.totalSteps) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                {/* Progress steps */}
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                      progress.step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="text-xs mt-2">Received</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                      progress.step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="text-xs mt-2">Processing</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                      progress.step >= 3 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Coffee className="h-5 w-5" />
                    </div>
                    <div className="text-xs mt-2">Brewing</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                      progress.step >= 4 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-xs mt-2">Completed</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status message */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              {getStatusIcon(order.status as OrderStatus)}
              <div>
                <h4 className="font-medium">
                  {order.status === 'completed' ? 'Your order is ready!' :
                   order.status === 'cancelled' ? 'Order cancelled' :
                   'Order in progress'}
                </h4>
                <p className="text-sm text-gray-600">{getStatusDescription(order.status as OrderStatus)}</p>
              </div>
            </div>
            
            <Separator />
            
            {/* Order Items */}
            <div>
              <h3 className="text-lg font-medium mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={
                          item.menu_item.menu_image
                            ? `${SUPABASE_CONFIG.URL}/storage/v1/object/public/${STORAGE.BUCKETS.MENU_IMAGES}/${item.menu_item.menu_image}`
                            : "/images/placeholder-food.png"
                        }
                        alt={item.menu_item.menu_name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.menu_item.menu_name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₱{(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Order Total */}
            <div className="flex justify-between items-center">
              <p className="font-semibold">Total</p>
              <p className="font-bold text-xl">₱{order.total_amount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}