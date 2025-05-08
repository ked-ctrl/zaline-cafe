"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Coffee, Home, Users, FolderTree, CoffeeIcon, ShoppingCart, BarChart3, LogOut } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear admin session cookie
      document.cookie = "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      
      // Redirect to admin login
      router.push('/')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 px-3 py-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400 }}>
                <Coffee className="h-6 w-6 text-brown-600" />
              </motion.div>
              <span className="text-xl font-bold">Zelin Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
                  <Link href="/admin-dashboard">
                    <BarChart3 className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/users"} tooltip="Users">
                  <Link href="/admin-dashboard/users">
                    <Users className="h-5 w-5" />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/categories"} tooltip="Categories">
                  <Link href="/admin-dashboard/categories">
                    <FolderTree className="h-5 w-5" />
                    <span>Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/food"} tooltip="Food Items">
                  <Link href="/admin-dashboard/food">
                    <CoffeeIcon className="h-5 w-5" />
                    <span>Food Items</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/orders"} tooltip="Orders">
                  <Link href="/admin-dashboard/orders">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-gray-500">admin@zelincafe.com</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-amber-600 hover:text-amber-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {pathname === "/dashboard" && "Dashboard Overview"}
                {pathname === "/dashboard/users" && "User Management"}
                {pathname === "/dashboard/categories" && "Categories"}
                {pathname === "/dashboard/food" && "Food Items"}
                {pathname === "/dashboard/orders" && "Order Management"}
              </h1>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                View Website
              </Link>
            </Button>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

