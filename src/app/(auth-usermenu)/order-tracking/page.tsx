"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CustomerNavbar from "@/components/CustomerNavbar"
import Footer from "../../components/footer"
import { useOrder } from "@/hooks/use-order"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, Coffee, PackageSearch, ShoppingBag } from "lucide-react"
import { ROUTES } from "@/config/constants"
import { Order, OrderStatus } from "@/types/order"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrderTrackingPage() {
  const router = useRouter()
  const { orders, currentOrder, loading, fetchOrders, fetchOrderById, getOrderProgress } = useOrder()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (selectedOrderId) {
      fetchOrderById(selectedOrderId)
    } else if (orders.length > 0) {
      setSelectedOrderId(orders[0].id)
    }
  }, [selectedOrderId, orders, fetchOrderById])

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

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'brewing':
        return 'bg-amber-100 text-amber-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <PackageSearch className="h-6 w-6 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" role="status"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <PackageSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Button 
              onClick={() => router.push(ROUTES.CUSTOMER_MENU)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List - Left Side */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Your Orders</CardTitle>
                  <CardDescription>
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div 
                        key={order.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedOrderId === order.id 
                            ? 'bg-amber-50 border border-amber-200' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status as OrderStatus)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-sm">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                          <p className="font-semibold">₱{order.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Details - Right Side */}
            <div className="lg:col-span-2">
              {currentOrder && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Order #{currentOrder.id}</CardTitle>
                        <CardDescription>
                          Placed on {formatDate(currentOrder.created_at)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(currentOrder.status as OrderStatus)}`}>
                          {currentOrder.status}
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
                                currentOrder.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-600'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(getOrderProgress(currentOrder.status as OrderStatus).step / getOrderProgress(currentOrder.status as OrderStatus).totalSteps) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          
                          {/* Progress steps */}
                          <div className="flex justify-between">
                            <div className="text-center">
                              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                                getOrderProgress(currentOrder.status as OrderStatus).step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-400'
                              }`}>
                                <ShoppingBag className="h-5 w-5" />
                              </div>
                              <div className="text-xs mt-2">Received</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                                getOrderProgress(currentOrder.status as OrderStatus).step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-400'
                              }`}>
                                <Clock className="h-5 w-5" />
                              </div>
                              <div className="text-xs mt-2">Processing</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                                getOrderProgress(currentOrder.status as OrderStatus).step >= 3 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-400'
                              }`}>
                                <Coffee className="h-5 w-5" />
                              </div>
                              <div className="text-xs mt-2">Brewing</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                                getOrderProgress(currentOrder.status as OrderStatus).step >= 4 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
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
                        {getStatusIcon(currentOrder.status as OrderStatus)}
                        <div>
                          <h4 className="font-medium">
                            {currentOrder.status === 'completed' ? 'Your order is ready!' :
                             currentOrder.status === 'cancelled' ? 'Order cancelled' :
                             'Order in progress'}
                          </h4>
                          <p className="text-sm text-gray-600">{getStatusDescription(currentOrder.status as OrderStatus)}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Order Items */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Order Items</h3>
                        <div className="space-y-4">
                          {currentOrder && currentOrder.items ? (
                            currentOrder.items.map((item) => {
                              const itemKey = item.id || 
                                            item.menu_item_id || 
                                            `${currentOrder.id}-${item.menu_item?.menu_name}-${item.quantity}`;
                              
                              return (
                                <div 
                                  key={itemKey}
                                  className="flex items-center gap-4"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium">{item.menu_item?.menu_name}</p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      ₱{(item.unit_price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-gray-500">No items in this order</p>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Order Total */}
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Total</p>
                        <p className="font-bold text-xl">₱{currentOrder && currentOrder.total}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pt-4">
                    <Button 
                      onClick={() => router.push(ROUTES.CUSTOMER_MENU)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Order More
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}