"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import CustomerNavbar from "@/components/CustomerNavbar"
import Footer from "../../components/footer"
import { useOrder } from "@/hooks/use-order"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, Coffee, ShoppingBag } from "lucide-react"
import { ROUTES } from "@/config/constants"
import { OrderStatus } from "@/types/order"
import { motion } from "framer-motion"

export default function OrderConfirmationPage()
{
  return (
    <Suspense>
      <OrderConfirmation />
    </Suspense>
  )
}

function OrderConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const { currentOrder, fetchOrderById, getOrderProgress, loading: orderLoading } = useOrder()
  
  useEffect(() => {
    // If we have an orderId in the URL, fetch that order
    if (orderId) {
      fetchOrderById(orderId)
    } else {
      // If no orderId is provided, redirect to the customer menu
      router.push(ROUTES.CUSTOMER_MENU)
    }
  }, [orderId, fetchOrderById, router])

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

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Order Confirmation</h1>
        
        {orderLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" role="status"></div>
          </div>
        ) : !currentOrder ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Order not found</p>
            <Button 
              onClick={() => router.push(ROUTES.CUSTOMER_MENU)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Order Success Message */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-100 flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h2>
              <p className="text-gray-600 mb-4">
                Your order #{currentOrder.id} has been successfully placed.
              </p>
              <p className="text-sm text-gray-500">
                You will receive updates on your order status.
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Order #{currentOrder.id}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(currentOrder.created_at).toLocaleDateString()} at {new Date(currentOrder.created_at).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                      currentOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      currentOrder.status === 'brewing' ? 'bg-amber-100 text-amber-800' :
                      currentOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
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
                      { currentOrder && currentOrder.items ? (
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
                  className="bg-amber-600 hover:bg-amber-700 mr-4"
                >
                  Order More
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push(ROUTES.HOME)}
                >
                  Return to Home
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}