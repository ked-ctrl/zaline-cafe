"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"

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

interface MenuProps {
  items: MenuItem[]
  onAddToCart?: (item: MenuItem) => void
  isAdmin?: boolean
  onEdit?: (item: MenuItem) => void
  onDelete?: (item: MenuItem) => void
}

export function Menu({ items, onAddToCart, isAdmin = false, onEdit, onDelete }: MenuProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <>
      {items.map((item) => (
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
              <p className="text-lg font-bold text-amber-600">${item.menu_price.toFixed(2)}</p>
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.menu_category}</p>
            <p className="text-sm mt-2 text-gray-600 line-clamp-2">{item.menu_description}</p>
            <div className="mt-4 flex gap-2">
              {isAdmin ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => onEdit?.(item)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => onDelete?.(item)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
<Button 
  className="w-full bg-amber-600 hover:bg-amber-700"
  onClick={async () => {
    // Get user session from cookies
    const userSession = document.cookie
      .split('; ')
      .find(row => row.startsWith('user-session='))
      ?.split('=')[1]

    if (!userSession) {
      toast.error('Please sign in to add items to cart')
      return
    }

    console.log('Add to Cart button clicked for:', item.menu_name); // Debugging
    onAddToCart?.(item)
  }}
  disabled={!item.available}
>
  {item.available ? 'Add to Cart' : 'Out of Stock'}
</Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </>
  )
} 