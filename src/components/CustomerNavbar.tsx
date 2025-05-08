"use client"

import Link from "next/link"
import { Coffee, ShoppingCart, LogOut, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { ROUTES } from "@/config/constants"
import { Badge } from "@/components/ui/badge"

/**
 * Customer navigation bar component
 * Displays the main navigation for customer users
 */
export default function CustomerNavbar() {
  const { signOut } = useAuth()
  const { cartCount } = useCart()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      toast.error('Failed to logout')
      console.error('Error:', error)
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo on the left */}
        <Link href={ROUTES.CUSTOMER_MENU} className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 10 }} 
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Coffee className="h-6 w-6 text-amber-600" />
          </motion.div>
          <span className="text-xl font-bold">Zelin Café</span>
        </Link>

        {/* Cart and Logout on the right */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href={ROUTES.ORDER_TRACKING}>
              <PackageSearch className="h-5 w-5" />
              <span className="sr-only">Track Orders</span>
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href={ROUTES.CART}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 bg-amber-600 hover:bg-amber-700 text-white text-xs min-w-[1.2rem] h-[1.2rem] flex items-center justify-center rounded-full p-0"
                >
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Cart ({cartCount} items)</span>
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-amber-600 hover:text-amber-700"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
    </motion.header>
  )
}




