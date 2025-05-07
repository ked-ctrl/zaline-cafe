"use client"

import Link from "next/link"
import { Coffee, ShoppingCart, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function CustomerNavbar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear user session
      document.cookie = "user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      
      // Redirect to login
      router.push('/')
      toast.success('Logged out successfully')
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
        <Link href="/customer-menu" className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400 }}>
            <Coffee className="h-6 w-6 text-amber-600" />
          </motion.div>
          <span className="text-xl font-bold">Zelin Café</span>
        </Link>

        {/* Cart and Logout on the right */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
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