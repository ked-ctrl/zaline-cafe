"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Search, Coffee } from "lucide-react"
import { Menu } from "../../../components/Menu"
import { toast } from "sonner"
import CustomerNavbar from "@/components/CustomerNavbar"
import Footer from "../../components/footer"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/hooks/use-cart"

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
  const { addToCart, cartItems } = useCart()
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

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
      const userSession = document.cookie
        .split('; ')
        .find(row => row.startsWith('user-session='))
        ?.split('=')[1]

      if (!userSession) {
        toast.error('Please sign in to add items to cart')
        return
      }

      const success = await addToCart(item)
      if (success) {
        toast.success('Item added to cart')
      } else {
        toast.error('Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

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
      <CustomerNavbar cartItemCount={cartItems.length} />
      
      <main className="flex-1">
        <div className="container px-4 md:px-6 mx-auto py-8">
          {fullName && (
            <div className="mb-4 text-center text-lg font-medium">
              Welcome, {fullName}!
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center mb-8 gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search menu..."
                className="pl-8 w-full bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-full md:w-48 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 focus:outline-none"
              >
                <span>All</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {isCategoryOpen && (
                <div className="absolute right-0 mt-2 w-full md:w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category)
                        setIsCategoryOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 text-left ${activeCategory === category ? 'bg-red-100' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
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