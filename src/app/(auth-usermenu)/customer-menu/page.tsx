"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Coffee } from "lucide-react"
import { Menu } from "../../../components/Menu"
import { toast } from "sonner"
import CustomerNavbar from "@/components/CustomerNavbar"
import Footer from "../../components/footer"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/contexts/CartContext"

interface MenuItem {
  id: string
  menu_name: string
  menu_description: string
  menu_price: number
  menu_category: string
  menu_image: string
  available: boolean
  featured: boolean
  stock: number
}

export default function CustomerMenu() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState<string | null>(null)
  const { addToCart } = useCart()

  // Fetch user session on component mount
  useEffect(() => {
    const userSession = document.cookie
      .split('; ')
      .find(row => row.startsWith('user-session='))
      ?.split('=')[1]

    if (userSession) {
      const user = JSON.parse(userSession)
      setFullName(user.full_name)
    }
  }, [])

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('menu')
          .select('*')
          .order('menu_name')

        if (error) throw error

        if (data) {
          setMenuItems(data as MenuItem[])
          const uniqueCategories = [...new Set(data.map((item: MenuItem) => item.menu_category))]
          setCategories(['All', ...uniqueCategories])
        }
      } catch (error) {
        toast.error('Failed to load menu')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  const handleAddToCart = async (item: MenuItem) => {
    try {
      // Get user session from cookies to check if user is logged in
      const userSession = document.cookie
        .split('; ')
        .find(row => row.startsWith('user-session='))
        ?.split('=')[1];
  
      if (!userSession) {
        toast.error('Please sign in to add items to cart');
        return;
      }
  
      // Use the useCart hook's addToCart function
      const success = await addToCart(item);
      
      if (success) {
        toast.success('Item added to cart');
      } else {
        toast.error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };
  
  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.menu_description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = activeCategory === "All" || item.menu_category === activeCategory

    return matchesSearch && matchesCategory
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      
      <main className="flex-1">
        <div className="container px-4 md:px-6 mx-auto py-8">
          {/* Add a welcome message */}
          {fullName && (
            <div className="mb-4 text-center text-lg font-medium">
              Welcome, {fullName}!
            </div>
          )}

          <div className="flex flex-wrap items-center mb-8 gap-4">
            <div className="flex flex-1 min-w-[200px] max-w-full items-center gap-4">
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search menu..."
                  className="pl-8 w-full bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="overflow-auto flex-1">
                <Tabs defaultValue="All" onValueChange={setActiveCategory} className="w-full">
                  <TabsList className="flex flex-nowrap overflow-x-auto bg-amber-50 border border-amber-200">
                    {categories.map((category) => (
                      <TabsTrigger 
                        key={category} 
                        value={category} 
                        className="whitespace-nowrap data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Coffee className="h-8 w-8 animate-spin text-amber-600" />
              <span className="ml-2">Loading menu...</span>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <Menu 
                items={filteredItems} 
                onAddToCart={handleAddToCart} 
              />
            </motion.div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Coffee className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-800">No items found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}