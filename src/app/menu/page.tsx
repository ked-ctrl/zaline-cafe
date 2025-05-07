"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Coffee, Search, QrCode, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import HeroBackground from "../../../public/images/gallerySection/aboutBG.jpg"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

// Define the MenuItem type
interface MenuItem {
  id: number
  menu_name: string
  menu_description: string | null
  menu_price: number
  menu_category: string
  menu_image: string
  available: boolean
  featured: boolean
  stock: number
}

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>(["All", "NON-CAFFEINATED", "FOOD", "CAFFEINATED"])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [qrValue, setQrValue] = useState('')
  const [sortBy, setSortBy] = useState("Name")
  const [sortOrder, setSortOrder] = useState("Ascending")
  const [isSortOpen, setIsSortOpen] = useState(false)
  const router = useRouter()

  // Fetch menu items from Supabase
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
        }
      } catch (error) {
        toast.error('Failed to load menu items')
        console.error('Error fetching menu items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  // Filter and sort menu items
  const filteredItems = menuItems
    .filter((item) => {
      const matchesSearch =
        item.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.menu_description || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = activeCategory === "All" || item.menu_category === activeCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let valueA, valueB
      switch (sortBy) {
        case "Name":
          valueA = a.menu_name
          valueB = b.menu_name
          break
        case "Price":
          valueA = a.menu_price
          valueB = b.menu_price
          break
        default:
          valueA = a.menu_name
          valueB = b.menu_name
      }
      if (sortOrder === "Ascending") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })

  // Generate QR code URL
  const generateQR = () => {
    const port = window.location.port || '3000'
    const ipAddress = window.location.hostname === 'localhost' 
      ? getLocalIPAddress() 
      : window.location.hostname
    const url = `http://${ipAddress}:${port}/menu`
    setQrValue(url)
    setShowQR(true)
  }

  const getLocalIPAddress = () => {
    const interfaces = require('os').networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address
        }
      }
    }
    return 'localhost'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 bg-gradient-to-b from-amber-200/60 to-amber-700/90 text-white">
          <div className="absolute inset-0 -z-10">
            <Image
              src={HeroBackground}
              alt="Coffee beans background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          <div className="container px-4 md:px-6 mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">Our Menu</h1>
              <p className="mt-4 text-gray-300 md:text-xl">
                Explore our handcrafted beverages and delicious food items, made with the finest ingredients and love.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Menu Section */}
        <section className="py-12 bg-gradient-to-b from-amber-50 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search menu..."
                    className="pl-8 w-full bg-white border border-gray-300 rounded-md focus:border-amber-500 focus:ring-amber-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto">
                  <TabsList className="bg-amber-50 border border-amber-200 rounded-md p-1 flex space-x-1">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="whitespace-nowrap px-3 py-1 text-sm rounded-md data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-amber-800 font-medium text-sm md:text-base">Sort By:</span>
                <div className="relative w-full md:w-48">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center justify-between w-full px-4 py-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 hover:bg-amber-100 focus:outline-none shadow-sm transition-all duration-200"
                  >
                    <span className="font-medium">{sortBy} ({sortOrder})</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {isSortOpen && (
                    <div className="absolute z-10 mt-2 w-48 bg-white border border-amber-200 rounded-lg shadow-lg">
                      <div className="py-2">
                        <button
                          onClick={() => { setSortBy("Name"); setIsSortOpen(false); }}
                          className={`block w-full px-4 py-2 text-sm text-gray-800 hover:bg-amber-50 ${sortBy === "Name" ? "bg-amber-100 font-semibold" : ""}`}
                        >
                          Name
                        </button>
                        <button
                          onClick={() => { setSortBy("Price"); setIsSortOpen(false); }}
                          className={`block w-full px-4 py-2 text-sm text-gray-800 hover:bg-amber-50 ${sortBy === "Price" ? "bg-amber-100 font-semibold" : ""}`}
                        >
                          Price
                        </button>
                      </div>
                      <div className="py-2 border-t border-amber-200">
                        <button
                          onClick={() => { setSortOrder("Ascending"); setIsSortOpen(false); }}
                          className={`flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-amber-50 ${sortOrder === "Ascending" ? "bg-amber-100 font-semibold" : ""}`}
                        >
                          <ArrowUp className="w-4 h-4 mr-2" />
                          Ascending
                        </button>
                        <button
                          onClick={() => { setSortOrder("Descending"); setIsSortOpen(false); }}
                          className={`flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-amber-50 ${sortOrder === "Descending" ? "bg-amber-100 font-semibold" : ""}`}
                        >
                          <ArrowDown className="w-4 h-4 mr-2" />
                          Descending
                        </button>
                      </div>
                    </div>
                  )}
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
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="rounded-lg border border-amber-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={item.menu_image ? 
                          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/${item.menu_image}`
                          : "/images/placeholder-food.png"
                        }
                        alt={item.menu_name}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {item.featured && <Badge className="bg-amber-600 hover:bg-amber-700">Featured</Badge>}
                        {!item.available && <Badge className="bg-gray-900 hover:bg-gray-800">Out of Stock</Badge>}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">{item.menu_name}</h3>
                        <p className="text-lg font-bold text-amber-600">₱{item.menu_price.toFixed(2)}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.menu_category}</p>
                      <p className="text-sm mt-2 text-gray-600 line-clamp-2">{item.menu_description}</p>
                      <div className="mt-4">
                        <Button 
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          onClick={() => {
                            router.push('/login')
                          }}
                          disabled={!item.available}
                        >
                          {item.available ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
        </section>
      </main>

      <Footer />
    </div>
  )
}